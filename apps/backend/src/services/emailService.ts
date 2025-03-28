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
  constructor(@inject(Symbols.Logger) private logger: Logger) {
    this.logger = logger.child({ prefix: "EmailService" });
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
      this.logger.info({ to, code }, "인증 코드 이메일 전송 성공");
    } catch (error) {
      this.logger.error({ error, to, code }, "인증 코드 이메일 전송 실패");
      throw error;
    }
  }
}
