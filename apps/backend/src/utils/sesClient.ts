import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// SES 클라이언트 설정 (리전을 본인 리전으로 설정하세요)
export const sesClient = new SESClient({
  region: "ap-northeast-2", // 사용하고 있는 AWS SES 리전 (서울 리전)
});

// 이메일 발송 함수
export const sendVerificationEmail = async (
  toEmail: string,
  code: string,
): Promise<void> => {
  const params = new SendEmailCommand({
    Source: "your-verified-email@example.com", // SES에서 확인된 이메일 주소
    Destination: { ToAddresses: [toEmail] },
    Message: {
      Subject: { Data: "이메일 인증 코드" },
      Body: {
        Text: { Data: `인증 코드: ${code}` }, // 인증 코드 내용
      },
    },
  });

  await sesClient.send(params); // 이메일 전송
};
