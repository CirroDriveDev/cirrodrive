import { SESClient } from "@aws-sdk/client-ses";

export const sesClient = new SESClient({ region: "ap-northeast-2" });
