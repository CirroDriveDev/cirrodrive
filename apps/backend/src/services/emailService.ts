import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import type { Prisma } from "@cirrodrive/database";
import { Symbols } from "@/types/symbols.ts";
import { sesClient } from "@/loaders/ses.ts";
import { generateVerificationCode } from "@/utils/generateVerificationCode.ts";

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
      Source: import.meta.env.VITE_SES_SOURCE_EMAIL, // 환경변수에서 SES 이메일 주소 가져오기
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
   * 이메일 인증 코드를 검증합니다.
   *
   * @param email - 이메일 주소
   * @param code - 인증 코드
   * @returns 인증 코드가 유효하면 `true`, 그렇지 않으면 `false`
   */
  public async verifyEmailCode(email: string, code: string): Promise<boolean> {
    const record = await this.verificationCodeModel.findUnique({
      where: { email },
    });

    if (!record || record.code !== code || record.expiresAt < new Date()) {
      this.logger.error({ email }, "잘못된 인증 코드 또는 만료됨");
      return false;
    }

    // 인증 성공 후 코드 삭제
    await this.verificationCodeModel.delete({ where: { email } });
    this.logger.info({ email }, "이메일 인증 성공");
    return true;
  }
}
