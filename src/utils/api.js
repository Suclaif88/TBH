import axios from "axios";
import { clearAuthData } from "./cookieUtils";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Interceptor para agregar token de autorización si está disponible
api.interceptors.request.use(
	(config) => {
		// Intentar obtener token de las cookies primero
		const token = document.cookie
			.split('; ')
			.find(row => row.startsWith('token='))
			?.split('=')[1];
		
		// Si no hay token en cookies, intentar desde localStorage
		if (!token) {
			const user = localStorage.getItem('user');
			if (user) {
				try {
					const userData = JSON.parse(user);
					if (userData.token) {
						config.headers.Authorization = `Bearer ${userData.token}`;
					}
				} catch (error) {
					console.error("Error parsing user data:", error);
				}
			}
		}
		
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Si es un error 401, limpiar cualquier estado de autenticación local
			console.log("Error 401: Usuario no autenticado");
			
			// Solo redirigir si no estamos ya en la página de login
			if (!window.location.pathname.includes('/auth') && !window.location.pathname.includes('/login')) {
				// Limpiar todas las cookies y localStorage
				clearAuthData();
				
				// Redirigir al login
				window.location.href = '/login';
			}
		}
		return Promise.reject(error);
	}
);

export default api;
