import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { AdminUser } from 'types/db'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from 'src/auth/auth.service'
import { ResultSetHeader } from 'mysql2'
import { Permission, Role } from 'src/enums'
import { RedisService } from 'src/redis/redis.service'
import { jwtConfig, sessionKey } from 'src/common/config'
import { Response } from 'express'
import { CustomRequest } from 'types/request'
@Injectable()
export class AdminService {
  constructor (
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private redisService : RedisService
  ) {}

  /**
   * 验证用户名是否可用
   */
  async checkAvailability (email: string) {
    const sql = `
      SELECT
        *
      FROM
        admin_users
      WHERE
        email = ?
    `
    return (await this.databaseService.query<AdminUser[]>(sql, [email])).length === 0
  }

  async findAdminUsers (): Promise<AdminUser[]> {
    const sql = `
        SELECT
          admin_users.id,
          admin_users.email,
          UNIX_TIMESTAMP(admin_users.create_time) * 1000 as createTime,
          UNIX_TIMESTAMP(admin_users.updated_time) * 1000 as updatedTime,
          GROUP_CONCAT(roles.name) as roles
        FROM
          admin_users
        LEFT JOIN
          admin_users_roles
        ON
          admin_users.id = admin_users_roles.admin_user_id
        LEFT JOIN
          roles
        ON
          roles.id = admin_users_roles.role_id
        GROUP BY
          admin_users.id
      `
    const users = await this.databaseService.query<(Omit<AdminUser, 'roles'> & { roles?: string })[]>(sql)
    return users.map(user => ({
      ...user,
      roles: user.roles ? user.roles.split(',') as Role[] : []
    }))
  }

  async findOneUser (id: number): Promise<(Omit<AdminUser, 'roles'> & { permissions: Permission[] })[]> {
    const sql = `
      SELECT
        admin_users.email AS email,
        admin_users.id AS userId,
        UNIX_TIMESTAMP(admin_users.create_time) * 1000 as createTime,
        UNIX_TIMESTAMP(admin_users.updated_time) * 1000 as updatedTime,
        GROUP_CONCAT(DISTINCT permissions.name) AS permissions
      FROM
        admin_users
      LEFT JOIN
        admin_users_roles ON admin_users.id = admin_users_roles.admin_user_id
      LEFT JOIN
        roles ON roles.id = admin_users_roles.role_id
      LEFT JOIN
        roles_permissions ON roles.id = roles_permissions.role_id
      LEFT JOIN
        permissions ON roles_permissions.permission_id = permissions.id
      WHERE
        admin_users.id = ?
      GROUP BY
        admin_users.id
    `
    const users = await this.databaseService.query<(Omit<AdminUser, 'roles'> & { permissions?: string })[]>(sql, [id])
    return users.map(user => ({
      ...user,
      permissions: user.permissions ? user.permissions.split(',') as Permission[] : [Permission.view]
    }))
  }

  async adminLogin (email: string, plainPassword: string) {
    const sql = `
      SELECT
        admin_users.id AS id,
        admin_users.password AS password,
        GROUP_CONCAT(DISTINCT roles.name) AS roles
      FROM
        admin_users
      LEFT JOIN
        admin_users_roles ON admin_users.id = admin_users_roles.admin_user_id
      LEFT JOIN
        roles ON roles.id = admin_users_roles.role_id
      WHERE
        admin_users.email = ?
      GROUP BY
        admin_users.id
    `
    const user = (await this.databaseService.query<{id: number, roles?: string, password: string}[]>(sql, [email]))[0]
    if (!user) {
      return {
        status: false,
        message: '用户不存在'
      }
    }
    const isPasswordValid = await this.authService.validatePassword(plainPassword, user.password)
    if (!isPasswordValid) {
      return {
        status: false,
        message: '密码不正确'
      }
    }
    const payload = { userId: user.id }
    const token = await this.jwtService.signAsync(payload)
    // Token 与 Redis 强绑定
    await this.redisService.set(
      `${sessionKey}:${token}`,
      JSON.stringify({
        userId: payload.userId,
        roles: user.roles ? user.roles.split(',') : []
      }),
      jwtConfig.expiresIn * 60
    )
    return {
      status: true,
      access_token: token
    }
  }

  async adminLogout (request: CustomRequest, response: Response) {
    const token = request.cookies.token
    response.clearCookie('token')
    if (token) {
      await this.redisService.del(`${sessionKey}:${token}`)
    }
  }

  async addUser (body: { password: string, email: string, roles?: number[] }) {
    const connection = await this.databaseService.getConnection()
    try {
      await connection.beginTransaction()
      const password = await this.authService.hashPassword(body.password)
      const sql = 'INSERT INTO `admin_users` (`email`, `password`) VALUES (?, ?)'
      const [addUserRes] = await connection.query<ResultSetHeader>(sql, [body.email, password])
      if (body.roles?.length) {
        const roles = body.roles.map(role => `(${addUserRes.insertId}, ${role})`).join(', ')
        await connection.query<ResultSetHeader>(
          `INSERT INTO admin_users_roles (admin_user_id, role_id) VALUES ${roles}`
        )
      }
      await connection.commit()
      return addUserRes.affectedRows >= 1
    } catch (err: any) {
      await connection.rollback()
      throw new HttpException(err.message, HttpStatus.BAD_GATEWAY)
    } finally {
      connection.release()
    }
  }

  async updateRoles (body: { id: number, roles?: number[] }) {
    const connection = await this.databaseService.getConnection()
    try {
      await connection.beginTransaction()
      const [res] = await connection.query<ResultSetHeader>(
        `
          UPDATE
            admin_users
          SET
            updated_time = CURRENT_TIMESTAMP
          WHERE
            id = ?
        `,
        [body.id]
      )
      await connection.query<ResultSetHeader>(
        `
          DELETE FROM
            admin_users_roles
          WHERE
            admin_user_id = ?
        `,
        [body.id]
      )
      if (body.roles?.length) {
        const roles = body.roles.map(role => `(${body.id}, ${role})`).join(', ')
        await connection.query<ResultSetHeader>(
          `INSERT INTO admin_users_roles (admin_user_id, role_id) VALUES ${roles}`
        )
      }
      await connection.commit()
      return res.affectedRows >= 1
    } catch (err: any) {
      await connection.rollback()
      throw new HttpException(err.message, HttpStatus.BAD_GATEWAY)
    } finally {
      connection.release()
    }
  }

  async resetPassword (body: { password: string, email: string }) {
    const password = await this.authService.hashPassword(body.password)
    const sql = `
      UPDATE
        admin_users
      SET
        password = ?,
        updated_time = CURRENT_TIMESTAMP
      WHERE
        email = ?
    `
    const res = await this.databaseService.query(sql, [password, body.email])
    return res.changedRows >= 1
  }
}
