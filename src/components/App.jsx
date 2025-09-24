import React from "react";
import { Route, Routes } from "react-router-dom";
import "../styles/css/App.css";

import AgregarTamano from "@/pages/Admin/Compras/Productos/Tamanos/AgregarTamano";
import EditarTamano from "@/pages/Admin/Compras/Productos/Tamanos/EditarTamano";
import AgregarCatInsumo from "../pages/Admin/Compras/CategoriaInsumos/AgregarCatInsumo";
import EditarCatInsumo from "../pages/Admin/Compras/CategoriaInsumos/EditarCatInsumo";
import CategoriaInsumoAdmin from "../pages/Admin/Compras/CategoriaInsumos/Index";
import AgregarCatProducto from "../pages/Admin/Compras/CategoriaProductos/AgregarCatProducto";
import EditarCatProducto from "../pages/Admin/Compras/CategoriaProductos/EditarCatProducto";
import CategoriasProducto from "../pages/Admin/Compras/CategoriaProductos/Index";
import Compras from "../pages/Admin/Compras/Compra/Index";
import AgregarCompra from "../pages/Admin/Compras/Compra/AgregarCompra";
import AgregarInsumo from "../pages/Admin/Compras/Insumos/AgregarInsumos";
import EditarInsumo from "../pages/Admin/Compras/Insumos/EditarInsumos";
import InsumoAdmin from "../pages/Admin/Compras/Insumos/Index";
import Productos from "../pages/Admin/Compras/Productos/Index";
import AgregarProducto from "../pages/Admin/Compras/Productos/AgregarProducto";
import EditarProducto from "../pages/Admin/Compras/Productos/EditarProducto";
import AgregarTalla from "../pages/Admin/Compras/Productos/Tallas/AgregarTalla";
import EditarTalla from "../pages/Admin/Compras/Productos/Tallas/EditarTalla";
import Tallas from "../pages/Admin/Compras/Productos/Tallas/Index";
import Tamanos from "../pages/Admin/Compras/Productos/Tamanos/Index";
import AgregarProveedor from "../pages/Admin/Compras/Proveedores/AgregarProveedor";
import EditarProveedor from "../pages/Admin/Compras/Proveedores/EditarProveedor";
import Proveedores from "../pages/Admin/Compras/Proveedores/Index";
import RolesAdminAgregar from "../pages/Admin/Configuracion/Roles/Agregar";
import RolesAdminAsignacion from "../pages/Admin/Configuracion/Roles/Asignacion";
import RolesAdminEditar from "../pages/Admin/Configuracion/Roles/Editar";
import RolesAdmin from "../pages/Admin/Configuracion/Roles/Index";

import Dashboard from "../pages/Admin/Dashboard";
import AgendamientosPage from "../pages/Admin/Servicios/Agendamiento/Agendamientos";
import HorarioAdmin from "../pages/Admin/Servicios/Horarios/Index";
import AgregarServicio from "../pages/Admin/Servicios/Servicio/AgregarServicio";
import EditarServicios from "../pages/Admin/Servicios/Servicio/EditarServicios";
import ServicioAdmin from "../pages/Admin/Servicios/Servicio/Index";
import AgregarEmpleado from "../pages/Admin/Usuarios/Empleados/AgregarEmpleado";
import EditarEmpleado from "../pages/Admin/Usuarios/Empleados/EditarEmpleado";
import EmpleadoAdmin from "../pages/Admin/Usuarios/Empleados/Index";
import UsuarioAgregar from "../pages/Admin/Usuarios/Usuario/Agregar";
import UsuarioEditar from "../pages/Admin/Usuarios/Usuario/Editar";
import UsuarioAdmin from "../pages/Admin/Usuarios/Usuario/Index";
import ClienteAdmin from "../pages/Admin/Usuarios/Ventas/Clientes/Index";
import ClientesAgregar from "../pages/Admin/Usuarios/Ventas/Clientes/Agregar";
import ClientesEditar from "../pages/Admin/Usuarios/Ventas/Clientes/Editar";
import DevolucionesAdmin from "../pages/Admin/Usuarios/Ventas/Devoluciones/Index";
import VentaAdmin from "../pages/Admin/Usuarios/Ventas/Venta/Index";
import AgregarVenta from "../pages/Admin/Usuarios/Ventas/Venta/AgregarVenta";
import AgregarNovedad from "../pages/Admin/Servicios/Horarios/AgregarNovedad";
import EditarNovedad from "../pages/Admin/Servicios/Horarios/EditarNovedad";
import AuthForm from "../pages/Auth/AuthForm";
import RecoverPassword from "../pages/Auth/RCP";
import Home from "../pages/Landing/Home";
import UsuarioIndex from "../pages/Landing/Home";
import Perfil from "../pages/Landing/Perfil";
import AgregarAgendamiento from "../pages/Admin/Servicios/Agendamiento/AgregarAgendamiento";
import EditarAgendamiento from "../pages/Admin/Servicios/Agendamiento/EditarAgendamiento";


