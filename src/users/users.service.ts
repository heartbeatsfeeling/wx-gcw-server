import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { User } from 'types/db'
import { ResultSetHeader } from 'mysql2'
import { dateFormat } from 'src/common/config'

@Injectable()
export class UsersService {
  constructor (private readonly databaseService: DatabaseService) {}

  async getAdminUserInfo (userName: string): Promise<null | {
    name: string
    id: number
    password: string
  }> {
    const sql = 'SELECT * FROM `adminUsers` WHERE `name` = ?'
    const user = await this.databaseService.query<{ id: number, name: string, password: string }[]>(sql, [userName])
    return user?.[0]
  }

  async findAdminUser (userName: string, password: string): Promise<null | {
    name: string
    id: number
    password: string
  }> {
    const sql = 'SELECT * FROM `adminUsers` WHERE `name` = ? AND `password` = ?'
    const user = await this.databaseService.query<{ id: number, name: string, password: string }[]>(sql, [userName, password])
    return user?.[0]
  }

  async findAllUser () {
    const sql = 'SELECT * , DATE_FORMAT(`create_time`, ?) as create_time, DATE_FORMAT(`last_login_time`, ?) as last_login_time FROM `users`'
    const list = await this.databaseService.query<User[]>(sql, [dateFormat.format, dateFormat.format])
    return list.map(item => ({
      id: item.id,
      name: item.name,
      createTime: item.create_time,
      lastLoginTime: item.last_login_time
    }))
  }

  async findUser (openid: string) {
    const sql = 'SELECT * FROM `users` WHERE `user_id` = ?'
    const res = await this.databaseService.query<User[]>(sql, [openid])
    return res?.[0]
  }

  async createUser (openid: string) {
    const sql = 'INSERT INTO `users` (`user_id`) VALUES (?)'
    const res = await this.databaseService.query<ResultSetHeader>(sql, [openid])
    return res.affectedRows >= 1
  }

  async updateUser (openid: string) {
    const sql = 'UPDATE `users` SET `last_login_time` = CURRENT_TIMESTAMP WHERE `user_id` = ?'
    const res = await this.databaseService.query<ResultSetHeader>(sql, [openid])
    return res.affectedRows >= 1
  }

  async saveUser (openid: string) {
    const user = await this.findUser(openid)
    if (user) {
      await this.updateUser(openid)
    } else {
      await this.createUser(openid)
    }
  }
}
