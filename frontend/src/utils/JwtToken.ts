export interface JwtToken {
    success: boolean,
    token: string | null,
}
export interface DecodedToken {
    username: string,
    userId: string,
    exp: number,
    iss: string,
    aud: string,
}