import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import AgregarDevolucion from "../pages/Admin/Usuarios/Ventas/Devoluciones/AgregarDevolucion"
import ResetPassword from "../pages/Auth/ResetPassword"
import ActivateAccount from "../pages/Auth/ActivateAccount";

function App() {
	return (
		<Routes>
			{/* Rutas públicas */}
			<Route path="/" element={<Home />} />
			<Route path="/login" element={<AuthForm />} />
			<Route path="/rcp" element={<RecoverPassword />} />

			
			<Route path="/reset-password/:token" element={<ResetPassword />} />
			<Route path="/activate/:token" element={<ActivateAccount />} />
	
			{/* Rutas privadas de usuario normal */}
			
			<Route 
				path="/usuario"
				element={
					<ProtectedRoute requiredRole={2}>
						<Perfil />
					</ProtectedRoute>
				}
			>
				<Route path="perfil" element={<Perfil />} />	
			</Route>
			

			{/* Rutas administrativas con Sidebar */}
			<Route
				path="/admin"
				element={
					<ProtectedRoute requiredRole={1}>
						<AdminLayout />
					</ProtectedRoute>
				}
			>
				<Route path="dashboard" element={<Dashboard />} />
				<Route path="roles" element={<RolesAdmin />} />
				<Route path="roles/agregar" element={<RolesAdminAgregar />} />
				<Route path="roles/editar/:id" element={<RolesAdminEditar />} />
				<Route path="roles/asignar/:id" element={<RolesAdminAsignacion />} />
				<Route path="usuario" element={<UsuarioAdmin />} />
				<Route path="usuario/agregar" element={<UsuarioAgregar />} />
				<Route path="usuario/editar/:id" element={<UsuarioEditar />} />
				<Route path="empleado" element={<EmpleadoAdmin />} />
				<Route path="empleado/agregar" element={<AgregarEmpleado />} />
				<Route path="empleado/editar/:id" element={<EditarEmpleado />} />
				<Route path="devoluciones" element={<DevolucionesAdmin />} />
				<Route path="servicios" element={<ServicioAdmin />} />
				<Route path="servicios/agregar" element={<AgregarServicio />} />
				<Route path="servicios/editar/:id" element={<EditarServicios />} />
				<Route path="agendamiento" element={<AgendamientosPage />} />
				<Route path="horarios" element={<HorarioAdmin />} />
				<Route path="horarios-novedades/agregar" element={<AgregarNovedad />} />
				<Route path="horarios-novedades/editar/:id"	element={<EditarNovedad />}	/>
				<Route path="compras" element={<Compras />} />
				<Route path="compras/agregar" element={<AgregarCompra />} />
				<Route path="proveedores" element={<Proveedores />} />
				<Route path="proveedores/agregar" element={<AgregarProveedor />} />
				<Route path="proveedores/editar/:id" element={<EditarProveedor />} />
				<Route path="categoriaproducto" element={<CategoriasProducto />} />
				<Route path="categoriaproducto/agregar"	element={<AgregarCatProducto />} />
				<Route path="categoriaproducto/editar/:id" element={<EditarCatProducto />}	/>
				<Route path="productos" element={<Productos />} />
				<Route path="productos/agregar" element={<AgregarProducto />} />
				<Route path="productos/editar/:id" element={<EditarProducto />} />
				<Route path="tallas" element={<Tallas />} />
				<Route path="tallas/agregar" element={<AgregarTalla />} />
				<Route path="tallas/editar/:id" element={<EditarTalla />} />
				<Route path="tamanos" element={<Tamanos />} />
				<Route path="tamanos/agregar" element={<AgregarTamano />} />
				<Route path="tamanos/editar/:id" element={<EditarTamano />} />
				<Route path="agendamientos/agregar" element={<AgregarAgendamiento />} />
				<Route path="agendamientos/editar/:id" element={<EditarAgendamiento />} />
				{/*Cat.Insumo*/}
				<Route path="categoriainsumo" element={<CategoriaInsumoAdmin />} />
				<Route path="categoriainsumo/agregar" element={<AgregarCatInsumo />} />
				<Route
					path="categoriainsumo/editar/:id"
					element={<EditarCatInsumo />}
				/>

				<Route path="insumo" element={<InsumoAdmin />} />
				<Route path="insumo/agregar" element={<AgregarInsumo />} />
				<Route path="insumo/editar/:id" element={<EditarInsumo />} />

				{/* Rutas de ventas */}
				<Route path="ventas" element={<VentaAdmin />} />
				<Route path="ventas/agregar" element={<AgregarVenta />} />

				<Route path="clientes" element={<ClienteAdmin />} />
				<Route path="clientes/agregar" element={<ClientesAgregar />} />
				<Route path="clientes/editar/:id" element={<ClientesEditar />} />
				<Route path="devoluciones" element={<DevolucionesAdmin />} />
				<Route path="devoluciones/agregar" element={<AgregarDevolucion />} />
			</Route>
		</Routes>
	);
}

export default App;
