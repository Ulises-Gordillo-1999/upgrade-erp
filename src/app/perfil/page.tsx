import { getMiPerfil } from "@/app/actions/perfil";
import { PerfilForm } from "@/components/perfil/PerfilForm";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mi Perfil | UPGRADE ERP",
  description: "Administración del perfil de usuario, credenciales y seguridad.",
};

export default async function PerfilPage() {
  const usuario = await getMiPerfil();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Mi Perfil</h1>
        <p className="text-zinc-400 mt-2 text-sm">
          Administre su información personal, correo electrónico y credenciales de acceso al sistema.
        </p>
      </div>

      <PerfilForm usuario={usuario} />
    </div>
  );
}
