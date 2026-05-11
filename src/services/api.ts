import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig  } from 'axios';
import { API_CONFIG } from '../config/config';
import Cookies from 'js-cookie';

// Configuración basica de la extención de Axios para todos los servicios a utilizar.
interface CustomAxiosConfig extends AxiosRequestConfig {
    skipAuth?: boolean;
}

class ApiService {

    private api: AxiosInstance;
    //Constructor basico para la instancia de axios
    //Contiene el content-type que nos permitira resivir y enviar json
    //y el whithcredentials, que nos permite enviar y recivir cookies.
    constructor() {
        this.api = axios.create({
        baseURL: API_CONFIG.BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
        
        withCredentials: true,
    });

    //Configuración basica para interaciar entre el token resivido y guardarlo en el encabezado del token
    this.api.interceptors.request.use(
        (config) => {
            const token = Cookies.get('token');
            if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
        },
        (error) => Promise.reject(error)
    );

    
    //Interceptor para verificar el uso del token necesario
    this.api.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            if (error.response?.status === 401) {
                Cookies.remove('token');
                window.location.href = '/';
            }
            return Promise.reject(error);
            }
        );
    }
    //Elementos para ocupar los metodos http
    public get<T>(url: string, config: CustomAxiosConfig= {}) {
        return this.api.get<T>(url, config);
    }

    public post<T>(url: string, data?: unknown, config: CustomAxiosConfig= {}) {
        return this.api.post<T>(url, data, config);
    }

    public put<T>(url: string, data?: unknown, config: CustomAxiosConfig= {}) {
        return this.api.put<T>(url, data, config);
    }

    public delete<T>(url: string, config: CustomAxiosConfig= {}) {
        return this.api.delete<T>(url, config);
    }
    public patch<T>(url:string,data? :unknown,config: CustomAxiosConfig={}){
        return this.api.patch<T>(url,data,config);
    }
}

export default new ApiService();