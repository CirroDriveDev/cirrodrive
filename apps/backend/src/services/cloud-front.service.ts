import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { inject, injectable } from "inversify";
import { env } from "#loaders/env.loader";
import { FileService } from "#services/file.service";
import { S3Service } from "#services/s3.service";

@injectable()
export class CloudFrontService {
  constructor(
    @inject(FileService) private readonly fileService: FileService,
    @inject(S3Service) private readonly s3Service: S3Service,
    private readonly expiresInSeconds: number,
    private readonly DOMAIN: string,
    private readonly KEY_PAIR_ID: string,
    private readonly PRIVATE_KEY: string,
  ) {
    this.expiresInSeconds = env.AWS_CLOUDFRONT_EXPIRES_IN_SECONDS;
    this.DOMAIN = env.AWS_CLOUDFRONT_DOMAIN;
    this.KEY_PAIR_ID = env.AWS_CLOUDFRONT_KEY_PAIR_ID;
    this.PRIVATE_KEY = env.AWS_CLOUDFRONT_PRIVATE_KEY;
  }

  public createSignedUrl(
    key: string,
    options?: {
      expiresInSeconds?: number;
    },
  ): string {
    const url = `https://${this.DOMAIN}${key}`;
    const expiresInSeconds = options?.expiresInSeconds ?? this.expiresInSeconds;
    const dateLessThan = new Date(Date.now() + expiresInSeconds * 1000);
    const dateGreaterThan = new Date(Date.now() - 60 * 1000); // 1 minute before now

    return getSignedUrl({
      url,
      dateLessThan,
      dateGreaterThan,
      keyPairId: this.KEY_PAIR_ID,
      privateKey: this.PRIVATE_KEY,
    });
  }
}
