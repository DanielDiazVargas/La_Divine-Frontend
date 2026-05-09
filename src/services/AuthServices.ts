/**
 * URLs base para la conexión con el servidor local de C#.
 */
const API = "https://localhost:7283/api/Auth";
const USER_API = "https://localhost:7283/api/User";

// Recupera el token de sesión almacenado en el navegador
const getToken = () => localStorage.getItem("token");

// Genera el objeto de cabeceras incluyendo el token para peticiones protegidas
const buildHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`
});

/**
 * Realiza la petición de inicio de sesión.
 * Envía las credenciales y retorna el token JWT si la respuesta es exitosa.
 */
export const login = async (email: string, password: string) => {
    const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email, Password: password })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.mensaje || "Error al iniciar sesión");
    return data;
};

/**
 * Registra un nuevo cliente en el sistema.
 * Mapea los datos del formulario de React al formato esperado por el backend (.NET).
 */
export const register = async (dto: any) => {
    // Objeto formateado con PascalCase para que calce con los DTOs de C#
    const datosParaCSharp = {
        Name: dto.name || "",
        LastName: dto.lastName || "",
        Email: dto.email || "",
        Rut: dto.rut || "",
        Phone: dto.phone || ""
    };

    const response = await fetch(`${API}/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosParaCSharp)
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.mensaje || "Error al registrar");
    return data;
};

/**
 * Decodifica el payload del token JWT para extraer el rol del usuario.
 * Utiliza el esquema de nombres estándar de Microsoft para roles.
 */
export const getRoleFromToken = (): string => {
    const token = getToken();
    if (!token) return "";
    
    // Decodificación de Base64 del segundo segmento del token (payload)
    const payload = JSON.parse(atob(token.split(".")[1]));
    
    return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? "";
};

/**
 * Solicita los datos personales del usuario autenticado.
 */
export const getProfile = async () => {
    const response = await fetch(`${USER_API}/perfil`, { headers: buildHeaders() });
    if (!response.ok) throw new Error("Error al obtener perfil");
    return response.json();
};

/**
 * Obtiene la lista completa de usuarios registrados.
 * Requiere permisos de administrador.
 */
export const getUsers = async () => {
    const response = await fetch(`${USER_API}`, { headers: buildHeaders() });
    if (!response.ok) throw new Error("Error al obtener usuarios");
    return response.json();
};

/**
 * Cambia el estado (Activo/Inactivo) de una cuenta de usuario específica.
 */
export const toggleUserStatus = async (id: number, newStatus: boolean) => {
    const response = await fetch(`${USER_API}/${id}/status`, {
        method: "PUT",
        headers: buildHeaders(),
        body: JSON.stringify({ status: newStatus })
    });
    if (!response.ok) throw new Error("Error al cambiar estado");
    return response.json();
};

/**
 * Actualiza la contraseña del usuario logueado validando su contraseña actual.
 */
export const changePassword = async (currentPassword: string, newPassword: string) => {
    const response = await fetch(`${USER_API}/cambiar-contrasena`, {
        method: "PUT",
        headers: buildHeaders(),
        body: JSON.stringify({ actual: currentPassword, nueva: newPassword })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.mensaje || "Error al cambiar contraseña");
    return data;
};