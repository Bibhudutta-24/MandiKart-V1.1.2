import { UserRole, UserStatus } from '../constants';

export interface User {
  uid: string;
  phoneNumber?: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
  updatedAt: number;
}
