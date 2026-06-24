import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import AdminNav from "./_nav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="adm">
      <aside className="adm__side">
        <Link href="/admin" className="adm__brand">
          Alrit<span>.dev</span>
        </Link>
        <AdminNav />
        <div className="adm__side-foot">
          <p className="adm__user">{session.user?.email}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button type="submit" className="adm__signout">Cerrar sesión</button>
          </form>
        </div>
      </aside>
      <main className="adm__main">{children}</main>
    </div>
  );
}
