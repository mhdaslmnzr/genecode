import Link from "next/link";
import { Header } from "@/components/Header";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <>
      <Header />
      <main>
        <section className="collection">
          <div className="collection__inner checkout-form">
            <AdminLoginForm />
            <Link className="admin-nav-link" href="/">← Back to shop</Link>
          </div>
        </section>
      </main>
    </>
  );
}
