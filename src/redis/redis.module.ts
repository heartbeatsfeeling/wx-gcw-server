import { Module, Global } from '@nestjs/common'
import { Redis } from 'ioredis'
import { RedisService } from './redis.service'
import { dbConfig } from 'src/common/config'

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: dbConfig.host,
          port: 6379,
          password: 'xtdgjhch1016'
        })
      }
    },
    RedisService // 注册 RedisService
  ],
  exports: ['REDIS_CLIENT', RedisService] // 确保导出
})
export class RedisModule {}
