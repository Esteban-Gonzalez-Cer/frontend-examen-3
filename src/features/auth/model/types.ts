export interface SessionStudent {
  numeroControl: string
  fullName: string
  email: string
  isAdmin: boolean
}

export interface Session {
  token: string
  expiresAt: string // ISO-8601
  student: SessionStudent
}

export type SessionEndReason = 'expired' | 'logout'

export interface LoginInput {
  email: string
  password: string
}

export interface LoginResponseDto {
  accessToken: string
  tokenType: string
  expiresAt: string
  student: SessionStudent
}
