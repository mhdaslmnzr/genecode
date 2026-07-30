import Link from "next/link";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <>
      <main>
        <section className="collection">
          <div className="collection__inner admin-login">
            <AdminLoginForm />
            <Link className="admin-nav-link" href="/">← Back to shop</Link>
          </div>
        </section>
      </main>
    </>
  );
}
