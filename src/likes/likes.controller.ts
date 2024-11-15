import { Body, Controller, Delete, Get, HttpCode, ParseIntPipe, Post, Req } from '@nestjs/common'
import { LikesService } from './likes.service'
import { CustomRequest } from 'types/request'
import { AuthService } from 'src/auth/auth.service'
import { User } from 'types/db'
import { DatabaseService } from 'src/database/database.service'

@Controller('likes')
export class LikesController {
  constructor (
    private readonly likesService: LikesService,
    private readonly authService: AuthService,
    private readonly databaseService: DatabaseService
  ) {}

  @Get()
  async findAll () {
    return this.likesService.findAll()
  }

  @Post()
  @HttpCode(200)
  async like (
    @Body('id', ParseIntPipe) id: number,
    @Req() request: CustomRequest
  ) {
    const openid = await this.authService.token2openid(request.cookies.token)
    if (openid) {
      const user = (await this.databaseService.query<User[]>('SELECT * FROM users WHERE openid = ?', [openid]))[0]
      if (user) {
        return this.likesService.like(user.id, id)
      }
      return false
    }
    return false
  }

  @Delete()
  async unlike (
    @Body('id', ParseIntPipe) id: number,
    @Req() request: CustomRequest
  ) {
    const openid = await this.authService.token2openid(request.cookies.token)
    if (openid) {
      const user = (await this.databaseService.query<User[]>('SELECT * FROM users WHERE openid = ?', [openid]))[0]
      if (user) {
        return this.likesService.unlike(user.id, id)
      }
      return false
    }
    return false
  }
}
