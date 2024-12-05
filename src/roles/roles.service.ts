import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ResultSetHeader } from 'mysql2'
import { DatabaseService } from 'src/database/database.service'
import { Role } from 'types/db'

@Injectable()
export class RolesService {
  constructor (
    private databaseService: DatabaseService
  ) {}

  async findRoles (id?: number) {
    const sql = `
      SELECT
        roles.id, 
        roles.name,
        roles.description,
        UNIX_TIMESTAMP(roles.created_at) * 1000 as createdAt,
        UNIX_TIMESTAMP(roles.updated_at) * 1000 as updatedAt,
        GROUP_CONCAT(roles_permissions.permission_id) as permissions
      FROM
        roles
      LEFT JOIN
        roles_permissions
      ON
        roles.id = roles_permissions.role_id
      WHERE
        roles.id = COALESCE(?, roles.id)
      GROUP BY
        roles.id
    `
    return await this.databaseService.query<Role[]>(sql, [id ?? null])
  }

  async add (body: { name: string, description: string, permissions?: number[] }) {
    const connection = await this.databaseService.getConnection()
    try {
      await connection.beginTransaction()
      const [res] = await connection.query<ResultSetHeader>(
        'INSERT INTO `roles` (`name`, `description`) VALUES (?, ?)',
        [body.name, body.description]
      )
      const roleId = res.insertId
      const permissions = (body.permissions || []).map(d => `(${roleId}, ${d})`).join(', ')
      if (body.permissions?.length) {
        await connection.query<ResultSetHeader>(
          `INSERT INTO roles_permissions (role_id, permission_id) VALUES ${permissions}`
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

  async delete (id: number) {
    const sql = 'DELETE FROM `roles` WHERE `id` = ?'
    const res = await this.databaseService.query<ResultSetHeader>(sql, [id])
    return res.affectedRows >= 1
  }

  async update (body: { id: number, name: string, description: string, permissions?: number[] }) {
    const connection = await this.databaseService.getConnection()
    try {
      await connection.beginTransaction()
      const [res] = await connection.query<ResultSetHeader>(
        `
          UPDATE
            roles
          SET
            name = ?,
            description = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE
            id = ?
        `,
        [body.name, body.description, body.id]
      )
      if (res.affectedRows >= 1) {
        await connection.query<ResultSetHeader>(
          'DELETE FROM roles_permissions WHERE role_id = ?',
          [body.id]
        )
        const permissions = (body.permissions || []).map(d => `(${body.id}, ${d})`).join(', ')
        if (body.permissions?.length) {
          await connection.query<ResultSetHeader>(
            `INSERT INTO roles_permissions (role_id, permission_id) VALUES ${permissions}`
          )
        }
        await connection.commit()
        return true
      } else {
        throw new HttpException('数据不存在', HttpStatus.BAD_GATEWAY)
      }
    } catch (err: any) {
      console.log('err', err)
      await connection.rollback()
      throw new HttpException(err.message, HttpStatus.BAD_GATEWAY)
    } finally {
      connection.release()
    }
  }
}
