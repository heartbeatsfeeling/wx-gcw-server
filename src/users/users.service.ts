import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class UsersService {
  constructor (private readonly databaseService: DatabaseService) {}

  async findAdminUser (userName: string, password: string): Promise<null | {
    name: string
    id: number
    password: string
  }> {
    const sql = 'SELECT * FROM `adminUsers` WHERE `name` = ? AND `password` = ?'
    const user = await this.databaseService.query<{ id: number, name: string, password: string }[]>(sql, [userName, password])
    return user?.[0]
  }

  async findAllUser (): Promise<any[]> {
    const sql = 'SELECT * FROM `users`'
    return await this.databaseService.query(sql)
  }

  async findUser (openid: string): Promise<any[]> {
    const sql = 'SELECT * FROM `users` WHERE `user_id` = ?'
    return await this.databaseService.query(sql, [openid]) as any[]
  }

  async createUser (openid: string) {
    const sql = 'INSERT INTO `users` (`user_id`) VALUES (?)'
    return await this.databaseService.query(sql, [openid])
  }

  async updateUser (openid: string) {
    const sql = 'UPDATE `users` SET `last_login_time` = CURRENT_TIMESTAMP WHERE `user_id` = ?'
    return await this.databaseService.query(sql, [openid])
  }

  async saveUser (openid: string) {
    const user = await this.findUser(openid)
    if (user?.length) {
      await this.updateUser(openid)
    } else {
      await this.createUser(openid)
    }
  }
}
