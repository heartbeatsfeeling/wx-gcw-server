// user.service.ts
import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class UsersService {
  constructor (private readonly databaseService: DatabaseService) {}

  async findAllUsers () {
    const sql = 'SELECT * FROM users'
    return await this.databaseService.query(sql)
  }

  async createUser (name: string, age: number) {
    const sql = 'INSERT INTO users (name, age) VALUES (?, ?)'
    return await this.databaseService.query(sql, [name, age])
  }
}
