import api from "./api";

export async function getUser() {
	try {
		const res = await api.get("/me/");
		
		console.log("Respuesta de getUser:", res.data);
		
		// Verificar si la respuesta tiene la estructura esperada
		if (res.data && res.data.user) {
			return res.data.user;
		} else if (res.data && res.data.id) {
			// Si la respuesta es directamente el usuario
			return res.data;
		} else {
			console.error("Estructura de respuesta inesperada:", res.data);
			return null;
		}
	} catch (err) {
		console.error("Error al verificar usuario:", err);
		console.error("Status:", err.response?.status);
		console.error("Data:", err.response?.data);
		return null;
	}	
}
