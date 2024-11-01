import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../users/users.module'
import { HttpModule } from '@nestjs/axios'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { JWT } from 'src/enums'
import { DatabaseModule } from 'src/database/database.module'
@Module({
  imports: [
    UsersModule,
    HttpModule,
    ConfigModule,
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: JWT.secret,
      signOptions: { expiresIn: JWT.expiration }
    })],
  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
