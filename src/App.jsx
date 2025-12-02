// Archivo: src/App.jsx
// Versión PRO de la Agenda ADSO con dos vistas:
// - Vista "crear": solo formulario para crear contactos.
// - Vista "contactos": listado, búsqueda, ordenamiento, edición y eliminación.
//
// NO se usa React Router, solo un estado de vista.

import { useEffect, useState } from "react";
import {
  listarContactos,
  crearContacto,
  actualizarContacto,
  eliminarContactoPorId,
} from "./api";
import { APP_INFO } from "./config";
import FormularioContacto from "./components/FormularioContacto";
import ContactoCard from "./components/ContactoCard";

function App() {
  // Estado con todos los contactos obtenidos desde la API
  const [contactos, setContactos] = useState([]);

  // Estado de carga mientras se consulta la API
  const [cargando, setCargando] = useState(true);

  // Estado para mostrar mensajes de error globales
  const [error, setError] = useState("");

  // Estado del término de búsqueda (solo se usa en la vista "contactos")
  const [busqueda, setBusqueda] = useState("");

  // Estado del orden de la lista: true = A-Z, false = Z-A
  const [ordenAsc, setOrdenAsc] = useState(true);

  // Estado del contacto que se está editando (o null si no hay edición)
  const [contactoEnEdicion, setContactoEnEdicion] = useState(null);

  // NUEVO: estado de la vista actual ("crear" o "contactos")
  const [vista, setVista] = useState("crear");

  // useEffect para cargar la lista de contactos al iniciar la aplicación
  useEffect(() => {
    const cargarContactos = async () => {
      try {
        setCargando(true);
        setError("");
        const data = await listarContactos();
        setContactos(data);
      } catch (error) {
        console.error("Error al cargar contactos:", error);
        setError(
          "No se pudieron cargar los contactos. Verifica que el servidor esté encendido e intenta de nuevo."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarContactos();
  }, []);

  // Crear contacto (CREATE)
  const onAgregarContacto = async (nuevoContacto) => {
    try {
      setError("");
      const creado = await crearContacto(nuevoContacto);
      // Agregamos el contacto recién creado al estado local
      setContactos((prev) => [...prev, creado]);
    } catch (error) {
      console.error("Error al crear contacto:", error);
      setError(
        "No se pudo guardar el contacto. Verifica tu conexión o el estado del servidor e intenta nuevamente."
      );
      throw error;
    }
  };

  // Actualizar contacto (UPDATE)
  const onActualizarContacto = async (contactoActualizado) => {
    try {
      setError("");
      // Llamamos a la API para actualizar el contacto por id
      const actualizado = await actualizarContacto(
        contactoActualizado.id,
        contactoActualizado
      );
      // Reemplazamos en el estado el contacto que coincide por id
      setContactos((prev) =>
        prev.map((c) => (c.id === actualizado.id ? actualizado : c))
      );
      // Salimos de modo edición
      setContactoEnEdicion(null);
    } catch (error) {
      console.error("Error al actualizar contacto:", error);
      setError(
        "No se pudo actualizar el contacto. Verifica tu conexión o el servidor e intenta nuevamente."
      );
      throw error;
    }
  };

  // Eliminar contacto (DELETE)
  const onEliminarContacto = async (id) => {
    try {
      setError("");
      await eliminarContactoPorId(id);
      // Eliminamos del estado local el contacto con ese id
      setContactos((prev) => prev.filter((c) => c.id !== id));
      // Si el contacto estaba en edición, cancelamos la edición
      setContactoEnEdicion((actual) =>
        actual && actual.id === id ? null : actual
      );
    } catch (error) {
      console.error("Error al eliminar contacto:", error);
      setError(
        "No se pudo eliminar el contacto. Vuelve a intentarlo o verifica el servidor."
      );
    }
  };

  // Activar modo edición (solo se usa en la vista "contactos")
  const onEditarClick = (contacto) => {
    setContactoEnEdicion(contacto);
    setError("");
  };

  // Cancelar edición
  const onCancelarEdicion = () => {
    setContactoEnEdicion(null);
  };

  // Cambiar a vista de contactos
  const irAVerContactos = () => {
    setVista("contactos");
    setContactoEnEdicion(null); // limpiamos cualquier edición previa
  };

  // Volver a vista de creación
  const irACrearContacto = () => {
    setVista("crear");
    setContactoEnEdicion(null);
    setBusqueda(""); // limpiamos el término de búsqueda
  };

  // Filtrado por búsqueda (solo se usa en la vista "contactos")
  const contactosFiltrados = contactos.filter((c) => {
    const termino = busqueda.toLowerCase();
    const nombre = c.nombre.toLowerCase();
    const correo = c.correo.toLowerCase();
    const etiqueta = (c.etiqueta || "").toLowerCase();

    return (
      nombre.includes(termino) ||
      correo.includes(termino) ||
      etiqueta.includes(termino)
    );
  });

  // Ordenamiento A-Z / Z-A
  const contactosOrdenados = [...contactosFiltrados].sort((a, b) => {
    const nombreA = a.nombre.toLowerCase();
    const nombreB = b.nombre.toLowerCase();

    if (nombreA < nombreB) return ordenAsc ? -1 : 1;
    if (nombreA > nombreB) return ordenAsc ? 1 : -1;
    return 0;
  });

  // Variables auxiliares para saber en qué vista estamos
  const estaEnVistaCrear = vista === "crear";
  const estaEnVistaContactos = vista === "contactos";

  // JSX principal (layout tipo dashboard)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      {/* Barra superior */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
              A
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Proyecto ABP
              </p>
              <h1 className="text-sm md:text-base font-semibold text-slate-50">
                Agenda ADSO – ReactJS
              </h1>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
              SENA CTMA
            </p>
            <p className="text-xs text-slate-200">
              Ficha {APP_INFO.ficha}
            </p>
          </div>
        </div>
      </header>

      {/* Contenido principal en grid 2 columnas */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-10 pb-14">
        <div className="grid gap-8 md:grid-cols-[1.6fr,1fr] items-start">
          {/* COLUMNA IZQUIERDA: tarjeta principal (cambia según la vista) */}
          <div className="bg-white/95 rounded-3xl shadow-2xl border border-slate-100 px-6 py-7 md:px-8 md:py-8">
            {/* Encabezado dentro de la tarjeta */}
            <header className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                  {APP_INFO.titulo}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {APP_INFO.subtitulo}
                </p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 border border-purple-100">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-purple-800">
                    JSON Server conectado · {contactos.length} contacto
                    {contactos.length !== 1 && "s"}
                  </span>
                </div>
              </div>

              {/* Botón para cambiar de vista */}
              <div className="flex flex-col items-end gap-2">
                <span className="text-[11px] uppercase tracking-[0.16em] text-gray-400">
                  {estaEnVistaCrear ? "Modo creación" : "Modo contactos"}
                </span>
                {estaEnVistaCrear ? (
                  <button
                    type="button"
                    onClick={irAVerContactos}
                    className="text-xs md:text-sm px-4 py-2 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    Ver contactos
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={irACrearContacto}
                    className="text-xs md:text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100"
                  >
                    Volver a crear contacto
                  </button>
                )}
              </div>
            </header>

            {/* Mensaje de error global */}
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Contenido según la vista */}
            {cargando ? (
              <p className="text-sm text-gray-500">Cargando contactos...</p>
            ) : (
              <>
                {/* VISTA CREAR: solo formulario para crear nuevos contactos */}
                {estaEnVistaCrear && (
                  <FormularioContacto
                    onAgregar={onAgregarContacto}
                    onActualizar={onActualizarContacto}
                    contactoEnEdicion={null} // aquí nunca editamos
                    onCancelarEdicion={onCancelarEdicion}
                  />
                )}

                {/* VISTA CONTACTOS: formulario solo cuando estamos editando + lista */}
                {estaEnVistaContactos && (
                  <>
                    {/* Formulario en modo edición (solo si hay contactoEnEdicion) */}
                    {contactoEnEdicion && (
                      <div className="mb-4">
                        <FormularioContacto
                          onAgregar={onAgregarContacto}
                          onActualizar={onActualizarContacto}
                          contactoEnEdicion={contactoEnEdicion}
                          onCancelarEdicion={onCancelarEdicion}
                        />
                      </div>
                    )}

                    {/* Barra de búsqueda + orden + contador */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          className="w-full rounded-xl border-gray-300 focus:ring-purple-500 focus:border-purple-500 text-sm"
                          placeholder="Buscar por nombre, correo o etiqueta..."
                          value={busqueda}
                          onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <p className="mt-1 text-[11px] text-gray-500">
                          Mostrando {contactosOrdenados.length} de{" "}
                          {contactos.length} contacto
                          {contactos.length !== 1 && "s"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setOrdenAsc((prev) => !prev)}
                        className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-200 whitespace-nowrap"
                      >
                        {ordenAsc ? "Ordenar Z-A" : "Ordenar A-Z"}
                      </button>
                    </div>

                    {/* Lista de contactos */}
                    <section className="space-y-3 md:space-y-4">
                      {contactosOrdenados.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No se encontraron contactos que coincidan con la
                          búsqueda.
                        </p>
                      ) : (
                        contactosOrdenados.map((c) => (
                          <ContactoCard
                            key={c.id}
                            nombre={c.nombre}
                            telefono={c.telefono}
                            correo={c.correo}
                            etiqueta={c.etiqueta}
                            onEliminar={() => onEliminarContacto(c.id)}
                            onEditar={() => onEditarClick(c)}
                          />
                        ))
                      )}
                    </section>
                  </>
                )}
              </>
            )}
          </div>

          {/* COLUMNA DERECHA: Panel lateral PRO (igual en ambas vistas) */}
          <aside className="space-y-4 md:space-y-5">
            {/* Banner morado principal */}
            <div className="rounded-3xl bg-gradient-to-br from-purple-600 to-purple-800 text-white p-6 shadow-xl flex flex-col justify-between min-h-[220px]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-purple-100/80">
                  Proyecto ABP
                </p>
                <h2 className="text-lg font-bold mt-2">
                  Agenda ADSO – Dashboard
                </h2>
                <p className="text-sm text-purple-100 mt-1">
                  CRUD completo con React, JSON Server, validaciones,
                  búsqueda, ordenamiento y edición.
                </p>
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <p className="flex items-center justify-between">
                  <span className="text-purple-100">
                    Contactos registrados
                  </span>
                  <span className="font-semibold text-white text-base">
                    {contactos.length}
                  </span>
                </p>
                <p className="text-[11px] text-purple-100/80">
                  Usa este proyecto como evidencia en tu portafolio de
                  Desarrollo Web – ReactJS.
                </p>
              </div>
            </div>

            {/* Tarjeta de tips de código */}
            <div className="rounded-2xl bg-white/90 border border-slate-100 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">
                Tips de código limpio
              </h3>
              <ul className="mt-2 text-xs text-gray-600 space-y-1">
                <li>• Nombra componentes según su responsabilidad.</li>
                <li>• Evita duplicar lógica, extrae funciones reutilizables.</li>
                <li>• Comenta la intención, no cada línea obvia.</li>
                <li>• Mantén archivos pequeños y coherentes.</li>
              </ul>
            </div>

            {/* Tarjeta SENA / motivacional */}
            <div className="rounded-2xl bg-slate-900 border border-slate-700 p-4 text-slate-100 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                SENA CTMA · ADSO
              </p>
              <p className="text-sm font-semibold mt-2">
                Desarrollo Web – ReactJS
              </p>
              <p className="text-xs text-slate-400 mt-3">
                “Pequeños proyectos bien cuidados valen más que mil ideas sin
                código. Agenda ADSO es tu carta de presentación como
                desarrollador.”
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
