import { Controller, Get } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('users')
export class UserController {
  constructor (private readonly usersService: UsersService) {}

  @Get()
  async getUsers () {
    return await this.usersService.findAllUser()
  }
}
