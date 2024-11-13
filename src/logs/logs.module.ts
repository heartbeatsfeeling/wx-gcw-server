import { Module } from '@nestjs/common'
import { LogsService } from './logs.service'
import { LogsController } from './logs.controller'
import { DatabaseModule } from 'src/database/database.module'
import { JwtModule } from '@nestjs/jwt'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [DatabaseModule, JwtModule, AuthModule],
  controllers: [LogsController],
  providers: [LogsService]
})
export class LogsModule {}
