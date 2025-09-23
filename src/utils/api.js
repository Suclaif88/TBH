import axios from "axios";
import { clearAllCookies } from "./cookieUtils";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Si es un error 401, limpiar cualquier estado de autenticación local
			console.log("Error 401: Usuario no autenticado");
			
			// Solo redirigir si no estamos ya en la página de login
			if (!window.location.pathname.includes('/auth') && !window.location.pathname.includes('/login')) {
				// Limpiar todas las cookies
				clearAllCookies();
				
				// Redirigir al login
				window.location.href = '/auth';
			}
		}
		return Promise.reject(error);
	}
);

export default api;
