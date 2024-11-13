import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common'
import { AppService } from './app.service'
import { DatabaseService } from './database/database.service'

@Controller()
export class AppController {
  constructor (
    private readonly appService: AppService,
    private readonly databaseService: DatabaseService
  ) {}

  @Get()
  getHello (): string {
    return this.appService.getHello()
  }

  @Post('updateDb')
  @HttpCode(200)
  async updateDb (
    @Body('sql') sql: string,
    @Body('params') params = []
  ) {
    return this.databaseService.query(sql, params)
  }
}
