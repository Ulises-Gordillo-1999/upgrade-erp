import { getProyectoById, updateEstadoProyecto } from "@/app/actions/proyectos";
import { getInventario } from "@/app/actions/inventario";
import { getBovedaData } from "@/app/actions/boveda";
import { getClientes } from "@/app/actions/clientes";
import { AddItemModal } from "@/components/proyectos/AddItemModal";
import { EditarProyectoModal } from "@/components/proyectos/EditarProyectoModal";
import { DeleteItemButton } from "@/components/proyectos/DeleteItemButton";
import { CerrarObraModal } from "@/components/proyectos/CerrarObraModal";
import { ItemCantidadRealInput } from "@/components/proyectos/ItemCantidadRealInput";
import { BovedaFormModal } from "@/components/boveda/BovedaFormModal";
import { DeleteBovedaButton } from "@/components/boveda/DeleteBovedaButton";
import { MaskedValue } from "@/components/boveda/MaskedValue";
import { BovedaImageModal } from "@/components/boveda/BovedaImageModal";
import { ExportarPDFButton } from "@/components/proyectos/ExportarPDFButton";
import { DeleteProyectoButton } from "@/components/proyectos/DeleteProyectoButton";
import {
  FolderGit2,
  ArrowLeft,
  ReceiptText,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  Info,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { EstadoProyecto } from "@/types/database";
import { revalidatePath } from "next/cache";
import { getSession } from "@/utils/auth";

export default async function ProyectoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ proyecto, items }, inventario, credenciales, clientes, session] =
    await Promise.all([
      getProyectoById(id),
      getInventario(),
      getBovedaData(id),
      getClientes(),
      getSession(),
    ]);

  const isSuperAdmin = session?.rol === "SuperAdmin";

  // Server action to update status directly from the page
  async function handleUpdateEstado(formData: FormData) {
    "use server";
    try {
      const nuevoEstado = formData.get("estado") as EstadoProyecto;
      await updateEstadoProyecto(id, nuevoEstado);
      revalidatePath(`/proyectos/${id}`);
      revalidatePath(`/proyectos`);
    } catch (error) {
      console.error("Failed to update project status:", error);
      throw error;
    }
  }

  const isFinalizado = proyecto.estado === "Finalizado";
  const hayConsumibles = items.some((i) => i.inventario?.tipo === "Consumible");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Barra superior de navegación y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/proyectos"
          className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Proyectos
        </Link>
        <div className="flex items-center gap-2.5">
          <ExportarPDFButton proyecto={proyecto} items={items} />
          <CerrarObraModal
            proyectoId={id}
            clienteNombre={
              proyecto.clientes?.nombre_razon_social || "Cliente General"
            }
            items={items}
            isFinalizado={isFinalizado}
            totalEstimado={proyecto.total_estimado || 0}
            totalFinal={proyecto.total_final || 0}
          />
          {isSuperAdmin && (
            <DeleteProyectoButton
              id={id}
              nombreCliente={
                proyecto.clientes?.nombre_razon_social || "este proyecto"
              }
              isLiquidado={Boolean(proyecto.stock_descontado || isFinalizado)}
              redirectToProyectos={true}
              variant="button"
            />
          )}
        </div>
      </div>

      {/* Header Project Info */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mr-4 text-cyan-400">
              <FolderGit2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  {proyecto.clientes?.nombre_razon_social}
                  <EditarProyectoModal
                    proyecto={proyecto as any}
                    clientes={clientes}
                  />
                </h2>
                {isFinalizado && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Obra Finalizada
                  </span>
                )}
              </div>
              <div className="flex items-center text-xs text-zinc-400 mt-1 space-x-4">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                  {new Date(proyecto.created_at!).toLocaleDateString("es-AR")}
                </span>
                <span className="flex items-center">
                  <ReceiptText className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                  CUIT: {proyecto.clientes?.cuit_cuil || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <form
            action={handleUpdateEstado}
            className="flex items-center space-x-2 bg-zinc-950 p-2 rounded-xl border border-zinc-800"
          >
            <label className="text-xs font-medium text-zinc-400 pl-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              Estado:
            </label>
            <select
              key={proyecto.estado}
              name="estado"
              defaultValue={proyecto.estado || "Borrador_Bot"}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="Borrador_Bot">Borrador (Bot)</option>
              <option value="Pendiente_Aprobacion_Cliente">
                Pendiente Aprobación
              </option>
              <option value="Aprobado">Aprobado</option>
              <option value="En_Ejecucion">En Ejecución</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <button
              type="submit"
              className="text-xs px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-colors"
            >
              Guardar
            </button>
          </form>
        </div>

        {proyecto.notas_tecnicas && (
          <div className="mt-5 pt-5 border-t border-zinc-800/80">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Notas Técnicas:
            </h4>
            <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800/60 leading-relaxed">
              {proyecto.notas_tecnicas}
            </p>
          </div>
        )}
      </div>

      {/* Budget / Items Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Presupuesto y Materiales
              {hayConsumibles && (
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Consumibles Activos
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400">
              Desglose de equipamiento fijo, servicios y consumibles (cable UTP, fichas, etc.).
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isFinalizado && (
              <AddItemModal proyectoId={id} inventarioDisponible={inventario} />
            )}
          </div>
        </div>

        {/* Tip explicativo */}
        {hayConsumibles && !isFinalizado && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-xs flex items-center gap-2.5">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>Problema del Cable:</strong> Puedes ajustar los metros reales
              utilizados directamente en la columna &quot;Cant. Real&quot; o presionar{" "}
              <strong>&quot;Cierre de Obra / Liquidar&quot;</strong> al finalizar la instalación.
            </span>
          </div>
        )}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-zinc-400 uppercase tracking-wider bg-zinc-950/80 border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Concepto / Ítem</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Tipo</th>
                  <th className="px-5 py-3.5 font-semibold text-right">
                    Precio Congelado
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-center">
                    Cant. Estimada
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-center">
                    Cant. Real (Obra)
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-right">
                    Subtotal Final
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-right w-14"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-zinc-500 text-xs"
                    >
                      No hay ítems en este proyecto. Agrega materiales o servicios.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const cant_final =
                      item.cantidad_real !== null && item.cantidad_real !== undefined
                        ? item.cantidad_real
                        : item.cantidad_estimada;
                    const subtotal = item.precio_congelado * (cant_final || 0);
                    const esConsumible = item.inventario?.tipo === "Consumible";

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          esConsumible
                            ? "bg-amber-500/[0.02] hover:bg-amber-500/[0.05]"
                            : "hover:bg-zinc-800/40"
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col space-y-0.5">
                            <span className="font-semibold text-zinc-100">
                              {item.inventario?.nombre}
                            </span>
                            {item.inventario?.sku && (
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {item.inventario.sku}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider ${
                              esConsumible
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : item.inventario?.tipo === "Servicio"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}
                          >
                            {item.inventario?.tipo}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right text-zinc-300">
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          }).format(item.precio_congelado)}
                        </td>

                        <td className="px-5 py-3.5 text-center text-zinc-400 font-medium">
                          {item.cantidad_estimada}
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <div className="flex justify-center">
                            <ItemCantidadRealInput
                              itemId={item.id}
                              proyectoId={id}
                              cantidadEstimada={item.cantidad_estimada || 0}
                              cantidadRealInicial={item.cantidad_real}
                              tipoItem={item.inventario?.tipo}
                              isProyectoFinalizado={isFinalizado}
                            />
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-right font-bold text-zinc-100">
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          }).format(subtotal)}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          {!isFinalizado && (
                            <DeleteItemButton id={item.id} proyecto_id={id} />
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {items.length > 0 && (
                <tfoot className="bg-zinc-950/80 border-t border-zinc-800">
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-3 text-right font-medium text-zinc-400 uppercase text-[11px] tracking-wider"
                    >
                      Costo Estimado (Presupuesto)
                    </td>
                    <td className="px-5 py-3 text-right text-zinc-300 font-semibold">
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(proyecto.total_estimado || 0)}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-3.5 text-right font-bold text-white uppercase text-[11px] tracking-wider"
                    >
                      Total Final Liquidado
                    </td>
                    <td className="px-5 py-3.5 text-right font-extrabold text-cyan-400 text-base">
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(proyecto.total_final || 0)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* Credenciales y Accesos (Bóveda Segura) */}
      <div className="space-y-4 pt-6 mt-6 border-t border-zinc-800/60">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-rose-500" />
              Credenciales y Accesos (Bóveda Segura)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Información sensible cifrada con AES-256 en reposo.
            </p>
          </div>
          <BovedaFormModal proyectoId={id} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {credenciales.length === 0 ? (
            <div className="col-span-full p-8 text-center text-zinc-500 bg-zinc-950/40 border border-zinc-800 rounded-2xl border-dashed text-xs">
              No hay credenciales registradas para este proyecto.
            </div>
          ) : (
            credenciales.map((cred) => (
              <div
                key={cred.id}
                className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                      {cred.tipo_dato.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(cred.created_at!).toLocaleDateString("es-AR")}
                      </span>
                      <div className="flex items-center gap-1 border-l border-zinc-800 pl-2 ml-1">
                        <BovedaFormModal
                          credencialInicial={cred as any}
                          isEdit={true}
                        />
                        <DeleteBovedaButton id={cred.id} />
                      </div>
                    </div>
                  </div>
                  <h4 className="font-semibold text-zinc-200 text-xs mb-3">
                    {cred.descripcion}
                  </h4>
                </div>
                <div>
                  <MaskedValue value={cred.valor_desencriptado || ""} />
                  {cred.archivo_url && (
                    <BovedaImageModal path={cred.archivo_url} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
