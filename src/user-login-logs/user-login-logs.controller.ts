import { Controller, Get } from '@nestjs/common'
import { UserLoginLogsService } from './user-login-logs.service'

@Controller('user-login-logs')
export class UserLoginLogsController {
  constructor (
    private userLoginLogsService: UserLoginLogsService
  ) {}

  @Get()
  findAll () {
    return this.userLoginLogsService.findAll()
  }
}
