import { Body, Controller, Get, Post } from '@nestjs/common'
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

  @Post()
  async updateDb (
    @Body('sql') sql: string,
    @Body('params') params = []
  ) {
    console.log(sql)
    try {
      return await this.databaseService.query(sql, params)
    } catch {
      return false
    }
  }
}
