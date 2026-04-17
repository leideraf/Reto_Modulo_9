import type { ReactNode } from "react";
import { ThemeToggle } from "../components/ThemeToggle";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-layout">
      <div className="auth-toolbar">
        <ThemeToggle className="auth-theme-toggle" />
      </div>
      <div className="auth-shell">
        <section className="auth-showcase">
          <span className="auth-kicker">Plataforma academica</span>
          <h1>Gestion universitaria con una experiencia mas clara y profesional.</h1>
          <p>
            Accede a materias, inscripciones, notas y administracion del sistema desde un
            entorno moderno, ordenado y preparado para cada rol.
          </p>
          <div className="auth-showcase-grid">
            <article className="auth-showcase-card">
              <strong>Paneles optimizados</strong>
              <span>Informacion clave para administradores, docentes y estudiantes.</span>
            </article>
            <article className="auth-showcase-card">
              <strong>Navegacion simple</strong>
              <span>Un menu lateral estable para dar protagonismo al contenido.</span>
            </article>
          </div>
        </section>
        <div className="card auth-card">{children}</div>
      </div>
    </main>
  );
}
