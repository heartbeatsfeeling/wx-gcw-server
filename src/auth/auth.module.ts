import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../users/users.module'
import { HttpModule } from '@nestjs/axios'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from 'src/database/database.module'
import { jwtConfig } from 'src/common/config'
import { UserLoginLogsModule } from 'src/user-login-logs/user-login-logs.module'
@Module({
  imports: [
    UsersModule,
    HttpModule,
    ConfigModule,
    DatabaseModule,
    UserLoginLogsModule,
    JwtModule.register({
      global: true,
      secret: jwtConfig.secret,
      signOptions: { expiresIn: `${jwtConfig.expiresIn}m` }
    })],
  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
