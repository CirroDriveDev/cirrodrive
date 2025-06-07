import { injectable } from "inversify"
import { Redis } from "ioredis"
import ms from "ms"

@injectable()
export class RateLimitService {
  constructor(private readonly redis: Redis) {}

  // IP와 요청 경로를 기반으로 Redis 키 생성
  private getKeyByIp(ip: string, pathname: string) {
    return `ratelimit:ip:${ip}:${pathname}`
  }

  // 세션 토큰과 요청 경로를 기반으로 Redis 키 생성
  private getKeyBySession(sessionToken: string, pathname: string) {
    return `ratelimit:session:${sessionToken}:${pathname}`
  }

  /**
   * IP + 세션 토큰 기반으로 하루 요청 횟수 제한 확인
   * - limit: 하루 5회
   * - 세션이 있으면 IP + 세션 키 각각 확인
   * - 초과 시 예외 발생
   */
  async checkLimit(ip: string, pathname: string, sessionToken?: string | null): Promise<void> {
    const duration = ms("1d") / 1000 // 1일 (초 단위)
    const limit = 5

    const keys = sessionToken
      ? [
          this.getKeyByIp(ip, pathname),
          this.getKeyBySession(sessionToken, pathname),
        ]
      : [this.getKeyByIp(ip, pathname)]

    for (const key of keys) {
      const count = await this.redis.incr(key) // 카운터 증가
      if (count === 1) {
        await this.redis.expire(key, duration) // 첫 요청 시 만료시간 설정
      }

      if (count > limit) {
        throw new Error("요청 한도를 초과했습니다. 내일 다시 시도해주세요.")
      }
    }
  }

  /**
   * 로그인 실패 횟수 제한 확인
   * - 10분 동안 5회까지 허용
   * - 초과 시 제한 시간 안내 메시지와 함께 예외 발생
   */
  async checkLoginFailLimit(ip: string): Promise<void> {
    const key = `ratelimit:loginfail:${ip}`
    const limit = 5
    const duration = ms("10m") / 1000

    const count = await this.redis.incr(key)
    if (count === 1) {
      await this.redis.expire(key, duration)
    }

    if (count > limit) {
      const ttl = await this.redis.ttl(key)
      const minutes = Math.ceil(ttl / 60)
      throw new Error(`로그인 시도 한도를 초과했습니다. 약 ${minutes}분 후 다시 시도해주세요.`)
    }
  }

  /**
   * 요청 로그 기록
   * - 로그 키: log:{ip}:{timestamp}
   * - 내용: IP, 세션 토큰, 경로, User-Agent
   * - TTL: 1시간
   */
  async logRequest({
    ip,
    sessionToken,
    pathname,
    userAgent,
  }: {
    ip: string
    sessionToken: string | null
    pathname: string
    userAgent: string
  }): Promise<void> {
    const logKey = `log:${ip}:${Date.now()}`
    await this.redis.set(
      logKey,
      JSON.stringify({ ip, sessionToken, pathname, userAgent }),
      "EX",
      60 * 60 // 1시간
    )
  }

  /**
   * 세션 없이 IP만으로 요청 횟수 제한 확인 (비회원용)
   * - 하루 5회까지 허용
   * - 초과 시 남은 제한 시간 안내와 함께 예외 발생
   */
  async checkIpOnlyLimit(ip: string): Promise<void> {
    const key = `ratelimit:iponly:${ip}`
    const limit = 5
    const duration = ms("1d") / 1000

    const count = await this.redis.incr(key)
    if (count === 1) {
      await this.redis.expire(key, duration)
    }

    if (count > limit) {
      const ttl = await this.redis.ttl(key)
      const hours = Math.floor(ttl / 3600)
      const minutes = Math.ceil((ttl % 3600) / 60)
      throw new Error(`요청 한도를 초과했습니다. 약 ${hours}시간 ${minutes}분 후 다시 시도해주세요.`)
    }
  }
}
