import { useEffect, useState, type FormEvent } from 'react';
import { Package, Plus } from 'lucide-react';
import { apiFetch } from '../../services/api';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import type { Producto } from '../../types/domain';

export default function Catalogo() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState('');
  const [modalCatalogoOpen, setModalCatalogoOpen] = useState(false);
  const [nombreProducto, setNombreProducto] = useState('');
  const [productoEditando, setProductoEditando] = useState<number | null>(null);
  const [descripcionProducto, setDescripcionProducto] = useState('');
  const [unidadMedidaProducto, setUnidadMedidaProducto] = useState('Unidades');
  const [estadoProducto, setEstadoProducto] = useState('Activo');
  const [registrandoProducto, setRegistrandoProducto] = useState(false);
  const [mensajeRegistro, setMensajeRegistro] = useState('');
  const [errorRegistro, setErrorRegistro] = useState('');
  const [pagina, setPagina] = useState(1);
  const paginaSize = 10;

  useEffect(() => {
    const controller = new AbortController();
    const obtenerProductos = async () => {
      try {
        const respuesta = await apiFetch('/catalogo/productos', { signal: controller.signal });
        if (!respuesta.ok) throw new Error('No se pudieron obtener los productos.');
        setProductos((await respuesta.json()) as Producto[]);
        setErrorProductos('');
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        setErrorProductos(error instanceof Error ? error.message : 'Error al consultar los productos.');
      } finally {
        if (!controller.signal.aborted) setCargandoProductos(false);
      }
    };
    void obtenerProductos();
    return () => controller.abort();
  }, []);

// FUNCIONES CATÁLOGO
// =========================

const limpiarFormulario = () => {
  setProductoEditando(null);
  setNombreProducto('');
  setDescripcionProducto('');
  setUnidadMedidaProducto('Unidades');
  setEstadoProducto('Activo');
  setMensajeRegistro('');
  setErrorRegistro('');
};

const prepararEdicion = (producto: Producto) => {
  setProductoEditando(producto.id_producto);
  setNombreProducto(producto.nombre);
  setDescripcionProducto(producto.descripcion ?? '');
  setUnidadMedidaProducto(producto.unidad_medida);
  setEstadoProducto(producto.estado);
  setMensajeRegistro('');
  setErrorRegistro('');
};

const registrarProducto = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  setRegistrandoProducto(true);
  setMensajeRegistro('');
  setErrorRegistro('');

  const editando = productoEditando !== null;

  try {
    const respuesta = await apiFetch(
      editando
        ? `/catalogo/productos/${productoEditando}`
        : '/catalogo/productos',
      {
        method: editando ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombreProducto.trim(),
          descripcion: descripcionProducto.trim() || undefined,
          unidad_medida: unidadMedidaProducto,
          estado: estadoProducto,
        }),
      },
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.message || 'No se pudo guardar el producto.',
      );
    }

    setMensajeRegistro(
      resultado.mensaje ||
        (editando
          ? 'Producto actualizado correctamente.'
          : 'Producto registrado correctamente.'),
    );

    limpiarFormulario();
    setModalCatalogoOpen(false);

    const consulta = await apiFetch('/catalogo/productos');

    if (!consulta.ok) {
      throw new Error(
        'El producto se guardó, pero no se pudo actualizar la tabla.',
      );
    }

    const datos: Producto[] = await consulta.json();
    setProductos(datos);
  } catch (error) {
    setErrorRegistro(
      error instanceof Error
        ? error.message
        : 'Ocurrió un error al guardar el producto.',
    );
  } finally {
    setRegistrandoProducto(false);
  }
};

const desactivarProducto = async (id_producto: number) => {
  const confirmado = window.confirm(
    '¿Deseas desactivar este producto? El registro se conservará en la base de datos.',
  );

  if (!confirmado) return;

  setMensajeRegistro('');
  setErrorRegistro('');

  try {
    const respuesta = await apiFetch(`/catalogo/productos/${id_producto}`, {
      method: 'DELETE',
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.message || 'No se pudo desactivar el producto.',
      );
    }

    const consulta = await apiFetch('/catalogo/productos');

    if (!consulta.ok) {
      throw new Error('No se pudo actualizar la lista de productos.');
    }

    const datos: Producto[] = await consulta.json();
    setProductos(datos);

    if (productoEditando === id_producto) {
      limpiarFormulario();
    }

    setMensajeRegistro(
      resultado.mensaje || 'Producto desactivado correctamente.',
    );
  } catch (error) {
    setErrorRegistro(
      error instanceof Error
        ? error.message
        : 'Ocurrió un error al desactivar el producto.',
    );
  }
};

