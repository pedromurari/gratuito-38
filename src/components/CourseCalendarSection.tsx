import React from "react";

const DAY_NAMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

// Junho 2026: começa na segunda-feira (índice 1)
const JUNE_2026 = {
  month: "Junho",
  year: 2026,
  firstDayOfWeek: 1,
  totalDays: 30,
};

const COURSE_DAYS = new Set([9, 10, 11]);

const CalendarDay: React.FC<{ day: number | string; isHeader?: boolean; isCourseDay?: boolean }> = ({
  day,
  isHeader,
  isCourseDay,
}) => {
  const baseClass = "col-span-1 row-span-1 flex h-8 w-8 items-center justify-center";
  const style = isHeader
    ? ""
    : isCourseDay
    ? "rounded-xl bg-primary text-primary-foreground font-bold shadow-[0_0_12px_hsl(var(--idm-orange)/0.5)]"
    : "text-muted-foreground rounded-xl";

  return (
    <div className={`${baseClass} ${style}`}>
      <span className={`${isHeader ? "text-xs font-semibold text-muted-foreground" : "text-sm font-medium"}`}>
        {day}
      </span>
    </div>
  );
};

const CourseCalendarSection = () => {
  const { month, year, firstDayOfWeek, totalDays } = JUNE_2026;

  const calendarCells: React.ReactNode[] = [
    ...DAY_NAMES.map((day) => (
      <CalendarDay key={`header-${day}`} day={day} isHeader />
    )),
    ...Array(firstDayOfWeek)
      .fill(null)
      .map((_, i) => (
        <div key={`empty-${i}`} className="col-span-1 row-span-1 h-8 w-8" />
      )),
    ...Array(totalDays)
      .fill(null)
      .map((_, i) => (
        <CalendarDay
          key={`day-${i + 1}`}
          day={i + 1}
          isCourseDay={COURSE_DAYS.has(i + 1)}
        />
      )),
  ];

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Quando será o{" "}
            <span className="text-primary">Curso Gratuito?</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Reserve esses três dias na sua agenda
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10">
          {/* Calendário */}
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-4">
            <div className="rounded-xl border border-border/50 p-4" style={{ boxShadow: "0px 2px 1.5px 0px rgba(165,174,184,0.32) inset" }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-semibold text-foreground">
                  {month}, {year}
                </span>
                <span className="text-xs text-muted-foreground">Aulas ao vivo</span>
              </div>
              <div className="grid grid-cols-7 gap-2 px-2">
                {calendarCells}
              </div>
            </div>
          </div>

          {/* Legenda e datas */}
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground text-sm mb-2 uppercase tracking-widest font-semibold">
              Datas das aulas
            </p>
            {[
              { dia: "09", diaSemana: "Terça-feira", aula: "Aula 01" },
              { dia: "10", diaSemana: "Quarta-feira", aula: "Aula 02" },
              { dia: "11", diaSemana: "Quinta-feira", aula: "Aula 03" },
            ].map(({ dia, diaSemana, aula }) => (
              <div
                key={dia}
                className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-[0_0_16px_hsl(var(--idm-orange)/0.4)]">
                  {dia}
                </div>
                <div>
                  <p className="text-foreground font-semibold">
                    {diaSemana} — {aula}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Junho de 2026 · Online e Gratuito
                  </p>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-2">
              * Fique de olho no grupo do WhatsApp para o horário exato.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseCalendarSection;
