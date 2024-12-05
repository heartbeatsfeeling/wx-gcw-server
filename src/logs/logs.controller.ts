import { Body, Controller, Get, HttpCode, ParseIntPipe, Post, Req } from '@nestjs/common'
import { LogsService } from './logs.service'
import { AuthService } from 'src/auth/auth.service'
import { CustomRequest } from 'types/request'
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
    @Req() request: CustomRequest
  ) {
    const openid = await this.authService.token2openid(request.cookies.token)
    if (openid) {
      const user = (await this.databaseService.query<User[]>('SELECT * FROM users WHERE openid = ?', [openid]))[0]
      if (user) {
        return this.logsService.addLog(user.id, id)
      }
      return false
    }
    return false
  }
}
