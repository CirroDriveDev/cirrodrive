import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { Symbols } from "@/types/symbols.ts";
import { sesClient } from "@/loaders/ses.ts";

/**
 * 이메일 서비스입니다.
 */
@injectable()
export class EmailService {
  private verificationCodes: Map<string, string>;

  constructor(@inject(Symbols.Logger) private logger: Logger) {
    this.logger = logger.child({ prefix: "EmailService" });
    this.verificationCodes = new Map();
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
      Source: "your-verified-email@example.com", // SES에서 확인된 이메일 주소
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
   * @param code - 인증 코드
   */
  public async sendVerificationCode({
    to,
    code,
  }: {
    to: string;
    code: string;
  }): Promise<void> {
    const subject = "이메일 인증 코드";
    const body = `인증 코드: ${code}`;
    this.logger.info({ to, code }, "인증 코드 이메일 전송 중");

    try {
      await this.sendEmail({ to, subject, body });
      this.verificationCodes.set(to, code); // 인증 코드 저장
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
  public verifyEmailCode(email: string, code: string): boolean {
    const storedCode = this.verificationCodes.get(email); // 저장된 인증 코드 가져오기

    if (storedCode === code) {
      this.logger.info({ email }, "이메일 인증 성공");
      this.verificationCodes.delete(email); // 인증 성공 시 코드 삭제
      return true;
    }

    this.logger.error({ email }, "잘못된 인증 코드");
    return false;
  }
}
