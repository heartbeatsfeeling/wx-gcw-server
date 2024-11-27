import { Module, Global } from '@nestjs/common'
import { Redis } from 'ioredis'
import { RedisService } from './redis.service'

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: 'localhost',
          port: 6379,
          password: ''
        })
      }
    },
    RedisService // 注册 RedisService
  ],
  exports: ['REDIS_CLIENT', RedisService] // 确保导出
})
export class RedisModule {}
