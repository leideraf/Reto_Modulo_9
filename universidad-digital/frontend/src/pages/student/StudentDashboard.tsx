import { Alert } from "../../components/Alert";
import { SectionCard } from "../../components/dashboard/SectionCard";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { enrollmentsService } from "../../services/enrollmentsService";
import { gradesService } from "../../services/gradesService";
import { periodsService } from "../../services/periodsService";
import { subjectsService } from "../../services/subjectsService";

export function StudentDashboard() {
  const { user } = useAuth();

  const { data, error, isLoading } = useFetch(async () => {
    const [enrollments, grades, subjects, periods] = await Promise.all([
      enrollmentsService.list(),
      gradesService.list(),
      subjectsService.list(),
      periodsService.list()
    ]);
    return { enrollments, grades, subjects, periods };
  }, []);

  const userEnrollments = (data?.enrollments ?? []).filter((enrollment) => enrollment.user_id === user?.id);
  const userGrades = (data?.grades ?? []).filter((grade) =>
    userEnrollments.some((enrollment) => enrollment.id === grade.enrollment_id)
  );
  const activeEnrollments = userEnrollments.filter((enrollment) => enrollment.is_active).length;
  const pendingGrades = Math.max(userEnrollments.length - userGrades.length, 0);
  const approvedGrades = userGrades.filter((grade) => grade.value >= 60).length;
  const averageGrade =
    userGrades.length === 0 ? 0 : userGrades.reduce((sum, grade) => sum + grade.value, 0) / userGrades.length;

  const subjectMap = new Map((data?.subjects ?? []).map((subject) => [subject.id, subject.name]));
  const periodMap = new Map((data?.periods ?? []).map((period) => [period.id, period.name]));
  const currentSubjects = userEnrollments
    .slice(0, 3)
    .map((enrollment) => subjectMap.get(enrollment.subject_id) ?? `Materia #${enrollment.subject_id}`);

  const periodSummary = userEnrollments.reduce<Record<number, { total: number; graded: number; score: number }>>(
    (acc, enrollment) => {
      const current = acc[enrollment.period_id] ?? { total: 0, graded: 0, score: 0 };
      current.total += 1;

      const grade = userGrades.find((item) => item.enrollment_id === enrollment.id);
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
          <p>Vista academica personal con la informacion necesaria y mejor organizada.</p>
        </header>

        {error ? <Alert message={error} /> : null}
        {isLoading ? <p>Cargando indicadores...</p> : null}

        {!isLoading ? (
          <section className="dashboard-split dashboard-split-balanced">
              <SectionCard title="Resumen academico" subtitle="Panorama actual de tu progreso">
                <ul className="dashboard-list dashboard-summary-list">
                  <li className="dashboard-list-item">
                    <div>
                      <strong>Materias aprobadas</strong>
                      <span>Asignaturas con nota igual o superior a 60</span>
                    </div>
                    <span className="badge success">{approvedGrades}</span>
                  </li>
                  <li className="dashboard-list-item">
                    <div>
                      <strong>Materias activas</strong>
                      <span>Inscripciones actualmente en curso</span>
                    </div>
                    <span className="badge">{activeEnrollments}</span>
                  </li>
                  <li className="dashboard-list-item">
                    <div>
                      <strong>Promedio general</strong>
                      <span>Promedio acumulado con las notas registradas</span>
                    </div>
                    <span className="badge">
                      {userGrades.length ? averageGrade.toFixed(2) : "N/A"}
                    </span>
                  </li>
                </ul>
              </SectionCard>

              <SectionCard title="Carga actual" subtitle="Tus materias principales">
                {currentSubjects.length === 0 ? (
                  <p className="empty-text">Aun no tienes materias inscritas.</p>
                ) : (
                  <ul className="dashboard-list dashboard-summary-list">
                    {currentSubjects.map((subjectName) => (
                      <li key={subjectName} className="dashboard-list-item">
                        <div>
                          <strong>{subjectName}</strong>
                          <span>Materia visible en tu panel academico</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              <SectionCard title="Resumen por periodo" subtitle="Promedio por ciclo inscrito">
                {Object.keys(periodSummary).length === 0 ? (
                  <p className="empty-text">No hay periodos con inscripciones.</p>
                ) : (
                  <ul className="dashboard-list dashboard-summary-list">
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
        ) : null}
      </div>
    </DashboardLayout>
  );
}
