// Utilidades para manejo de cookies

export const setCookie = (name, value, days = 7) => {
	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
	
	// Configuración para diferentes entornos
	const isProduction = window.location.hostname !== 'localhost';
	const domain = isProduction ? '.vercel.app' : 'localhost';
	const secure = isProduction ? '; Secure' : '';
	const sameSite = isProduction ? '; SameSite=None' : '; SameSite=Lax';
	
	document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;domain=${domain}${secure}${sameSite}`;
};

export const getCookie = (name) => {
	const nameEQ = name + "=";
	const ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
};

export const deleteCookie = (name) => {
	const isProduction = window.location.hostname !== 'localhost';
	const domain = isProduction ? '.vercel.app' : 'localhost';
	
	document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`;
};

export const clearAllCookies = () => {
	document.cookie.split(";").forEach((c) => {
		const eqPos = c.indexOf("=");
		const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
		if (name) {
			deleteCookie(name);
		}
	});
};
