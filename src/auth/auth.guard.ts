import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { isPublicKey, jwtConfig } from 'src/common/config'
import { PERMISSIONS_KEY } from 'src/common/decorators/permission.decorator'

  @Injectable()
export class AuthGuard implements CanActivate {
  constructor (
      private jwtService: JwtService,
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
    if (!token) {
      throw new UnauthorizedException()
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: jwtConfig.secret
        }
      )
      const requiredPermissions = this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler()) || []
      if (requiredPermissions.length === 0) {
        return true
      }
      const hasPermission = requiredPermissions.every(permission => payload.permissions.includes(permission))
      if (!hasPermission) {
        throw new ForbiddenException('用户权限不足')
      }
      return true
    } catch (err: any) {
      if (err.status === 403) {
        throw new ForbiddenException(err.message)
      } else {
        throw new UnauthorizedException()
      }
    }
  }
}
