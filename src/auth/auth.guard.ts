import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
  } from '@nestjs/common'
  import { Reflector } from '@nestjs/core'
  import { JwtService } from '@nestjs/jwt'
  import { JWT, StaticKey } from 'src/enums'
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor (
      private jwtService: JwtService,
      private reflector: Reflector
    ) {}
  
    async canActivate (context: ExecutionContext): Promise<boolean> {
      const isPublic = this.reflector.getAllAndOverride<boolean>(StaticKey.public, [
        context.getHandler(),
        context.getClass()
      ])
      if (isPublic) {
        return true
      }
      const request = context.switchToHttp().getRequest()
      const token = request.headers?.token
      if (!token) {
        throw new UnauthorizedException()
      }
      try {
        const payload = await this.jwtService.verifyAsync(
          token,
          {
            secret: JWT.secret
          }
        )
        request.user = payload
      } catch {
        throw new UnauthorizedException()
      }
      return true
    }
  }
  