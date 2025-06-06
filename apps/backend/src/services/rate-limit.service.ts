// src/services/rate-limit.service.ts

import { injectable } from "inversify";

@injectable()
export class RateLimitService {
  async checkLimit(_ip: string, _sessionToken: string | null): Promise<void> {
  // 아직 구현 안 함
  }


    async logRequest({
    ip: _ip,
    sessionToken: _sessionToken,
    pathname: _pathname,
    userAgent: _userAgent,
  }: {
    ip: string;
    sessionToken: string | null;
    pathname: string;
    userAgent: string;
  }): Promise<void> {
    // 아직 구현 안 함
  }

    
  }
