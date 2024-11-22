import { Module } from '@nestjs/common'
import { UserLoginLogsController } from './user-login-logs.controller'
import { UserLoginLogsService } from './user-login-logs.service'
import { DatabaseModule } from 'src/database/database.module'

/**
 * 用户登录日志
 */
@Module({
  imports: [DatabaseModule],
  controllers: [UserLoginLogsController],
  providers: [UserLoginLogsService],
  exports: [UserLoginLogsService]
})

export class UserLoginLogsModule {}
