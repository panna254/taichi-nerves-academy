// Regular User Type Definitions

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  membershipStatus?: "active" | "inactive" | "expired";
  membershipExpiresAt?: string;
  createdAt?: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export type SignupResult =
  | {
      status: "authenticated";
      session: AuthSession;
    }
  | {
      status: "email_confirmation_required";
      email: string;
      message: string;
    };

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}
