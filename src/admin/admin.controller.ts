import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common'
import { AuthService } from 'src/auth/auth.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { Public } from 'src/common/decorators/public.decorator'
import { AdminService } from './admin.service'
import { UsersService } from 'src/users/users.service'
import { AdminLoginDto } from 'src/common/dto/admin.dto'

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
  async login (@Body() { userName, password }: AdminLoginDto) {
    const user = await this.authService.adminLogin(userName, password)
    if (user.status) {
      return user.access_token
    } else {
      throw new HttpException(user.message, HttpStatus.OK)
    }
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
