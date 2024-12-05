import { Body, Controller, Delete, Get, Headers, HttpCode, ParseIntPipe, Post } from '@nestjs/common'
import { LikesService } from './likes.service'
import { AuthService } from 'src/auth/auth.service'
import { User } from 'types/db'
import { DatabaseService } from 'src/database/database.service'
import { Public } from 'src/common/decorators/public.decorator'

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

  @Public()
  @Get('user')
  async findByUser (
    @Headers('token') token: string
  ) {
    const openid = await this.authService.token2openid(token)
    if (openid) {
      const user = (await this.databaseService.query<User[]>('SELECT * FROM users WHERE openid = ?', [openid]))[0]
      if (user) {
        return this.likesService.findAll(user.id)
      }
      return []
    }
    return []
  }

  @Public()
  @Post()
  @HttpCode(200)
  async like (
    @Body('id', ParseIntPipe) id: number,
    @Headers('token') token: string
  ) {
    const openid = await this.authService.token2openid(token)
    if (openid) {
      const user = (await this.databaseService.query<User[]>('SELECT * FROM users WHERE openid = ?', [openid]))[0]
      if (user) {
        return this.likesService.like(user.id, id)
      }
      return false
    }
    return false
  }

  @Public()
  @Delete()
  async unlike (
    @Body('id', ParseIntPipe) id: number,
    @Headers('token') token: string
  ) {
    const openid = await this.authService.token2openid(token)
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
