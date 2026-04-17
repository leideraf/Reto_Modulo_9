import { Alert } from "../../components/Alert";
import { MetricCard } from "../../components/dashboard/MetricCard";
import { useFetch } from "../../hooks/useFetch";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { enrollmentsService } from "../../services/enrollmentsService";
import { periodsService } from "../../services/periodsService";
import { subjectsService } from "../../services/subjectsService";
import { usersService } from "../../services/usersService";

export function AdminDashboard() {
  const { data, error, isLoading } = useFetch(async () => {
    const [users, subjects, periods, enrollments] = await Promise.all([
      usersService.list(),
      subjectsService.list(),
      periodsService.list(),
      enrollmentsService.list()
    ]);
    return { users, subjects, periods, enrollments };
  }, []);

  const users = data?.users ?? [];
  const subjects = data?.subjects ?? [];
  const periods = data?.periods ?? [];
  const enrollments = data?.enrollments ?? [];

  const activeUsers = users.filter((user) => user.is_active).length;
  const students = users.filter((user) => user.roles.includes("Estudiante")).length;
  const teachers = users.filter((user) => user.roles.includes("Docente")).length;
  const activeSubjects = subjects.filter((subject) => subject.is_active).length;
  const activePeriods = periods.filter((period) => period.is_active).length;
  const activeEnrollments = enrollments.filter((enrollment) => enrollment.is_active).length;

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <header className="dashboard-page-header">
          <h1>Dashboard Administrador</h1>
          <p>Vision ejecutiva del sistema con indicadores clave y organizacion mas limpia.</p>
        </header>

        {error ? <Alert message={error} /> : null}
        {isLoading ? <p>Cargando indicadores...</p> : null}

        {!isLoading ? (
          <section className="metrics-grid metrics-grid-compact">
            <MetricCard label="Usuarios" value={users.length} hint={`${activeUsers} activos`} />
            <MetricCard label="Docentes" value={teachers} hint="Con acceso docente" />
            <MetricCard label="Estudiantes" value={students} hint="Con rol estudiante" />
            <MetricCard label="Materias" value={subjects.length} hint={`${activeSubjects} activas`} />
            <MetricCard label="Inscripciones" value={enrollments.length} hint={`${activeEnrollments} activas`} />
          </section>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
