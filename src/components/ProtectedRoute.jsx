import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";

function ProtectedRoute({ children, requiredRole }) {
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState(null);

	useEffect(() => {
		// Primero intentar obtener usuario desde localStorage como respaldo
		const localUser = localStorage.getItem('user');
		if (localUser) {
			try {
				const parsedUser = JSON.parse(localUser);
				setUser(parsedUser);
				setLoading(false);
				return;
			} catch (error) {
				console.error("Error parsing user from localStorage:", error);
				localStorage.removeItem('user');
			}
		}

		// Si no hay usuario en localStorage, intentar con la API
		getUser().then((u) => {
			if (u) {
				// Guardar en localStorage para futuras referencias
				localStorage.setItem('user', JSON.stringify(u));
			}
			setUser(u);
			setLoading(false);
		}).catch((error) => {
			console.error("Error getting user from API:", error);
			setUser(null);
			setLoading(false);
		});
	}, []);

	if (loading) return <div>Cargando...</div>;

	if (!user) {
		console.log("No hay usuario, redirigiendo a login");
		return <Navigate to="/login" />;
	}

	console.log("Usuario en ProtectedRoute:", user);
	console.log("Rol requerido:", requiredRole);
	console.log("Rol del usuario:", user.rol_id);
	console.log("¿Coinciden los roles?", user.rol_id == requiredRole);

	if (requiredRole && user.rol_id != requiredRole) {
		console.log("Rol no autorizado, redirigiendo a login");
		return <Navigate to="/login" />;
	}

	console.log("Acceso autorizado");
	return children;
}

ProtectedRoute.propTypes = {
	children: PropTypes.node.isRequired,
	requiredRole: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ProtectedRoute;
