import Link from "next/link";
import { cookies } from "next/headers";
import { Header } from "@/components/Header";
import { parseAdminSessionToken, ADMIN_COOKIE } from "@/lib/admin-session";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const email = await parseAdminSessionToken(cookieStore.get(ADMIN_COOKIE)?.value);

  return (
    <>
      <Header />
      <main>
        <section className="collection">
          <div className="collection__inner">
            <h1 className="collection__heading">Admin</h1>
            <p className="about__text">Signed in as {email}</p>
            <ul className="admin-nav-list">
              <li><Link className="admin-nav-link admin-nav-link--card" href="/admin/drops">Manage drops</Link></li>
            </ul>
            <AdminLogoutButton />
          </div>
        </section>
      </main>
    </>
  );
}
