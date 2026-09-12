export const USER_ROLES = {
  FARMER: 'FARMER',
  BUYER: 'BUYER',
  LOGISTICS: 'LOGISTICS',
  ADMIN: 'ADMIN',
  FPO: 'FPO',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
