import { Alert } from "../../components/Alert";
import { MetricCard } from "../../components/dashboard/MetricCard";
import { SectionCard } from "../../components/dashboard/SectionCard";
import { useFetch } from "../../hooks/useFetch";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { enrollmentsService } from "../../services/enrollmentsService";
import { gradesService } from "../../services/gradesService";
import { periodsService } from "../../services/periodsService";
import { subjectsService } from "../../services/subjectsService";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-CO");
}

export function TeacherDashboard() {
  const { data, error, isLoading } = useFetch(async () => {
    const [enrollments, grades, subjects, periods] = await Promise.all([
      enrollmentsService.list(),
      gradesService.list(),
      subjectsService.list(),
      periodsService.list(),
    ]);
    return { enrollments, grades, subjects, periods };
  }, []);

  const enrollments = data?.enrollments ?? [];
  const grades = data?.grades ?? [];
  const subjects = data?.subjects ?? [];
  const periods = data?.periods ?? [];

  const gradedEnrollmentIds = new Set(grades.map((grade) => grade.enrollment_id));
  const gradedCount = gradedEnrollmentIds.size;
  const pendingCount = Math.max(enrollments.length - gradedCount, 0);
  const completionRate = enrollments.length === 0 ? 0 : Math.round((gradedCount / enrollments.length) * 100);
  const averageGrade =
    grades.length === 0 ? 0 : grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length;
  const activePeriods = periods.filter((period) => period.is_active).length;

  const gradeDistribution = [
    {
      label: "0 - 59",
      count: grades.filter((grade) => grade.value < 60).length,
    },
    {
      label: "60 - 79",
      count: grades.filter((grade) => grade.value >= 60 && grade.value < 80).length,
    },
    {
      label: "80 - 100",
      count: grades.filter((grade) => grade.value >= 80).length,
    },
  ];
  const maxDistribution = Math.max(...gradeDistribution.map((item) => item.count), 1);

  const recentGrades = [...grades]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <header className="dashboard-page-header">
          <h1>Dashboard Docente</h1>
          <p>Control de evaluaciones, avance de notas y seguimiento academico.</p>
        </header>

        {error ? <Alert message={error} /> : null}
        {isLoading ? <p>Cargando indicadores...</p> : null}

        {!isLoading ? (
          <>
            <section className="metrics-grid">
              <MetricCard label="Inscripciones asignadas" value={enrollments.length} />
              <MetricCard
                label="Inscripciones calificadas"
                value={gradedCount}
                hint={`${completionRate}% de avance`}
                tone={completionRate >= 75 ? "success" : "warning"}
              />
              <MetricCard label="Pendientes por calificar" value={pendingCount} tone="warning" />
              <MetricCard
                label="Promedio de notas"
                value={grades.length ? averageGrade.toFixed(2) : "N/A"}
                hint={`${grades.length} notas registradas`}
              />
              <MetricCard label="Materias visibles" value={subjects.length} />
              <MetricCard label="Periodos activos" value={activePeriods} />
            </section>

            <section className="dashboard-split">
              <SectionCard title="Distribucion de notas" subtitle="Panorama de rendimiento">
                {grades.length === 0 ? (
                  <p className="empty-text">Aun no hay calificaciones registradas.</p>
                ) : (
                  <ul className="progress-list">
                    {gradeDistribution.map((item) => (
                      <li key={item.label}>
                        <div className="progress-header">
                          <span>{item.label}</span>
                          <strong>{item.count}</strong>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-value"
                            style={{ width: `${(item.count / maxDistribution) * 100}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              <SectionCard title="Ultimas calificaciones" subtitle="Actividad reciente de notas">
                {recentGrades.length === 0 ? (
                  <p className="empty-text">No hay calificaciones para mostrar.</p>
                ) : (
                  <ul className="dashboard-list">
                    {recentGrades.map((grade) => (
                      <li key={grade.id} className="dashboard-list-item">
                        <div>
                          <strong>Nota #{grade.id}</strong>
                          <span>Inscripcion #{grade.enrollment_id}</span>
                        </div>
                        <div>
                          <span className="badge success">{grade.value}</span>
                          <small>{formatDate(grade.created_at)}</small>
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