// =========================
// FUNCIONES PRODUCCIÓN

  return (
            <section className="catalog-page">

              <section className="welcome-section">
                <div>
                  <div className="eyebrow">
                    <Package size={15} />
                    GESTIÓN DE CATÁLOGO
                  </div>

                  <h1>Catálogo de productos</h1>

                  <p>
                    Administra y consulta los productos registrados en NEXOLOTE.
                  </p>
                </div>

                <div className="page-actions">
                  <button
                    className="btn-primario"
                    onClick={() => {
                      limpiarFormulario();
                      setModalCatalogoOpen(true);
                    }}
                  >
                    <Plus size={18} />
                    Agregar producto
                  </button>
                </div>
              </section>

              {/* Modal Catálogo */}
              <Modal
                open={modalCatalogoOpen}
                onClose={() => setModalCatalogoOpen(false)}
                titulo={
                  productoEditando !== null ? 'Editar producto' : 'Nuevo producto'
                }
                icono={Package}
              >
                <form className="product-form" onSubmit={registrarProducto}>
                  <div className="form-field">
                    <label htmlFor="nombreProducto">Nombre del producto</label>
                    <input
                      id="nombreProducto"
                      type="text"
                      value={nombreProducto}
                      onChange={(e) => setNombreProducto(e.target.value)}
                      placeholder="Ej. Yogur de fresa"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="descripcionProducto">Descripción</label>
                    <textarea
                      id="descripcionProducto"
                      value={descripcionProducto}
                      onChange={(e) => setDescripcionProducto(e.target.value)}
                      placeholder="Describe el producto..."
                      rows={3}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="unidadMedida">Unidad de medida</label>
                      <select
                        id="unidadMedida"
                        value={unidadMedidaProducto}
                        onChange={(e) => setUnidadMedidaProducto(e.target.value)}
                      >
                        <option value="Unidades">Unidades</option>
                        <option value="Litros">Litros</option>
                        <option value="Kilogramos">Kilogramos</option>
                        <option value="Gramos">Gramos</option>
                        <option value="Mililitros">Mililitros</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="estadoProducto">Estado</label>
                      <select
                        id="estadoProducto"
                        value={estadoProducto}
                        onChange={(e) => setEstadoProducto(e.target.value)}
                      >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  {mensajeRegistro && (
                    <p className="catalog-success">{mensajeRegistro}</p>
                  )}

                  {errorRegistro && (
                    <p className="catalog-error">{errorRegistro}</p>
                  )}

                  <div className="form-row">
                    <button
                      type="button"
                      className="btn-secundario"
                      onClick={() => setModalCatalogoOpen(false)}
                      disabled={registrandoProducto}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-primario"
                      disabled={registrandoProducto}
                    >
                      {registrandoProducto ? 'Guardando...' : 'Guardar producto'}
                    </button>
                  </div>
                </form>
              </Modal>

              <section className="panel activity-panel">
                <div className="panel-header">
                  <div>
                    <h3>Productos registrados</h3>
                    <p>Información obtenida desde la base de datos.</p>
                  </div>

                  <span className="product-count">
                    {productos.filter((producto) => producto.estado === 'Activo').length} productos activos
                  </span>
                </div>

                {cargandoProductos ? (
                  <p className="catalog-message">Cargando productos...</p>
                ) : errorProductos ? (
                  <p className="catalog-error">{errorProductos}</p>
                ) : productos.filter((producto) => producto.estado === 'Activo').length === 0 ? (
                  <p className="catalog-message">
                    No hay productos activos registrados.
                  </p>
                ) : (
                  <>
                    <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>NOMBRE</th>
                          <th>DESCRIPCIÓN</th>
                          <th>UNIDAD DE MEDIDA</th>
                          <th>ESTADO</th>
                          <th>ACCIONES</th>
                        </tr>
                      </thead>

                      <tbody>
                        {productos
                          .filter((producto) => producto.estado === 'Activo')
                          .slice((pagina - 1) * paginaSize, pagina * paginaSize)
                          .map((producto) => (
                            <tr key={producto.id_producto}>
                              <td className="reference">
                                {producto.id_producto}
                              </td>

                              <td>
                                <strong>{producto.nombre}</strong>
                              </td>

                              <td>
                                {producto.descripcion || 'Sin descripción'}
                              </td>

                              <td>{producto.unidad_medida}</td>

                              <td>
                                <span className="status-badge completed">
                                  {producto.estado}
                                </span>
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="btn-editar"
                                  onClick={() => prepararEdicion(producto)}
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  className="btn-eliminar"
                                  onClick={() =>
                                    desactivarProducto(producto.id_producto)
                                  }
                                >
                                  Desactivar
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                                      <Pagination page={pagina} total={productos.length} pageSize={paginaSize} onPageChange={setPagina} />
                  </>

                )}
              </section>

            </section>

  );
}
