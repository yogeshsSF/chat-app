
export interface User {
  id?: string;
  username: string;
  firstName?: string;
}

export interface AuthPayload {
  clientId?: string;
  mfa?: boolean;
  userId?: string;
  user?: User;
}
