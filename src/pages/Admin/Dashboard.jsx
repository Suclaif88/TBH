import {
	ArcElement,
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
  } from "chart.js";
  import React, { useState, useEffect } from "react";
  import { Bar, Line, Pie } from "react-chartjs-2";
  import styled from "styled-components";
  import { ventasService } from "@/service/ventas.service";
  import { comprasService } from "@/service/compras.service";
  import { productoService } from "@/service/productos.service";
  
  ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
  );
  
  const months = [
	"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
	"Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  export default function Dashboard() {
	const [ventasData, setVentasData] = useState([]);
	const [comprasData, setComprasData] = useState([]);
	const [productosData, setProductosData] = useState([]);
	const [productosMasVendidos, setProductosMasVendidos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
	const [lastUpdate, setLastUpdate] = useState(new Date());
	const [serviceErrors, setServiceErrors] = useState([]);
  
	const cargarDatos = async () => {
	  try {
		setLoading(true);
		setError(null);
		setServiceErrors([]);
		
		console.log("🔄 Cargando datos del dashboard...");
		
		let ventas = [];
		try {
		  const ventasResponse = await ventasService.obtenerVentas();
		  console.log("📊 Respuesta de ventas:", ventasResponse);
		  
		  if (Array.isArray(ventasResponse)) {
			ventas = ventasResponse;
		  } else if (ventasResponse && Array.isArray(ventasResponse.data)) {
			ventas = ventasResponse.data;
		  } else if (ventasResponse && ventasResponse.data && Array.isArray(ventasResponse.data.ventas)) {
			ventas = ventasResponse.data.ventas;
		  } else {
			const arrayProp = Object.values(ventasResponse || {}).find(Array.isArray);
			ventas = arrayProp || [];
		  }
		} catch (ventasError) {
		  console.error("❌ Error cargando ventas:", ventasError);
		  console.warn("⚠️ Continuando sin datos de ventas debido a error del servidor");
		  ventas = []; // Continuar con array vacío en lugar de fallar completamente
		  setServiceErrors(prev => [...prev, "Error al cargar ventas: " + (ventasError.response?.data?.message || ventasError.message)]);
		}
  
		let compras = [];
		try {
		  const comprasResponse = await comprasService.obtenerCompras();
		  console.log("📦 Respuesta de compras:", comprasResponse);
		  
		  if (Array.isArray(comprasResponse)) {
			compras = comprasResponse;
		  } else if (comprasResponse && Array.isArray(comprasResponse.data)) {
			compras = comprasResponse.data;
		  } else {
			const arrayProp = Object.values(comprasResponse || {}).find(Array.isArray);
			compras = arrayProp || [];
		  }
		} catch (comprasError) {
		  console.error("❌ Error cargando compras:", comprasError);
		  console.warn("⚠️ Continuando sin datos de compras debido a error del servidor");
		  compras = []; // Continuar con array vacío en lugar de fallar completamente
		  setServiceErrors(prev => [...prev, "Error al cargar compras: " + (comprasError.response?.data?.message || comprasError.message)]);
		}
  
		let productos = [];
		try {
		  const productosResponse = await productoService.obtenerProductoss();
		  console.log("📦 Respuesta de productos:", productosResponse);
		  
		  if (Array.isArray(productosResponse)) {
			productos = productosResponse;
		  } else if (productosResponse && Array.isArray(productosResponse.data)) {
			productos = productosResponse.data;
		  } else {
			const arrayProp = Object.values(productosResponse || {}).find(Array.isArray);
			productos = arrayProp || [];
		  }
		} catch (productosError) {
		  console.error("❌ Error cargando productos:", productosError);
		  console.warn("⚠️ Continuando sin datos de productos debido a error del servidor");
		  productos = []; // Continuar con array vacío
		  setServiceErrors(prev => [...prev, "Error al cargar productos: " + (productosError.response?.data?.message || productosError.message)]);
		}
  
		console.log("✅ Ventas procesadas:", ventas.length);
		console.log("✅ Compras procesadas:", compras.length);
		console.log("✅ Productos cargados:", productos.length);
  
		setVentasData(ventas);
		setComprasData(compras);
		setProductosData(productos);
		
		const productosVendidos = procesarProductosMasVendidos(ventas, productos);
		setProductosMasVendidos(productosVendidos);
		
		setLastUpdate(new Date());
		
	  } catch (err) {
		console.error("❌ Error general cargando datos:", err);
		setError(err.message || "Error al cargar los datos del dashboard");
	  } finally {
		setLoading(false);
	  }
	};
  
	const procesarProductosMasVendidos = (ventas, productos) => {
	  const productosVendidosMap = new Map();
  
	  ventas.forEach(venta => {
		try {
		  if (!venta || venta.Estado !== 1) return;
  
		  if (venta.Detalle_Venta && Array.isArray(venta.Detalle_Venta)) {
			venta.Detalle_Venta.forEach(detalle => {
			  if (detalle.Id_Productos) {
				const productId = detalle.Id_Productos;
				const cantidad = parseInt(detalle.Cantidad) || 0;
				const subtotal = parseFloat(detalle.Subtotal) || 0;
  
				if (cantidad > 0) {
				  if (productosVendidosMap.has(productId)) {
					const existing = productosVendidosMap.get(productId);
					productosVendidosMap.set(productId, {
					  ...existing,
					  cantidadTotal: existing.cantidadTotal + cantidad,
					  ingresosTotal: existing.ingresosTotal + subtotal
					});
				  } else {
					const productoInfo = productos.find(p => 
					  p.Id_Productos === productId || p.id === productId
					);
					
					productosVendidosMap.set(productId, {
					  id: productId,
					  nombre: productoInfo?.Nombre || productoInfo?.nombre || `Producto ${productId}`,
					  cantidadTotal: cantidad,
					  ingresosTotal: subtotal,
					  precioPromedio: subtotal / cantidad
					});
				  }
				}
			  }
			});
		  }
		} catch (error) {
		  console.warn("Error procesando detalles de venta:", error);
		}
	  });
  
	  const productosVendidosArray = Array.from(productosVendidosMap.values());
	  return productosVendidosArray
		.sort((a, b) => b.cantidadTotal - a.cantidadTotal)
		.slice(0, 10);
	};
  
	const procesarVentas = () => {
	  const ventasPorMes = Array(12).fill(0);
	  const ventasCountPorMes = Array(12).fill(0);
  
	  console.log("🔍 Procesando ventas para el año:", selectedYear);
  
	  ventasData.forEach(venta => {
		try {
		  if (!venta) return;
  
		  const estado = venta.Estado || venta.estado;
		  if (estado === 2) return;
  
		  let fecha;
		  if (venta.Fecha) fecha = new Date(venta.Fecha);
		  else if (venta.fecha) fecha = new Date(venta.fecha);
		  else if (venta.fecha_venta) fecha = new Date(venta.fecha_venta);
		  else if (venta.createdAt) fecha = new Date(venta.createdAt);
		  else {
			console.warn("⏰ Venta sin fecha válida:", venta);
			return;
		  }
  
		  if (isNaN(fecha.getTime())) {
			console.warn("⏰ Fecha inválida en venta:", venta);
			return;
		  }
  
		  let total;
		  if (venta.Total !== undefined && venta.Total !== null) {
			total = parseFloat(venta.Total);
		  } else if (venta.total !== undefined && venta.total !== null) {
			total = parseFloat(venta.total);
		  } else if (venta.monto !== undefined && venta.monto !== null) {
			total = parseFloat(venta.monto);
		  } else if (venta.precio_total !== undefined && venta.precio_total !== null) {
			total = parseFloat(venta.precio_total);
		  } else {
			console.warn("💰 Venta sin total válido:", venta);
			return;
		  }
  
		  if (isNaN(total) || total <= 0) {
			console.warn("💰 Total inválido en venta:", venta, total);
			return;
		  }
  
		  if (fecha.getFullYear() === selectedYear) {
			const mes = fecha.getMonth();
			ventasPorMes[mes] += total;
			ventasCountPorMes[mes] += 1;
		  }
  
		} catch (error) {
		  console.error("❌ Error procesando venta:", venta, error);
		}
	  });
  
	  console.log("📈 Ventas por mes resultantes:", ventasPorMes);
	  return { ventasPorMes, ventasCountPorMes };
	};
  
	const procesarCompras = () => {
	  const comprasPorMes = Array(12).fill(0);
	  const comprasCountPorMes = Array(12).fill(0);
  
	  comprasData.forEach(compra => {
		try {
		  if (!compra) return;
  
		  let fecha;
		  if (compra.Fecha) fecha = new Date(compra.Fecha);
		  else if (compra.fecha) fecha = new Date(compra.fecha);
		  else if (compra.fecha_compra) fecha = new Date(compra.fecha_compra);
		  else if (compra.createdAt) fecha = new Date(compra.createdAt);
		  else return;
  
		  if (isNaN(fecha.getTime())) return;
  
		  let total;
		  if (compra.Total !== undefined && compra.Total !== null) {
			total = parseFloat(compra.Total);
		  } else if (compra.total !== undefined && compra.total !== null) {
			total = parseFloat(compra.total);
		  } else if (compra.monto !== undefined && compra.monto !== null) {
			total = parseFloat(compra.monto);
		  } else return;
  
		  if (isNaN(total) || total <= 0) return;
  
		  if (fecha.getFullYear() === selectedYear) {
			const mes = fecha.getMonth();
			comprasPorMes[mes] += total;
			comprasCountPorMes[mes] += 1;
		  }
  
		} catch (error) {
		  console.warn("Error procesando compra:", compra, error);
		}
	  });
  
	  return { comprasPorMes, comprasCountPorMes };
	};
  
	useEffect(() => {
	  cargarDatos();
	}, [selectedYear]);
  
	const { ventasPorMes, ventasCountPorMes } = procesarVentas();
	const { comprasPorMes, comprasCountPorMes } = procesarCompras();
  
	const totalVentas = ventasPorMes.reduce((sum, venta) => sum + venta, 0);
	const totalCompras = comprasPorMes.reduce((sum, compra) => sum + compra, 0);
	const totalVentasCount = ventasCountPorMes.reduce((sum, count) => sum + count, 0);
	const totalComprasCount = comprasCountPorMes.reduce((sum, count) => sum + count, 0);
	const gananciaNeta = totalVentas - totalCompras;
  
	console.log("🎯 Totales calculados:");
	console.log("Ventas:", totalVentas, "de", totalVentasCount, "transacciones");
	console.log("Compras:", totalCompras, "de", totalComprasCount, "transacciones");
  
	const lineChartData = {
	  labels: months,
	  datasets: [
		{
		  label: "Ventas",
		  data: ventasPorMes,
		  borderColor: "rgba(75, 192, 192, 1)",
		  backgroundColor: "rgba(75, 192, 192, 0.2)",
		  tension: 0.4,
		  fill: true,
		},
		{
		  label: "Compras",
		  data: comprasPorMes,
		  borderColor: "rgba(255, 99, 132, 1)",
		  backgroundColor: "rgba(255, 99, 132, 0.2)",
		  tension: 0.4,
		  fill: true,
		},
	  ],
	};
  
	const barChartData = {
	  labels: months,
	  datasets: [
		{
		  label: "Ventas",
		  data: ventasPorMes,
		  backgroundColor: "rgba(54, 162, 235, 0.6)",
		  borderColor: "rgba(54, 162, 235, 1)",
		  borderWidth: 1,
		},
		{
		  label: "Compras",
		  data: comprasPorMes,
		  backgroundColor: "rgba(255, 99, 132, 0.6)",
		  borderColor: "rgba(255, 99, 132, 1)",
		  borderWidth: 1,
		},
	  ],
	};
  
	const productosChartData = {
	  labels: productosMasVendidos.map(p => p.nombre),
	  datasets: [
		{
		  label: 'Cantidad Vendida',
		  data: productosMasVendidos.map(p => p.cantidadTotal),
		  backgroundColor: [
			'#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
			'#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
		  ],
		  borderColor: [
			'#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
			'#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
		  ],
		  borderWidth: 1
		}
	  ]
	};
  
	const productosChartOptions = {
	  responsive: true,
	  plugins: {
		legend: {
		  position: 'bottom',
		},
		tooltip: {
		  callbacks: {
			label: function(context) {
			  const product = productosMasVendidos[context.dataIndex];
			  return [
				`Producto: ${product.nombre}`,
				`Cantidad: ${product.cantidadTotal} unidades`,
				`Ingresos: $${product.ingresosTotal.toLocaleString('es-CO')}`,
				`Precio promedio: $${Math.round(product.precioPromedio).toLocaleString('es-CO')}`
			  ];
			}
		  }
		}
	  }
	};
  
	const options = {
	  responsive: true,
	  plugins: {
		legend: {
		  position: 'top',
		},
		tooltip: {
		  callbacks: {
			label: function(context) {
			  return `${context.dataset.label}: $${context.raw.toLocaleString('es-CO')}`;
			}
		  }
		}
	  },
	  scales: {
		y: {
		  beginAtZero: true,
		  ticks: {
			callback: function(value) {
			  return '$' + value.toLocaleString('es-CO');
			}
		  }
		}
	  }
	};
  
	if (loading) {
	  return (
		<HomeAdminContainer>
		  <h1>Dashboard de Ventas y Compras</h1>
		  <LoadingMessage>
			<div>Cargando datos...</div>
			<small>Conectando con los servicios</small>
		  </LoadingMessage>
		</HomeAdminContainer>
	  );
	}
  
	if (error) {
	  return (
		<HomeAdminContainer>
		  <h1>Dashboard de Ventas y Compras</h1>
		  <ErrorMessage>
			<div>{error}</div>
			<button onClick={cargarDatos}>Reintentar</button>
		  </ErrorMessage>
		</HomeAdminContainer>
	  );
	}
  
	return (
	  <HomeAdminContainer>
		<Header>
		  <div>
			<MainTitle>DASHBOARD DE VENTAS Y COMPRAS</MainTitle>
			<LastUpdate>
			  Última actualización: {lastUpdate.toLocaleTimeString()}
			</LastUpdate>
		  </div>
		  <Controls>
			<YearSelector>
			  <label>Año: </label>
			  <select 
				value={selectedYear} 
				onChange={(e) => setSelectedYear(parseInt(e.target.value))}
			  >
				{[2022, 2023, 2024, 2025].map(year => (
				  <option key={year} value={year}>{year}</option>
				))}
			  </select>
			</YearSelector>
			<RefreshButton onClick={cargarDatos}>
			  🔄 Actualizar
			</RefreshButton>
		  </Controls>
		</Header>
  
		<DataInfo>
		  <InfoItem>Ventas cargadas: {ventasData.length}</InfoItem>
		  <InfoItem>Compras cargadas: {comprasData.length}</InfoItem>
		  <InfoItem>Productos cargados: {productosData.length}</InfoItem>
		  <InfoItem>Ventas válidas: {totalVentasCount}</InfoItem>
		  <InfoItem>Compras válidas: {totalComprasCount}</InfoItem>
		</DataInfo>

		{serviceErrors.length > 0 && (
		  <ServiceErrorsContainer>
			<h4>⚠️ Advertencias del Sistema</h4>
			{serviceErrors.map((error, index) => (
			  <ServiceError key={index}>
				{error}
			  </ServiceError>
			))}
			<small>El dashboard continúa funcionando con los datos disponibles.</small>
		  </ServiceErrorsContainer>
		)}
  
		<KPIContainer>
		  <KPICard className="ventas">
			<h3>Total Ventas {selectedYear}</h3>
			<p>${totalVentas.toLocaleString('es-CO')}</p>
			<small>{totalVentasCount} transacciones</small>
		  </KPICard>
		  <KPICard className="compras">
			<h3>Total Compras {selectedYear}</h3>
			<p>${totalCompras.toLocaleString('es-CO')}</p>
			<small>{totalComprasCount} transacciones</small>
		  </KPICard>
		  <KPICard className={gananciaNeta >= 0 ? "ganancia" : "perdida"}>
			<h3>Ganancia Neta</h3>
			<p>${Math.abs(gananciaNeta).toLocaleString('es-CO')}</p>
			<small>{gananciaNeta >= 0 ? "💰 Ganancia" : "❌ Pérdida"}</small>
		  </KPICard>
		</KPIContainer>
  
		<ChartsContainer>
		  <ChartWrapper>
			<h3>Evolución Mensual - Ventas vs Compras</h3>
			<Line data={lineChartData} options={options} />
		  </ChartWrapper>
  
		  <ChartWrapper>
			<h3>Comparativo Mensual</h3>
			<Bar data={barChartData} options={options} />
		  </ChartWrapper>
  
		  <ChartWrapper>
			<h3>Productos Más Vendidos ({selectedYear})</h3>
			{productosMasVendidos.length > 0 ? (
			  <Pie data={productosChartData} options={productosChartOptions} />
			) : (
			  <NoDataMessage>
				No hay datos de productos vendidos disponibles
			  </NoDataMessage>
			)}
		  </ChartWrapper>
  
		  <ChartWrapper>
			<h3>Top 5 Productos por Cantidad</h3>
			<ProductosTable>
			  <thead>
				<tr>
				  <th>Producto</th>
				  <th>Cantidad</th>
				  <th>Ingresos</th>
				</tr>
			  </thead>
			  <tbody>
				{productosMasVendidos.slice(0, 5).map((producto, index) => (
				  <tr key={producto.id}>
					<td>
					  <span className="rank">{index + 1}.</span> 
					  {producto.nombre}
					</td>
					<td className="cantidad">{producto.cantidadTotal} und</td>
					<td className="ingresos">${producto.ingresosTotal.toLocaleString('es-CO')}</td>
				  </tr>
				))}
				{productosMasVendidos.length === 0 && (
				  <tr>
					<td colSpan="3" className="no-data">
					  No hay datos de productos
					</td>
				  </tr>
				)}
			  </tbody>
			</ProductosTable>
		  </ChartWrapper>
		</ChartsContainer>
	  </HomeAdminContainer>
	);
  }
  
  const HomeAdminContainer = styled.div`
	padding: 20px;
	margin-top: -25px;
  `;
  
  const MainTitle = styled.h1`
	text-align: center;
	margin-left: 200px;
	margin-bottom: 10px;
	font-size: 2.5rem;
	font-weight: bold;
	color: #2c3e50;
  `;
  
  const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 30px;
	flex-wrap: wrap;
	gap: 20px;
  `;
  
  const Controls = styled.div`
	display: flex;
	gap: 15px;
	align-items: center;
  `;
  
  const YearSelector = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	
	select {
	  padding: 8px 12px;
	  border: 1px solid #ddd;
	  border-radius: 4px;
	  background: white;
	}
  `;
  
  const RefreshButton = styled.button`
	padding: 8px 12px;
	background: #007bff;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	
	&:hover {
	  background: #0056b3;
	}
  `;
  
  const LastUpdate = styled.small`
	display: block;
	text-align: center;
	color: #666;
	font-size: 12px;
  `;
  
  const DataInfo = styled.div`
	display: flex;
	gap: 15px;
	margin-bottom: 20px;
	flex-wrap: wrap;
  `;
  
  const InfoItem = styled.span`
	background: #f8f9fa;
	padding: 8px 12px;
	border-radius: 6px;
	font-size: 14px;
	font-weight: bold;
	color: #495057;
	border: 1px solid #dee2e6;
  `;
  
  const KPIContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20px;
	margin-bottom: 30px;
  
	@media (max-width: 768px) {
	  grid-template-columns: 1fr;
	}
  `;
  
  const KPICard = styled.div`
	background: white;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	text-align: center;
	
	h3 {
	  margin: 0 0 10px 0;
	  color: #666;
	  font-size: 14px;
	  text-transform: uppercase;
	}
	
	p {
	  margin: 0 0 5px 0;
	  font-size: 24px;
	  font-weight: bold;
	}
  
	small {
	  color: #666;
	  font-size: 12px;
	}
  
	&.ventas p {
	  color: #10b981;
	}
  
	&.compras p {
	  color: #ef4444;
	}
  
	&.ganancia p {
	  color: #10b981;
	}
  
	&.perdida p {
	  color: #ef4444;
	}
  `;
  
  const ChartsContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20px;
  
	@media (max-width: 1024px) {
	  grid-template-columns: 1fr;
	}
  `;
  
  const ChartWrapper = styled.div`
	background: white;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	
	h3 {
	  text-align: center;
	  margin-bottom: 15px;
	  color: #333;
	}
  `;
  
  const NoDataMessage = styled.div`
	text-align: center;
	padding: 40px;
	color: #666;
	font-style: italic;
  `;
  
  const ProductosTable = styled.table`
	width: 100%;
	border-collapse: collapse;
	font-size: 12px;
  
	th, td {
	  padding: 8px;
	  text-align: left;
	  border-bottom: 1px solid #ddd;
	}
  
	th {
	  background: #f8f9fa;
	  font-weight: bold;
	}
  
	.rank {
	  font-weight: bold;
	  color: #007bff;
	  margin-right: 5px;
	}
  
	.cantidad {
	  text-align: center;
	  font-weight: bold;
	  color: #28a745;
	}
  
	.ingresos {
	  text-align: right;
	  font-weight: bold;
	  color: #17a2b8;
	}
  
	.no-data {
	  text-align: center;
	  color: #666;
	  font-style: italic;
	  padding: 20px;
	}
  
	tr:hover {
	  background: #f8f9fa;
	}
  `;
  
  const LoadingMessage = styled.div`
	text-align: center;
	padding: 60px 20px;
	font-size: 18px;
	color: #666;
	
	small {
	  display: block;
	  margin-top: 10px;
	  font-size: 14px;
	}
  `;
  
  const ErrorMessage = styled.div`
	text-align: center;
	padding: 40px 20px;
	font-size: 18px;
	color: #ef4444;
	
	button {
	  margin-top: 20px;
	  padding: 10px 20px;
	  background: #ef4444;
	  color: white;
	  border: none;
	  border-radius: 4px;
	  cursor: pointer;
	  
	  &:hover {
		background: #dc2626;
	  }
	}
  `;

  const ServiceErrorsContainer = styled.div`
	background: #fff3cd;
	border: 1px solid #ffeaa7;
	border-radius: 8px;
	padding: 15px;
	margin-bottom: 20px;
	
	h4 {
	  margin: 0 0 10px 0;
	  color: #856404;
	  font-size: 16px;
	}
	
	small {
	  display: block;
	  margin-top: 10px;
	  color: #856404;
	  font-size: 12px;
	}
  `;

  const ServiceError = styled.div`
	background: #f8d7da;
	border: 1px solid #f5c6cb;
	border-radius: 4px;
	padding: 8px 12px;
	margin-bottom: 8px;
	color: #721c24;
	font-size: 14px;
	
	&:last-child {
	  margin-bottom: 0;
	}
  `;
  
  const DebugInfo = styled.div`
	margin-top: 30px;
	padding: 15px;
	background: #f8f9fa;
	border-radius: 8px;
	border-left: 4px solid #007bff;
  
	h4 {
	  margin: 0 0 10px 0;
	  color: #007bff;
	}
  
	p {
	  margin: 0 0 15px 0;
	  color: #666;
	  font-size: 14px;
	}
  
	button {
	  padding: 8px 16px;
	  background: #6c757d;
	  color: white;
	  border: none;
	  border-radius: 4px;
	  cursor: pointer;
	  font-size: 12px;
  
	  &:hover {
		background: #5a6268;
	  }
	}
  `;