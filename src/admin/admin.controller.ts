import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Query, Req, Res } from '@nestjs/common'
import { AuthService } from 'src/auth/auth.service'
import { Public } from 'src/common/decorators/public.decorator'
import { AdminLoginDto, RegisterDto, RestPasswrodDto, UpdateRolesDto } from 'src/common/dto/admin.dto'
import { CustomRequest } from 'types/request'
import { Response } from 'express'
import { AdminService } from './admin.service'
import { CaptchaService } from 'src/captcha/captcha.service'
import { MailService } from 'src/mail/mail.service'
import { randomUUID } from 'node:crypto'
import { jwtConfig, supportRegister } from 'src/common/config'

@Controller('admin')
export class AdminController {
  constructor (
    private readonly authService: AuthService,
    private readonly adminService: AdminService,
    private readonly captchaService: CaptchaService,
    private readonly mailService: MailService
  ) {
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login (
    @Body() { email, password, captchaId, captchaText }: AdminLoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const captcha = await this.captchaService.validateCaptcha(captchaId, captchaText)
    if (captcha) {
      const user = await this.adminService.adminLogin(email, password)
      if (user.status) {
        response.cookie('token', user.access_token, {
          maxAge: Number(jwtConfig.expiresIn) * 60 * 1000
        })
        return true
      } else {
        throw new HttpException(user.message || 'Err', HttpStatus.OK)
      }
    } else {
      throw new HttpException('验证码过期或错误', HttpStatus.OK)
    }
  }

  @Get('logout')
  @HttpCode(200)
  async logout (
    @Req() request: CustomRequest,
    @Res({ passthrough: true }) response: Response
  ) {
    await this.adminService.adminLogout(request, response)
    return true
  }

  @Public()
  @Get('/users')
  async findAdminUsers () {
    return this.adminService.findAdminUsers()
  }

  @Public()
  @Get('userInfo')
  async getAdminUserInfo (@Req() request: CustomRequest) {
    const data = {
      supportRegister
    }
    try {
      const payload = await this.authService.getAdminJWTPayload(request.cookies.token)
      if (payload) {
        const user = (await this.adminService.findOneUser(payload.userId))[0]
        if (user) {
          return {
            user,
            ...data
          }
        }
      }
    } catch {

    }
    return {
      ...data
    }
  }

  /**
   * 验证email是否可用接口 /admin/check-availability
   */
  @Public()
  @Get('check-availability')
  checkAvailability (
    @Query('email') userName?: string
  ) {
    if (userName) {
      return this.adminService.checkAvailability(userName)
    }
    return false
  }

  /**
   * 用户注册接口 admin/register
   */
  @Public()
  @Post('register')
  @HttpCode(200)
  async register (
    @Body() body: RegisterDto
  ) {
    if (!this.checkAvailability(body.email)) {
      throw new HttpException('邮箱地址已经存在', HttpStatus.BAD_GATEWAY)
    }
    if (await this.captchaService.validateCaptcha(body.email, body.captchaText)) {
      return this.adminService.addUser(body)
    } else {
      throw new HttpException('验证码错误', HttpStatus.BAD_GATEWAY)
    }
  }

  /**
   * 修改admin role
   */
  @Public()
  @Post('update-roles')
  @HttpCode(200)
  async updateRoles (
    @Body() body: UpdateRolesDto
  ) {
    return this.adminService.updateRoles(body)
  }

  /**
   * 获取验证码接口 admin/captcha
   */
  @Public()
  @Get('captcha')
  async captcha () {
    const { text: _, ...other } = await this.captchaService.generateCaptcha(randomUUID())
    return other
  }

  /**
   * 发送验证码到邮件接口 /api/admin/send-captcha2email
   */
  @Public()
  @Get('send-captcha2email')
  async sendCaptcha2Email (
    @Query('email') email?: string
  ) {
    return this.adminService.sendEmailCaptcha(email)
  }

  /**
   * 找回用户密码接口 admin/reset-password
   */
  @Public()
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword (
    @Body() body: RestPasswrodDto
  ) {
    if (await this.captchaService.validateCaptcha(body.email, body.captchaText)) {
      return this.adminService.resetPassword(body)
    } else {
      throw new HttpException('验证码错误', HttpStatus.BAD_GATEWAY)
    }
  }
}
