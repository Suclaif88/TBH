import {
	faArrowLeft,
	faArrowRight,
	faEnvelope,
	faEye,
	faEyeSlash,
	faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "@/styles/css/AuthForm.module.css";
import api from "@/utils/api";
import { showAlert } from "@/components/AlertProvider";
import { debugCookies, setCookie } from "@/utils/cookieUtils";

const ENDPOINTS = {
	login: "/auth/login",
	register: "/auth/register",
	me: "/me/",
};

const AuthForm = () => {
	const navigate = useNavigate();
	const [isLogin, setIsLogin] = useState(true);
	const [correo, setCorreo] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [documento, setDocumento] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");

		if (!isLogin && password !== confirmPassword) {
			return showAlert("Las contraseñas no coinciden." , {
				type: "error",
				title: "Datos inválidos",
			},setLoading(false))
		}

		if (!isLogin && (documento.length < 7 || documento.length > 15)) {
			return showAlert("El documento debe tener entre 7 y 15 números.",{
				type: "error",
				title: "Datos inválidos",
			},setLoading(false))
		}

		if (!correo.trim()) {
					return showAlert("Debe completar el campo correo.", {
						type: "error",
						title: "Datos inválidos",
					},setLoading(false));
				}

		
		const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!correoRegex.test(correo)) {
					return showAlert("El correo ingresado no es válido.", {
						type: "error",
						title: "Datos inválidos",
					},setLoading(false));
				}
		

		if (password.length < 6 ||
			!/[0-9]/.test(password) 
		) {
			return showAlert(
				"La contraseña debe tener al menos 6 caracteres.",
				{
					type: "error",
					title: "Datos inválidos",
				},setLoading(false)
			);
		}

		await new Promise((resolve) => setTimeout(resolve, 3000));

		const endpoint = isLogin ? ENDPOINTS.login : ENDPOINTS.register;
		const payload = isLogin
			? { Correo: correo, Password: password }
			: { Documento: documento, Correo: correo, Password: password };

		try {
			const response = await api.post(endpoint, payload, {
				withCredentials: true,
				headers: {
					'Content-Type': 'application/json',
				}
			});

			if (response.status === 200 || response.status === 201) {
				if (isLogin) {
					showAlert("¡Login exitoso!",{
						type: "success",
						duration: 2500,
					});

					// Debug: verificar cookies después del login
					debugCookies();

					// Verificar si el servidor envió un token en la respuesta
					const serverToken = response.data?.token || response.data?.access_token;
					if (serverToken) {
						console.log("Token recibido del servidor:", serverToken);
						// Guardar token en localStorage
						localStorage.setItem('authToken', serverToken);
						
						// También intentar establecer una cookie manualmente
						setCookie('token', serverToken, 1); // 1 día de expiración
					}

					// Esperar un momento para que las cookies se establezcan
					await new Promise(resolve => setTimeout(resolve, 1000));

					try {
						// Debug: verificar cookies antes de hacer la petición
						console.log("Cookies antes de /me:", document.cookie);
						
						// Intentar múltiples endpoints si es necesario
						let meResponse;
						try {
							meResponse = await api.get(ENDPOINTS.me, {
								withCredentials: true,
								headers: {
									'Authorization': `Bearer ${serverToken || localStorage.getItem('authToken')}`
								}
							});
						} catch (firstError) {
							console.log("Primer intento falló, intentando con /me (sin slash)");
							meResponse = await api.get("/me", {
								withCredentials: true,
								headers: {
									'Authorization': `Bearer ${serverToken || localStorage.getItem('authToken')}`
								}
							});
						}
						
						console.log("Respuesta completa de /me:", meResponse.data);
						
						// Intentar extraer el usuario de diferentes formas
						let user = null;
						if (meResponse.data && meResponse.data.user) {
							user = meResponse.data.user;
						} else if (meResponse.data && meResponse.data.id) {
							user = meResponse.data;
						} else {
							console.error("No se pudo extraer usuario de la respuesta");
						}

						// Validar que el usuario existe
						if (!user) {
							console.error("Usuario es null en la respuesta");
							
							// Intentar usar información del login como respaldo
							if (response.data && response.data.user) {
								console.log("Usando información del login como respaldo");
								user = response.data.user;
							} else {
								showAlert("Error: No se pudo obtener información del usuario", {
									type: "error",
									title: "Error de autenticación",
								});
								navigate("/");
								return;
							}
						}

						// Debug: verificar datos del usuario
						console.log("Usuario obtenido:", user);
						console.log("Rol del usuario:", user.rol_id);
						console.log("Tipo de rol:", typeof user.rol_id);

						// Validar que el rol existe
						if (user.rol_id === null || user.rol_id === undefined) {
							console.error("Rol del usuario es null o undefined");
							showAlert("Error: El usuario no tiene un rol asignado", {
								type: "error",
								title: "Error de autorización",
							});
							navigate("/");
							return;
						}

						// Guardar información del usuario en localStorage para persistencia
						const userWithToken = {
							...user,
							token: serverToken || localStorage.getItem('authToken')
						};
						localStorage.setItem('user', JSON.stringify(userWithToken));

						// Redirección basada en el rol
						if (user.rol_id === 2 || user.rol_id === "2") {
							// Usuario cliente - redirigir a perfil
							console.log("Redirigiendo a perfil de usuario");
							navigate("/usuario/perfil");
						} else if (user.rol_id === 1 || user.rol_id === "1") {
							// Usuario admin - redirigir al dashboard
							console.log("Redirigiendo a dashboard de admin");
							navigate("/admin/dashboard");
						} else {
							// Otros roles o sin rol definido
							console.log("Rol no reconocido:", user.rol_id, "redirigiendo a home");
							navigate("/");
						}
					} catch (meError) {
						console.error("Error obteniendo datos del usuario:", meError);
						console.log("Cookies después del error:", document.cookie);
						
						// Mostrar error específico al usuario
						showAlert("Error al verificar la sesión del usuario", {
							type: "error",
							title: "Error de autenticación",
						});
						
						// Si hay error al obtener datos del usuario, redirigir a la página principal
						navigate("/");
					}
				} else {
					showAlert("Registro exitoso!",{
						type: "success",
						duration: 2500,
						
					});
				}
			}
		} catch (error) {
				const errorMessage = error.response?.data?.error || "Error al conectar con el servidor.";
				console.error("Error:", errorMessage);

				showAlert(`Error: ${errorMessage}`, {
					duration: 2500,
					title: "Error",
					icon: "error",
				});

				setMessage(errorMessage);
			} finally {
				setLoading(false);
			}

	};

	return (
		<div className={`${styles.container} ${isLogin ? "" : styles.active}`}>
			<div
				className={`${styles["form-box"]} ${isLogin ? styles.login : styles.register}`}
			>
				<form onSubmit={handleSubmit}>
					<h1>{isLogin ? "Ingresar" : "Registro De Cliente"}</h1>

					{!isLogin && (
						<div className={styles["input-box"]}>
							<input
								type="text"
								placeholder="Documento"
								value={documento}
								onChange={(e) => {
									const value = e.target.value;
									
									if (/^\d*$/.test(value)) {
										setDocumento(value);
									}
								}}
							/>


							<i className={styles.icon}>
								<FontAwesomeIcon icon={faIdCard} />
							</i>
						</div>
					)}

					<div className={styles["input-box"]}>
						<input
							type="email"
							placeholder="Correo electrónico"
							value={correo}
							onChange={(e) => setCorreo(e.target.value)}
						/>
						<i className={styles.icon}>
							<FontAwesomeIcon icon={faEnvelope} />
						</i>
					</div>

					<div className={styles["input-box"]}>
						<input
							type={showPassword ? "text" : "password"}
							placeholder="Contraseña"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<button
							type="button"
							className={styles.icon}
							onClick={() => setShowPassword(!showPassword)}
							style={{
								cursor: "pointer",
								background: "none",
								border: "none",
								padding: 0,
							}}
							aria-label={
								showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
							}
						>
							<FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
						</button>
					</div>

					{!isLogin && (
						<div className={styles["input-box"]}>
							<input
								type={showPassword ? "text" : "password"}
								placeholder="Confirmar contraseña"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
							/>

							<button
								type="button"
								className={styles.icon}
								onClick={() => setShowPassword(!showPassword)}
								style={{
									cursor: "pointer",
									background: "none",
									border: "none",
									padding: 0,
								}}
								aria-label={
									showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
								}
							>
								<FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
							</button>
						</div>
					)}

					{isLogin && (
						<div className={styles["forgot-link"]}>
							<a href="/rcp">¿Has olvidado tu contraseña?</a>
						</div>
					)}

					<button type="submit" className={styles.btn} disabled={loading}>
						{loading ? (
							<span className="loader" />
						) : isLogin ? (
							"Entrar"
						) : (
							"Registrarse"
						)}
					</button>

					{message && <p className={styles.message}>{message}</p>}
				</form>
			</div>

			<div className={styles["toggle-box"]}>
				<div className={`${styles["toggle-panel"]} ${styles["toggle-left"]}`}>
					<a href="/" style={{ color: "inherit" }}>
						<div>
							<FontAwesomeIcon icon={faArrowLeft} style={{ color: "#fff" }} />
						</div>
					</a>
					<button
						type="button"
						className={styles.btn}
						onClick={() => setIsLogin(false)}
					>
						Registro
					</button>
				</div>
				<div className={`${styles["toggle-panel"]} ${styles["toggle-right"]}`}>
					<a href="/">
						<div>
							<FontAwesomeIcon icon={faArrowRight} style={{ color: "#fff" }} />
						</div>
					</a>
					<button
						type="button"
						className={styles.btn}
						onClick={() => setIsLogin(true)}
					>
						Ingreso
					</button>
				</div>
			</div>
		</div>
	);
};

export default AuthForm;
