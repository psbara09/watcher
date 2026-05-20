export enum UserRole {
  STORE_STAFF = 'store_staff',
  FACEWATCH_ANALYST = 'facewatch_analyst',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  tenantId: string | null;
  createdAt: string;
}
