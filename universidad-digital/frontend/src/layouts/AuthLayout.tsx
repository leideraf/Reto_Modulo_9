import type { ReactNode } from "react";
import { ThemeToggle } from "../components/ThemeToggle";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="container auth-layout">
      <div className="auth-toolbar">
        <ThemeToggle />
      </div>
      <div className="card auth-card">{children}</div>
    </main>
  );
}
