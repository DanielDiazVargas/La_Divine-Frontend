export interface loginData {
    email: string,
    token: string,
    rol: string
}

export interface LoginResponse {
    message: string,
    data: loginData |null
}
