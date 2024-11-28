import { Injectable } from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'

import * as svgCaptcha from 'svg-captcha'

@Injectable()
export class CaptchaService {
  private captchaGroupKey = 'captcha'

  constructor (
    private readonly redisService: RedisService
  ) {
  }

  /**
   * 生成验证码
   */
  async generateCaptcha (id: string) {
    const captcha = svgCaptcha.create({
      size: 4,
      noise: 2,
      width: 90,
      color: true
    })
    await this.redisService.set(`${this.captchaGroupKey}:${id}`, captcha.text, 300) // 存储验证码，有效期 300 秒
    return {
      svg: captcha.data,
      id,
      text: captcha.text
    }
  }

  /**
   * 校验验证码是否有效
   */
  async validateCaptcha (id: string, captchaText: string) {
    if (id && captchaText) {
      const res = await this.redisService.get(`${this.captchaGroupKey}:${id}`)
      const valid = res?.toLowerCase() === captchaText?.toLowerCase()
      if (valid) {
        this.redisService.del(id)
      }
      return valid
    }
    return false
  }
}
