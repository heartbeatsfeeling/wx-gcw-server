import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { isPublicKey, jwtConfig, roleKey, sessionKey } from 'src/common/config'
import { PERMISSIONS_KEY } from 'src/common/decorators/permission.decorator'
import { DatabaseService } from 'src/database/database.service'
import { Permission } from 'src/enums'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor (
      private jwtService: JwtService,
      private redisService: RedisService,
      private databaseService: DatabaseService,
      private reflector: Reflector
  ) {}

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(isPublicKey, [
      context.getHandler(),
      context.getClass()
    ])
    if (isPublic) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const token = request.cookies.token
    const sessionString = await this.redisService.get(`${sessionKey}:${token}`)
    if (!token || !sessionString) {
      throw new UnauthorizedException()
    }
    try {
      let permissionNames: string[] = []
      await this.jwtService.verifyAsync(
        token,
        {
          secret: jwtConfig.secret
        }
      )
      const session: {
        id: number
        roles: string[]
      } = JSON.parse(sessionString)
      const requiredPermissions = this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler()) || []
      if (requiredPermissions.length === 0) {
        return true
      }
      if (session.roles.length === 0) {
        permissionNames = [Permission.view]
      } else {
        // 先从redis里面拿permission数据
        console.time('redis')
        const redisPermissionNames = [
          ...new Set(
            (await Promise.all(
              session.roles.map(role => this.redisService.get(`${roleKey}:${role}`))
            )).filter(key => key).map(item => JSON.parse(item!)).flat(1)
          )
        ] as string[]
        console.timeEnd('redis')
        if (redisPermissionNames.length === 0) { // redis无数据，则才db里拿，同时保存数据到redis
          console.time('sql')
          const permissions = await this.databaseService.query<{permissions: string}[]>(
            `
              SELECT
                roles.name AS roles,
                GROUP_CONCAT(DISTINCT permissions.name) AS permissions
              FROM
                roles
              LEFT JOIN roles_permissions ON roles.id = roles_permissions.role_id
              LEFT JOIN permissions ON roles_permissions.permission_id = permissions.id
              WHERE
                roles.name IN (?)
              GROUP BY
                roles.id
            `,
            [session.roles.join(',')]
          )
          permissionNames = [...new Set(permissions.map(permission => permission.permissions.split(',')).flat(1))]
          session.roles.forEach(role => {
            this.databaseService.query<{permissions: string}[]>(
              `
                SELECT
                  GROUP_CONCAT(DISTINCT permissions.name) AS permissions
                FROM
                  roles
                LEFT JOIN roles_permissions ON roles.id = roles_permissions.role_id
                LEFT JOIN permissions ON roles_permissions.permission_id = permissions.id
                WHERE
                  roles.name = ?
                GROUP BY
                  roles.id
              `,
              [role]
            ).then(res => {
              this.redisService.set(`${roleKey}:${role}`, JSON.stringify([...new Set(res.map(permission => permission.permissions.split(',')).flat(1))]))
            })
          })
          console.timeEnd('sql')
        } else {
          permissionNames = redisPermissionNames
        }
      }
      const hasPermission = requiredPermissions.every(permission => permissionNames.includes(permission))
      if (!hasPermission) {
        throw new ForbiddenException('用户权限不足')
      }
      return true
    } catch (err: any) {
      console.log(err)
      if (err.status === 403) {
        throw new ForbiddenException(err.message)
      } else {
        throw new UnauthorizedException()
      }
    }
  }
}
