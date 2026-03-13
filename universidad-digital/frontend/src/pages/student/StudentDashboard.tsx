import { Alert } from "../../components/Alert";
import { MetricCard } from "../../components/dashboard/MetricCard";
import { SectionCard } from "../../components/dashboard/SectionCard";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { enrollmentsService } from "../../services/enrollmentsService";
import { gradesService } from "../../services/gradesService";
import { periodsService } from "../../services/periodsService";
import { subjectsService } from "../../services/subjectsService";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-CO");
}

export function StudentDashboard() {
  const { user } = useAuth();

  const { data, error, isLoading } = useFetch(async () => {
    const [enrollments, grades, subjects, periods] = await Promise.all([
      enrollmentsService.list(),
      gradesService.list(),
      subjectsService.list(),
      periodsService.list(),
    ]);
    return { enrollments, grades, subjects, periods };
  }, []);

  const userEnrollments = (data?.enrollments ?? []).filter((enrollment) => enrollment.user_id === user?.id);
  const activeEnrollments = userEnrollments.filter((enrollment) => enrollment.is_active).length;
  const enrollmentIds = new Set(userEnrollments.map((enrollment) => enrollment.id));
  const userGrades = (data?.grades ?? []).filter((grade) => enrollmentIds.has(grade.enrollment_id));
  const pendingGrades = Math.max(userEnrollments.length - userGrades.length, 0);
  const approvedGrades = userGrades.filter((grade) => grade.value >= 60).length;
  const averageGrade =
    userGrades.length === 0 ? 0 : userGrades.reduce((sum, grade) => sum + grade.value, 0) / userGrades.length;

  const subjectMap = new Map((data?.subjects ?? []).map((subject) => [subject.id, subject.name]));
  const periodMap = new Map((data?.periods ?? []).map((period) => [period.id, period.name]));
  const enrollmentById = new Map(userEnrollments.map((enrollment) => [enrollment.id, enrollment]));
  const gradeByEnrollment = new Map(userGrades.map((grade) => [grade.enrollment_id, grade]));

  const recentGrades = [...userGrades]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const periodSummary = userEnrollments.reduce<Record<number, { total: number; graded: number; score: number }>>(
    (acc, enrollment) => {
      const current = acc[enrollment.period_id] ?? { total: 0, graded: 0, score: 0 };
      current.total += 1;
      const grade = gradeByEnrollment.get(enrollment.id);
      if (grade) {
        current.graded += 1;
        current.score += grade.value;
      }
      acc[enrollment.period_id] = current;
      return acc;
    },
    {}
  );

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <header className="dashboard-page-header">
          <h1>Dashboard Estudiante</h1>
          <p>Estado academico personal, materias inscritas y rendimiento.</p>
        </header>

        {error ? <Alert message={error} /> : null}
        {isLoading ? <p>Cargando indicadores...</p> : null}

        {!isLoading ? (
          <>
            <section className="metrics-grid">
              <MetricCard label="Materias inscritas" value={userEnrollments.length} />
              <MetricCard label="Inscripciones activas" value={activeEnrollments} />
              <MetricCard label="Notas registradas" value={userGrades.length} />
              <MetricCard label="Pendientes por nota" value={pendingGrades} tone="warning" />
              <MetricCard label="Materias aprobadas" value={approvedGrades} tone="success" />
              <MetricCard
                label="Promedio general"
                value={userGrades.length ? averageGrade.toFixed(2) : "N/A"}
              />
            </section>

            <section className="dashboard-split">
              <SectionCard title="Ultimas calificaciones" subtitle="Rendimiento mas reciente">
                {recentGrades.length === 0 ? (
                  <p className="empty-text">No hay calificaciones registradas.</p>
                ) : (
                  <ul className="dashboard-list">
                    {recentGrades.map((grade) => {
                      const enrollment = enrollmentById.get(grade.enrollment_id);
                      const subjectName = enrollment
                        ? subjectMap.get(enrollment.subject_id) ?? `Materia #${enrollment.subject_id}`
                        : "Materia";
                      return (
                        <li key={grade.id} className="dashboard-list-item">
                          <div>
                            <strong>{subjectName}</strong>
                            <span>Inscripcion #{grade.enrollment_id}</span>
                          </div>
                          <div>
                            <span className={`badge ${grade.value >= 60 ? "success" : "warning"}`}>
                              {grade.value}
                            </span>
                            <small>{formatDate(grade.created_at)}</small>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </SectionCard>

              <SectionCard title="Resumen por periodo" subtitle="Carga y promedio por ciclo">
                {Object.keys(periodSummary).length === 0 ? (
                  <p className="empty-text">No hay periodos con inscripciones.</p>
                ) : (
                  <ul className="dashboard-list">
                    {Object.entries(periodSummary).map(([periodId, summary]) => {
                      const average = summary.graded === 0 ? "N/A" : (summary.score / summary.graded).toFixed(2);
                      return (
                        <li key={periodId} className="dashboard-list-item">
                          <div>
                            <strong>{periodMap.get(Number(periodId)) ?? `Periodo #${periodId}`}</strong>
                            <span>
                              {summary.total} materias - {summary.graded} con nota
                            </span>
                          </div>
                          <div>
                            <span className="badge">{average}</span>
                          </div>
                        </li>
                      );
                    })}
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
