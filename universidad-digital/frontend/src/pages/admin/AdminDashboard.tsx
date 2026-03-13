import { Alert } from "../../components/Alert";
import { MetricCard } from "../../components/dashboard/MetricCard";
import { SectionCard } from "../../components/dashboard/SectionCard";
import { useFetch } from "../../hooks/useFetch";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { enrollmentsService } from "../../services/enrollmentsService";
import { gradesService } from "../../services/gradesService";
import { periodsService } from "../../services/periodsService";
import { subjectsService } from "../../services/subjectsService";
import { usersService } from "../../services/usersService";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-CO");
}

export function AdminDashboard() {
  const { data, error, isLoading } = useFetch(async () => {
    const [users, subjects, periods, enrollments, grades] = await Promise.all([
      usersService.list(),
      subjectsService.list(),
      periodsService.list(),
      enrollmentsService.list(),
      gradesService.list(),
    ]);
    return { users, subjects, periods, enrollments, grades };
  }, []);

  const users = data?.users ?? [];
  const subjects = data?.subjects ?? [];
  const periods = data?.periods ?? [];
  const enrollments = data?.enrollments ?? [];
  const grades = data?.grades ?? [];

  const activeUsers = users.filter((user) => user.is_active).length;
  const students = users.filter((user) => user.roles.includes("Estudiante")).length;
  const teachers = users.filter((user) => user.roles.includes("Docente")).length;
  const activeSubjects = subjects.filter((subject) => subject.is_active).length;
  const activePeriods = periods.filter((period) => period.is_active).length;
  const activeEnrollments = enrollments.filter((enrollment) => enrollment.is_active).length;
  const gradedEnrollmentIds = new Set(grades.map((grade) => grade.enrollment_id));
  const coverage = enrollments.length === 0 ? 0 : Math.round((gradedEnrollmentIds.size / enrollments.length) * 100);
  const averageGrade =
    grades.length === 0 ? 0 : grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length;

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  const recentEnrollments = [...enrollments]
    .sort((a, b) => new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime())
    .slice(0, 6);

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <header className="dashboard-page-header">
          <h1>Dashboard Administrador</h1>
          <p>Resumen general de operacion academica y control del sistema.</p>
        </header>

        {error ? <Alert message={error} /> : null}
        {isLoading ? <p>Cargando indicadores...</p> : null}

        {!isLoading ? (
          <>
            <section className="metrics-grid">
              <MetricCard label="Usuarios" value={users.length} hint={`${activeUsers} activos`} />
              <MetricCard label="Docentes" value={teachers} hint="Con acceso docente" />
              <MetricCard label="Estudiantes" value={students} hint="Con rol estudiante" />
              <MetricCard
                label="Materias"
                value={subjects.length}
                hint={`${activeSubjects} activas`}
              />
              <MetricCard
                label="Periodos"
                value={periods.length}
                hint={`${activePeriods} activos`}
              />
              <MetricCard
                label="Inscripciones"
                value={enrollments.length}
                hint={`${activeEnrollments} activas`}
              />
              <MetricCard
                label="Cobertura de notas"
                value={`${coverage}%`}
                hint={`${gradedEnrollmentIds.size} de ${enrollments.length} inscr.`}
                tone={coverage >= 80 ? "success" : "warning"}
              />
              <MetricCard
                label="Promedio general"
                value={grades.length ? averageGrade.toFixed(2) : "N/A"}
                hint={`${grades.length} calificaciones registradas`}
              />
            </section>

            <section className="dashboard-split">
              <SectionCard title="Usuarios recientes" subtitle="Ultimos 5 registros">
                {recentUsers.length === 0 ? (
                  <p className="empty-text">No hay usuarios para mostrar.</p>
                ) : (
                  <ul className="dashboard-list">
                    {recentUsers.map((user) => (
                      <li key={user.id} className="dashboard-list-item">
                        <div>
                          <strong>{user.full_name}</strong>
                          <span>{user.email}</span>
                        </div>
                        <div>
                          <span className={`badge ${user.is_active ? "success" : "warning"}`}>
                            {user.is_active ? "Activo" : "Inactivo"}
                          </span>
                          <small>{formatDate(user.created_at)}</small>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              <SectionCard
                title="Inscripciones recientes"
                subtitle="Ultimos movimientos academicos"
              >
                {recentEnrollments.length === 0 ? (
                  <p className="empty-text">No hay inscripciones para mostrar.</p>
                ) : (
                  <ul className="dashboard-list">
                    {recentEnrollments.map((enrollment) => (
                      <li key={enrollment.id} className="dashboard-list-item">
                        <div>
                          <strong>Inscripcion #{enrollment.id}</strong>
                          <span>
                            Usuario #{enrollment.user_id} - Materia #{enrollment.subject_id}
                          </span>
                        </div>
                        <div>
                          <span className={`badge ${enrollment.is_active ? "success" : "warning"}`}>
                            {enrollment.is_active ? "Activa" : "Inactiva"}
                          </span>
                          <small>{formatDate(enrollment.enrolled_at)}</small>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </section>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
