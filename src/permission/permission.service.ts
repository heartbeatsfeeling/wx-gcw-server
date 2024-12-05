import { Injectable } from '@nestjs/common'
import { ResultSetHeader } from 'mysql2'
import { DatabaseService } from 'src/database/database.service'
import { Permission } from 'types/db'

@Injectable()
export class PermissionService {
  constructor (
    private databaseService: DatabaseService
  ) {}

  async findPermissions (id?: number) {
    const sql = `
      SELECT
        id,
        name,
        description,
        UNIX_TIMESTAMP(created_at) * 1000 as createdAt,
        UNIX_TIMESTAMP(updated_at) * 1000 as updatedAt
      FROM
        permissions
      WHERE
        id = COALESCE(?, id)
    `
    return await this.databaseService.query<Permission[]>(sql, [id ?? null])
  }

  async add (body: { name: string, description: string }) {
    const sql = 'INSERT INTO `permissions` (`name`, `description`) VALUES (?, ?)'
    const res = await this.databaseService.query<ResultSetHeader>(sql, [body.name, body.description])
    return res.affectedRows >= 1
  }

  async delete (id: number) {
    const sql = 'DELETE FROM `permissions` WHERE `id` = ?'
    const res = await this.databaseService.query<ResultSetHeader>(sql, [id])
    return res.affectedRows >= 1
  }

  async update ({ id, name, description }: { id: number, name: string, description: string }) {
    const defaultRole = (await this.findPermissions(id))[0]
    if (defaultRole) {
      const sql = `
        UPDATE
          permissions
        SET
          name = ?,
          description = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE
          id = ?
      `
      const res = await this.databaseService.query<ResultSetHeader>(sql, [name ?? defaultRole.name, description ?? defaultRole.description, id])
      return res.affectedRows >= 1
    }
    return false
  }
}
