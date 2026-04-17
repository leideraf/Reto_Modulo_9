import { Alert } from "../../components/Alert";
import { MetricCard } from "../../components/dashboard/MetricCard";
import { useFetch } from "../../hooks/useFetch";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { enrollmentsService } from "../../services/enrollmentsService";
import { gradesService } from "../../services/gradesService";
import { periodsService } from "../../services/periodsService";
import { subjectsService } from "../../services/subjectsService";

export function TeacherDashboard() {
  const { data, error, isLoading } = useFetch(async () => {
    const [enrollments, grades, subjects, periods] = await Promise.all([
      enrollmentsService.list(),
      gradesService.list(),
      subjectsService.list(),
      periodsService.list()
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
  const completionRate =
    enrollments.length === 0 ? 0 : Math.round((gradedCount / enrollments.length) * 100);
  const activePeriods = periods.filter((period) => period.is_active).length;

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <header className="dashboard-page-header">
          <h1>Dashboard Docente</h1>
          <p>Seguimiento puntual del trabajo academico con una vista simple y util.</p>
        </header>

        {error ? <Alert message={error} /> : null}
        {isLoading ? <p>Cargando indicadores...</p> : null}

        {!isLoading ? (
          <>
            <section className="metrics-grid metrics-grid-compact">
              <MetricCard label="Inscripciones asignadas" value={enrollments.length} />
              <MetricCard
                label="Calificadas"
                value={gradedCount}
                hint={`${completionRate}% de avance`}
                tone={completionRate >= 75 ? "success" : "warning"}
              />
              <MetricCard label="Pendientes" value={pendingCount} tone="warning" />
              <MetricCard
                label="Materias visibles"
                value={subjects.length}
                hint={`${activePeriods} periodos activos`}
              />
            </section>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
