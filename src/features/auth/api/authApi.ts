import { http, registerAuthBridge } from '@/shared/api/httpClient'
import { endSession, getActiveToken } from '../model/sessionStore'
import type { LoginInput, LoginResponseDto } from '../model/types'

export async function login(input: LoginInput): Promise<LoginResponseDto> {
  const { data } = await http.post<LoginResponseDto>('/auth/login', input)
  return data
}

/** Called once at bootstrap: attach the bearer token and react to 401s. */
export function connectAuthToHttp(onSessionEnded: () => void): void {
  registerAuthBridge({
    getToken: () => getActiveToken(),
    onUnauthorized: () => {
      endSession('expired')
      onSessionEnded()
    },
  })
}
