import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor (private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn () {
    return this.authService.signIn()
  }
}
