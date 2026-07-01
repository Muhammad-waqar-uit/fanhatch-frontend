/** The authenticated principal, as returned by the backend's auth endpoints. */
export interface AuthUser {
  id: string
  email?: string
  handle?: string
  role?: string
}

/** Credentials for `POST /auth/login` and `POST /auth/register`. */
export interface LoginInput {
  email: string
  password: string
}

/** Shape of `POST /auth/login` (and `/auth/register`) responses. */
export interface AuthResponse {
  accessToken: string
  user: AuthUser
}
