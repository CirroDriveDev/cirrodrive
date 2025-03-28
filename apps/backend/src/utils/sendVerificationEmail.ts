// src/utils/sendVerificationEmail.ts
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { type Logger } from "pino";
import { sesClient } from "@/utils/sesClient.ts"; // AWS SES 클라이언트 설정

export const sendVerificationEmail = async (
  toEmail: string,
  code: string,
  logger: Logger,
): Promise<void> => {
  const command = new SendEmailCommand({
    Source: "your-verified-email@example.com", // AWS SES에서 확인된 이메일 주소
    Destination: { ToAddresses: [toEmail] },
    Message: {
      Subject: { Data: "이메일 인증 코드" },
      Body: {
        Text: { Data: `인증 코드: ${code}` },
      },
    },
  });

  try {
    await sesClient.send(command);
    logger.info(`인증 코드 ${code}가 ${toEmail}로 전송되었습니다.`);
  } catch (error) {
    logger.error({ email: toEmail, error }, "이메일 전송 실패");
    throw error;
  }
};
