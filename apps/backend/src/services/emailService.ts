import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import type { Prisma } from "@cirrodrive/database";
import { SignJWT } from "jose"; // jose 추가
import { Symbols } from "@/types/symbols.ts";
import { sesClient } from "@/loaders/aws.ts";
import { generateVerificationCode } from "@/utils/generateVerificationCode.ts";
import { createSecretKey } from "@/utils/jwt.ts"; // JWT 비밀키 유틸리티 추가
import { env } from "@/loaders/env.ts";

/**
 * 이메일 서비스입니다.
 */
@injectable()
export class EmailService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.VerificationCodeModel)
    private verificationCodeModel: Prisma.VerificationCodeDelegate,
  ) {
    this.logger = logger.child({ serviceName: "EmailService" });
  }

  /**
   * 이메일을 전송합니다.
   *
   * @param to - 수신자 이메일 주소
   * @param subject - 이메일 제목
   * @param body - 이메일 본문
   */
  public async sendEmail({
    to,
    subject,
    body,
  }: {
    to: string;
    subject: string;
    body: string;
  }): Promise<void> {
    this.logger.info({ to, subject }, "이메일 전송 중");

    const params = new SendEmailCommand({
      Source: env.AWS_SES_SOURCE_EMAIL,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: {
          Text: { Data: body },
        },
      },
    });

    try {
      await sesClient.send(params);
      this.logger.info({ to, subject }, "이메일 전송 성공");
    } catch (error) {
      this.logger.error({ error, to, subject }, "이메일 전송 실패");
      throw error;
    }
  }

  /**
   * 인증 코드를 이메일로 전송합니다.
   *
   * @param to - 수신자 이메일 주소
   */
  public async sendVerificationCode({ to }: { to: string }): Promise<void> {
    if (import.meta.env.DEV) {
      this.logger.warn("개발 환경에서는 이메일 전송을 건너뜁니다.");
      return;
    }
    const code = generateVerificationCode(); // 6자리 인증 코드 생성
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료
    const subject = "이메일 인증 코드";
    const body = `인증 코드: ${code}`;

    this.logger.info({ to, code }, "인증 코드 이메일 전송 중");

    try {
      // 기존 코드 삭제 후 새 코드 저장 (중복 방지)
      await this.verificationCodeModel.upsert({
        where: { email: to },
        update: { code, expiresAt },
        create: { email: to, code, expiresAt },
      });

      // 이메일 발송
      await this.sendEmail({ to, subject, body });
      this.logger.info({ to, code }, "인증 코드 이메일 전송 성공");
    } catch (error) {
      this.logger.error({ error, to, code }, "인증 코드 이메일 전송 실패");
      throw error;
    }
  }

  /**
   * 이메일 인증 코드를 검증하고 JWT를 생성합니다.
   *
   * @param email - 이메일 주소
   * @param code - 인증 코드
   * @returns 인증 성공 시 JWT 토큰
   * @throws 인증 실패 시 오류
   */
  public async verifyEmailCode(email: string, code: string): Promise<string> {
    if (import.meta.env.DEV) {
      this.logger.warn("개발 환경에서는 이메일 인증을 건너뜁니다.");
      const secretKey = createSecretKey();
      const token = await new SignJWT({ email })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("10m")
        .sign(secretKey);
      return token;
    }

    const record = await this.verificationCodeModel.findUnique({
      where: { email },
    });

    if (!record || record.code !== code || record.expiresAt < new Date()) {
      this.logger.error({ email }, "잘못된 인증 코드 또는 만료됨");
      throw new Error("잘못된 인증 코드이거나 만료되었습니다.");
    }

    // 인증 성공 후 코드 삭제
    await this.verificationCodeModel.delete({ where: { email } });
    this.logger.info({ email }, "이메일 인증 성공");

    // JWT 생성
    const secretKey = createSecretKey();
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("10m")
      .sign(secretKey);

    return token;
  }
}
