// Utilidades para manejo de cookies

export const setCookie = (name, value, days = 7) => {
	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
	
	// Configuración para diferentes entornos
	const isProduction = window.location.hostname !== 'localhost';
	const isVercel = window.location.hostname.includes('vercel.app');
	
	let cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/`;
	
	if (isProduction) {
		cookieString += '; Secure';
		if (isVercel) {
			// Para Vercel, no especificar dominio para evitar problemas
			cookieString += '; SameSite=None';
		} else {
			cookieString += '; SameSite=Lax';
		}
	} else {
		cookieString += '; SameSite=Lax';
	}
	
	console.log(`Setting cookie: ${cookieString}`);
	document.cookie = cookieString;
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
	const isVercel = window.location.hostname.includes('vercel.app');
	
	let cookieString = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
	
	if (isProduction) {
		cookieString += '; Secure';
		if (isVercel) {
			cookieString += '; SameSite=None';
		} else {
			cookieString += '; SameSite=Lax';
		}
	} else {
		cookieString += '; SameSite=Lax';
	}
	
	document.cookie = cookieString;
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

export const clearAuthData = () => {
	clearAllCookies();
	localStorage.removeItem('user');
};
