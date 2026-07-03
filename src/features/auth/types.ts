/** The authenticated principal, as returned by the backend's auth endpoints. */
export interface AuthUser {
  id: string
  email?: string
  handle?: string
  role?: string
  /** Persisted smart-account address (lowercased checksum). Set once derived. */
  walletAddress?: string | null
}

/** Credentials for `POST /auth/login` and `POST /auth/register`. */
export interface LoginInput {
  email: string
  password: string
}

/** Shape of `POST /auth/login` (and `/auth/register`) responses. */
export interface AuthResponse {
  accessToken: string
  /** Backend-minted Web3Auth SFA id-token (RS256). Absent in mock/web2 mode. */
  web3authToken?: string
  user: AuthUser
}
