import { Controller, Get, Post, Body } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('users')
export class UserController {
  constructor (private readonly usersService: UsersService) {}

  @Get()
  async findAll () {
    return await this.usersService.findAllUsers()
  }

  @Post()
  async create (@Body() body: { name: string; age: number }) {
    return await this.usersService.createUser(body.name, body.age)
  }
}
