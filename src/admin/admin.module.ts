import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { DatabaseModule } from '../database/database.module'
import { AuthModule } from 'src/auth/auth.module'
import { UsersModule } from 'src/users/users.module'
import { CaptchaModule } from 'src/captcha/captcha.module'
import { MailModule } from 'src/mail/mail.module'

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, DatabaseModule, CaptchaModule, MailModule],
  controllers: [AdminController],
  exports: [AdminService],
  providers: [AdminService]
})
export class AdminModule {}
