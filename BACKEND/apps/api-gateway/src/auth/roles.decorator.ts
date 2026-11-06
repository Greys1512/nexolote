import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Restringe un endpoint a los roles indicados: @Roles('Administrador'). */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
