import { Module } from '@nestjs/common'
import { LogsService } from './logs.service'
import { LogsController } from './logs.controller'
import { DatabaseModule } from 'src/database/database.module'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [LogsController],
  providers: [LogsService]
})
export class LogsModule {}
