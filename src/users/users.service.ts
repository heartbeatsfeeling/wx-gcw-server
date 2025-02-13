import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { AdminUser, User } from 'types/db'
import { ResultSetHeader } from 'mysql2'

@Injectable()
export class UsersService {
  constructor (private readonly databaseService: DatabaseService) {}

  async getAdminUserInfo (email: string): Promise<null | AdminUser> {
    const sql = 'SELECT * FROM `admin_users` WHERE `email` = ?'
    const user = await this.databaseService.query<AdminUser[]>(sql, [email])
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
