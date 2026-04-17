import { useState } from "react";
import type { ReactElement, ReactNode, SVGProps } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "../components/Button";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../hooks/useAuth";

type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactElement;

type NavItem = {
  to: string;
  label: string;
  Icon: IconComponent;
};

function IconDashboard(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

function IconUsers(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function IconBook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" />
      <path d="M19 3v18" />
      <path d="M8 7h7" />
      <path d="M8 11h7" />
    </svg>
  );
}

function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </svg>
  );
}

function IconLayers(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </svg>
  );
}

function IconChart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 20V9m8 11V4m8 16v-7" />
      <path d="M2 20h20" />
    </svg>
  );
}

const adminItems: NavItem[] = [
  { to: "/admin", label: "Panel admin", Icon: IconDashboard },
  { to: "/admin/users", label: "Usuarios", Icon: IconUsers },
  { to: "/admin/subjects", label: "Materias", Icon: IconBook },
  { to: "/admin/periods", label: "Periodos", Icon: IconCalendar },
  { to: "/admin/enrollments", label: "Inscripciones", Icon: IconLayers },
  { to: "/admin/grades", label: "Calificaciones", Icon: IconChart }
];

const teacherItems: NavItem[] = [
  { to: "/teacher", label: "Panel docente", Icon: IconDashboard },
  { to: "/teacher/grades", label: "Calificaciones", Icon: IconChart }
];

const studentItems: NavItem[] = [
  { to: "/student", label: "Panel estudiante", Icon: IconDashboard },
  { to: "/student/subjects", label: "Materias", Icon: IconBook },
  { to: "/student/enrollments", label: "Inscripciones", Icon: IconLayers },
  { to: "/student/grades", label: "Calificaciones", Icon: IconChart }
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const roles = user?.roles ?? [];

  const navItems: NavItem[] = [];
  if (roles.includes("Administrador")) {
    navItems.push(...adminItems);
  }
  if (roles.includes("Docente")) {
    navItems.push(...teacherItems);
  }
  if (roles.includes("Estudiante")) {
    navItems.push(...studentItems);
  }

  return (
    <div className="dashboard-shell">
      <div className={`dashboard-grid ${isSidebarVisible ? "" : "sidebar-hidden"}`.trim()}>
        <aside className="sidebar-panel">
          <div className="sidebar-panel-inner">
            <div className="sidebar-topbar">
              <button
                type="button"
                className="sidebar-symbol-toggle"
                onClick={() => setSidebarVisible((current) => !current)}
                aria-controls="main-sidebar"
                aria-expanded={isSidebarVisible}
                aria-label={isSidebarVisible ? "Ocultar menu" : "Mostrar menu"}
                title={isSidebarVisible ? "Ocultar menu" : "Mostrar menu"}
              >
                <span className="sidebar-symbol-bar" />
                <span className="sidebar-symbol-bar" />
                <span className="sidebar-symbol-bar" />
              </button>
              {isSidebarVisible ? <span className="sidebar-topbar-label">Menu</span> : null}
            </div>
            {isSidebarVisible ? (
              <nav id="main-sidebar" aria-label="Menu principal" className="sidebar">
                <div className="sidebar-header">
                  <div className="sidebar-title">Universidad Digital</div>
                  <div className="sidebar-subtitle">Panel principal del sistema</div>
                </div>
                <div className="sidebar-user-card">
                  <strong>{user?.full_name}</strong>
                  <span>{roles.join(", ")}</span>
                </div>
                <ul className="sidebar-list">
                  {navItems.map(({ to, label, Icon }) => (
                    <li key={to}>
                      <NavLink to={to} className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
                        <Icon className="sidebar-icon" aria-hidden="true" />
                        <span>{label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>
        </aside>
        <div className="dashboard-main-shell">
          <header className="card dashboard-header">
            <div className="dashboard-header-content">
              <div className="dashboard-brand">
                <strong>Bienvenido</strong>
                <span className="dashboard-user">{user?.full_name}</span>
                <span className="dashboard-roles">{roles.join(", ")}</span>
              </div>
              <div className="dashboard-actions">
                <ThemeToggle />
                <Button variant="secondary" onClick={() => void logout()}>
                  Cerrar sesion
                </Button>
              </div>
            </div>
          </header>
          <main className="dashboard-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
