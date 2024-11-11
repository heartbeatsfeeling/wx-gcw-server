import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common'
import { AuthService } from 'src/auth/auth.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { Public } from 'src/common/decorators/public.decorator'
import { AdminService } from './admin.service'
import { UsersService } from 'src/users/users.service'
import { AdminLoginDto } from 'src/common/dto/admin.dto'
import { CustomRequest } from 'types/request'
import { Response } from 'express'

@UseGuards(AuthGuard)
@Controller('admin')
export class AdminController {
  constructor (
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  @Post('login')
  @Public()
  @HttpCode(200)
  async login (
    @Body() { userName, password }: AdminLoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const user = await this.authService.adminLogin(userName, password)
    if (user.status) {
      response.cookie('token', user.access_token, {
        maxAge: 24 * 60 * 60 * 1000
      })
      return true
    } else {
      throw new HttpException(user.message, HttpStatus.OK)
    }
  }

  @Get('logout')
  @HttpCode(200)
  async logout (
    @Res({ passthrough: true }) response: Response
  ) {
    response.clearCookie('token')
    return true
  }

  @Public()
  @Get('userInfo')
  async getAdminUserInfo (@Req() request: CustomRequest) {
    const message = '获取用户信息失败'
    try {
      const payload = await this.authService.getAdminJWTPayload(request.cookies.token)
      if (payload) {
        return payload
      } else {
        throw new HttpException(message, HttpStatus.OK)
      }
    } catch {

    }
    throw new HttpException(message, HttpStatus.OK)
  }

  @Get('videos')
  async getVideoList () {
    const list = await this.adminService.getVideoList()
    return list
  }

  @Get('videos/:id')
  async getVideoDetail (@Param('id') id: number) {
    const detail = await this.adminService.getVideoDetail(id)
    return detail
  }

  @Get('users')
  async getUserList () {
    const list = await this.usersService.findAllUser()
    return list
  }
}
