const BASE_URL = import.meta.env.VITE_API_BACKEND;
const API = `${BASE_URL}/api/Function`;

// Recupera el token de sesión almacenado en el navegador
const getToken = () => localStorage.getItem("token");

/**
 * Registra una nueva función en el sistema.
 * Usa FormData porque el backend recibe [FromForm] con imagen incluida.
 */
export const registerFunction = async (dto: any) => {
    const formData = new FormData();
    formData.append("Name", dto.name || "");
    formData.append("Description", dto.description || "");
    formData.append("BasePrice", dto.basePrice || "");
    formData.append("DateFunction", dto.dateFunction || "");
    formData.append("TimeFunction", dto.timeFunction || "");
    if (dto.image) {
        formData.append("Image", dto.image);
    }

    const response = await fetch(`${API}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${getToken()}`
        },
        body: formData
    });

    const data = await response.json();
    if (!response.ok || data.success === false) throw new Error(data.message || "Error al registrar la función");
    return data;
};

export const getBillboard = async () => {
    const response = await fetch(`${API}/cartelera`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error("Error al obtener cartelera");
    return data.data || []; // devuelve el array directo
};

/**
 * Obtiene la lista completa de funciones registradas.
 */
export const getFunctions = async () => {
    const response = await fetch(`${API}`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        }
    });
    if (!response.ok) throw new Error("Error al obtener funciones");
    return response.json();
};