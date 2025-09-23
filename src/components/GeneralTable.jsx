import PropTypes from "prop-types";
import React, { useMemo, useState } from "react";
import Button from "./Buttons/Button";
import BasicPagination from "./Paginacion";

const GeneralTable = ({
	title,
	columns,
	data,
	onAdd,
	onView,
	onEdit,
	onDelete,
	onToggleEstado,
	idAccessor = "id",
	stateAccessor = "Estado",
	onAssignPermissions,
	itemsPerPage = 6,
	canEdit,
	canDelete,
	verImagenes,
	...rest
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);

	const lowerSearch = searchTerm.toLowerCase();

	const matchEstado = (estado) => {
		if (["1", "activo", "completada"].includes(lowerSearch))
			return (
				estado === true ||
				estado === 1 ||
				estado === "Activo" ||
				estado === "Completada"
			);
		if (["0", "inactivo", "anulada"].includes(lowerSearch))
			return (
				estado === false ||
				estado === 0 ||
				estado === "Inactivo" ||
				estado === "Anulada"
			);
		return false;
	};

	const filteredData = useMemo(() => {
		if (!searchTerm) return data;

		return data.filter((item) =>
			columns.some((col) => {
				const value = item[col.accessor];
				if (col.accessor === stateAccessor) {
					return matchEstado(value);
				}
				return value?.toString().toLowerCase().includes(lowerSearch);
			}),
		);
	}, [searchTerm, data, columns]);

	const totalPages = Math.ceil(filteredData.length / itemsPerPage);

	const paginatedData = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredData.slice(start, start + itemsPerPage);
	}, [filteredData, currentPage, itemsPerPage]);

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	const handlePageChange = (event, value) => {
		setCurrentPage(value);
	};

	return (
		<div className="p-9 w-full">
			<h1 className="text-5xl font-bold mb-4 text-black">Gestión de {title}</h1>

			<div className="p-4 bg-white rounded-lg mb-4 shadow-md">
				<div className="flex items-center w-full gap-2">
					<form
						className="flex items-center gap-2 bg-white border rounded-[40px] p-2 shadow-md w-[30%] h-[45px]"
						onSubmit={(e) => e.preventDefault()}
					>
						<input
							type="text"
							placeholder="Buscar..."
							className="p-2 border-none focus:ring-0 outline-none flex-1 h-[30px]"
							value={searchTerm}
							onChange={handleSearchChange}
						/>
					</form>

					<Button className="green" onClick={onAdd} icon="fa-plus">
						<div className="flex items-center gap-2">Agregar</div>
					</Button>

					{/* Botones específicos para ciertos títulos */}
					{title === "Productos" && (
						<div className="flex justify-end flex-1">
							<div className="flex space-x-2">
								<Button
									className="green"
									onClick={rest.goTallas}
									icon="fa-chevron-right"
								>
									Tallas
								</Button>
								<Button
									className="green"
									onClick={rest.goTamanos}
									icon="fa-chevron-right"
								>
									Tamaños
								</Button>
							</div>
						</div>
					)}

					{(title === "Tallas" || title === "Tamaños") && (
						<div className="flex justify-end flex-1">
							<Button
								className="red"
								onClick={rest.return}
								icon="fa-chevron-left"
							>
								Volver a Productos
							</Button>
						</div>
					)}
				</div>

				<div className="mt-4 border-t-4 border-black pt-4">
					<table className="min-w-full border border-gray-300 rounded-lg shadow-md overflow-hidden">
						<thead>
							<tr className="bg-black text-white">
								{columns.map((col) => (
									<th key={col.accessor} className="p-2 border border-gray-300">
										{col.header}
									</th>
								))}
								<th className="p-2 border border-gray-300 text-center">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody>
							{paginatedData.length > 0 ? (
								paginatedData.map((row) => (
									<tr key={row[idAccessor]}>
										{columns.map((col) => (
											<td
												key={col.accessor}
												className="p-2 border border-gray-300 whitespace-pre-line"
											>
												{col.accessor === stateAccessor ? (
													title !== "Compras" && title !== "Ventas" ? (
														<div className="flex justify-center">
															<label className="switch">
																<input
																	type="checkbox"
																	checked={row[stateAccessor]}
																	onChange={() =>
																		onToggleEstado(row[idAccessor])
																	}
																/>
																<span className="slider round" />
															</label>
														</div>
													) : (
														<div className="text-center font-semibold">
															<span
																className={
																	row[stateAccessor] === 3
																		? "text-yellow-600"
																		: row[stateAccessor] === 1
																		? "text-green-600"
																		: row[stateAccessor] === 2
																		? "text-red-600"
																		: row[stateAccessor]
																		? "text-green-600"
																		: "text-red-600"
																}
															>
																{row[stateAccessor] === 3
																	? "Pendiente"
																	: row[stateAccessor] === 1
																	? "Completada"
																	: row[stateAccessor] === 2
																	? "Anulada"
																	: row[stateAccessor]
																	? "Completada"
																	: "Anulada"}
															</span>
														</div>
													)
												) : (
													row[col.accessor]
												)}
											</td>
										))}
										<td className="p-2 border border-gray-300 text-center">
											<div className="flex justify-center gap-2">
												{/* Siempre visible */}
												<Button
													className="blue"
													onClick={() => onView(row)}
													icon="fa-eye"
												/>

												{(title === "Productos" || title === "Servicios") && (
													<Button
														className="green"
														onClick={() => verImagenes(row)}
														icon="fa-image"
													/>
												)}
												

												{title === "Roles" && row[stateAccessor] && row.Nombre !== "Cliente" && (
													<Button
														className="green"
														onClick={() => onAssignPermissions(row)}
														icon="fa-key"
													/>
												)}

												{title !== "Compras" &&
													title !== "Ventas" &&
													(canEdit ? canEdit(row) : true) && (
														<Button
															className="orange"
															onClick={() => onEdit(row)}
															icon="fa-pencil"
														/>
													)}

											{title !== "Compras" &&
													title !== "Ventas" &&
													row.Nombre !== "Administrador" && // 👈 aquí filtras Administrador
													(canDelete ? canDelete(row) : true) && (
														<Button
															className="red"
															onClick={() => onDelete(row)}
															icon="fa-trash"
														/>
													)}


												{/* Botones para ventas pendientes (estado 3) */}
												{title === "Ventas" &&
													row[stateAccessor] === 3 && (
														<>
															<Button
																className="green"
																onClick={() => rest.onCompletar(row)}
																icon="fa-check"
																title="Completar Venta"
															/>
															<Button
																className="red"
																onClick={() => rest.onAnular(row)}
																icon="fa-times"
																title="Anular Venta"
															/>
														</>
													)}
													
												{/* Botón de factura PDF para todas las ventas */}
												{(title === "Ventas" || title === "Compras") && (
													<Button
														className="purple"
														onClick={() => rest.onGenerarFactura(row)}
														icon="fa-file-pdf-o"
														title="Descargar Factura PDF"
													/>
												)}
													
												{/* Ventas completadas (estado 1) - sin botones, solo ver */}
												{/* No se pueden anular ventas completadas según el backend */}
													
												{/* Botón para compras completadas (estado true) */}
												{title === "Compras" &&
													row[stateAccessor] === true && (
														<Button
															className="red"
															onClick={() => rest.onCancel(row[idAccessor])}
															icon="fa-times"
														/>
													)}
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={columns.length + 1} className="p-4 text-center">
										No hay datos registrados.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			<div className="pagination mt-4">
				<center>
					<BasicPagination
						count={totalPages}
						page={currentPage}
						onChange={handlePageChange}
					/>
				</center>
			</div>
		</div>
	);
};

GeneralTable.propTypes = {
	title: PropTypes.string.isRequired,
	columns: PropTypes.arrayOf(
		PropTypes.shape({
			header: PropTypes.string.isRequired,
			accessor: PropTypes.string.isRequired,
		}),
	).isRequired,
	data: PropTypes.arrayOf(PropTypes.object).isRequired,
	onAdd: PropTypes.func.isRequired,
	onView: PropTypes.func.isRequired,
	onEdit: PropTypes.func,
	onDelete: PropTypes.func,
	onToggleEstado: PropTypes.func,
	onCompletar: PropTypes.func,
	onAnular: PropTypes.func,
	onCancel: PropTypes.func,
	idAccessor: PropTypes.string,
	stateAccessor: PropTypes.string,
	itemsPerPage: PropTypes.number,
	onAssignPermissions: PropTypes.func,
	canEdit: PropTypes.func,
	canDelete: PropTypes.func,
	verImagenes: PropTypes.func,
};

GeneralTable.defaultProps = {
	idAccessor: "id",
	stateAccessor: "Estado",
	itemsPerPage: 5,
	onAssignPermissions: () => {},
};

export default GeneralTable;
