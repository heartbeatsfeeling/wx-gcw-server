import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { User } from 'types/db'
import { ResultSetHeader } from 'mysql2'

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
    const sql = `
      SELECT
        users.id,
        users.openid,
        users.name,
        UNIX_TIMESTAMP(users.create_time) * 1000 as createTime,
        MAX(UNIX_TIMESTAMP(logs.create_time) * 1000) as lastLoginTime
      FROM
        users
      LEFT JOIN
        user_login_logs logs
      ON
        users.id = logs.user_id
      GROUP BY
        users.id, users.openid, users.name
    `
    return await this.databaseService.query<User[]>(sql)
  }

  async findUser (openid: string) {
    const sql = 'SELECT * FROM `users` WHERE `openid` = ?'
    const res = await this.databaseService.query<User[]>(sql, [openid])
    return res?.[0]
  }

  async createUser (openid: string) {
    const user = await this.findUser(openid)
    if (!user) {
      const sql = 'INSERT INTO `users` (`openid`) VALUES (?)'
      const res = await this.databaseService.query<ResultSetHeader>(sql, [openid])
      return res.affectedRows >= 1
    }
    return true
  }
}
