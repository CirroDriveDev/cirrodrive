import { SESClient } from "@aws-sdk/client-ses";

// SES 클라이언트 설정 (AWS SES 리전은 본인의 리전으로 설정하세요)
export const sesClient = new SESClient({ region: "ap-northeast-2" }); // 리전 설정
