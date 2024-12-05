import { Body, Controller, Get, Headers, HttpCode, ParseIntPipe, Post } from '@nestjs/common'
import { LogsService } from './logs.service'
import { AuthService } from 'src/auth/auth.service'
import { DatabaseService } from 'src/database/database.service'
import { User } from 'types/db'
import { Public } from 'src/common/decorators/public.decorator'

@Controller('logs')
export class LogsController {
  constructor (
    private readonly logsService: LogsService,
    private readonly authService: AuthService,
    private readonly databaseService: DatabaseService
  ) {}

  @Get()
  logs () {
    return this.logsService.findAll()
  }

  @Public()
  @Post()
  @HttpCode(200)
  async addLog (
    @Body('id', ParseIntPipe) id: number,
    @Headers('token') token: string
  ) {
    const openid = await this.authService.token2openid(token)
    if (openid) {
      const user = (await this.databaseService.query<User[]>('SELECT * FROM users WHERE openid = ?', [openid]))[0]
      console.log(user)
      if (user) {
        return this.logsService.addLog(user.id, id)
      }
      return false
    }
    return false
  }
}
