import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      console.log('RolesGuard: no roles required, returning true');
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    console.log('RolesGuard: requiredRoles=', requiredRoles, 'user.role=', user.role);
    return requiredRoles.includes(user.role);
  }
}
