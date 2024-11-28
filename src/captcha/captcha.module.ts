import { Module } from '@nestjs/common'
import { CaptchaService } from './captcha.service'
import { RedisModule } from 'src/redis/redis.module'

/**
 * 验证码模块
 */
@Module({
  imports: [RedisModule],
  providers: [CaptchaService],
  exports: [CaptchaService]
})
export class CaptchaModule {}
