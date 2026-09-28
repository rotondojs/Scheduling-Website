import dayjs from "dayjs";
import { useState } from "react";
import type { SessionInfo } from "@gameschedule/shared";
import { Link } from "react-router-dom";

interface Props {
  sessions: SessionInfo[];
}

export default function CalendarView({ sessions }: Props) {
  const [current, setCurrent] = useState(dayjs().startOf("month"));

  const startOfMonth = current.startOf("month");
  const daysInMonth = current.daysInMonth();
  const startDayOfWeek = startOfMonth.day();

  const sessionsByDay = new Map<number, SessionInfo[]>();
  for (const s of sessions) {
    const d = dayjs(s.scheduledAt);
    if (d.isSame(current, "month")) {
      const day = d.date();
      if (!sessionsByDay.has(day)) sessionsByDay.set(day, []);
      sessionsByDay.get(day)!.push(s);
    }
  }

  const cells: (number | null)[] = [
    ...Array(startDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = dayjs().date();
  const isCurrentMonth = dayjs().isSame(current, "month");

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <button
          onClick={() => setCurrent(current.subtract(1, "month"))}
          style={navBtnStyle}
        >
          &larr;
        </button>
        <strong style={{ fontSize: "1.1rem" }}>{current.format("MMMM YYYY")}</strong>
        <button
          onClick={() => setCurrent(current.add(1, "month"))}
          style={navBtnStyle}
        >
          &rarr;
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "0.75rem",
              padding: "4px",
              color: "#8b949e",
            }}
          >
            {d}
          </div>
        ))}

        {cells.map((day, idx) => (
          <div
            key={idx}
            style={{
              minHeight: "72px",
              background: day ? "#161b22" : "transparent",
              border: day
                ? isCurrentMonth && day === today
                  ? "1px solid #58a6ff"
                  : "1px solid #30363d"
                : "none",
              borderRadius: "6px",
              padding: "4px",
              fontSize: "0.75rem",
            }}
          >
            {day && (
              <>
                <div
                  style={{
                    color: isCurrentMonth && day === today ? "#58a6ff" : "#8b949e",
                    fontWeight: isCurrentMonth && day === today ? "bold" : "normal",
                    marginBottom: "2px",
                  }}
                >
                  {day}
                </div>
                {(sessionsByDay.get(day) ?? []).map((s) => (
                  <Link
                    key={s.id}
                    to={`/sessions/${s.id}`}
                    style={{
                      display: "block",
                      background: "#0f3460",
                      borderRadius: "3px",
                      padding: "2px 4px",
                      color: "white",
                      textDecoration: "none",
                      marginBottom: "2px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={`${s.title} — ${s.game}`}
                  >
                    {dayjs(s.scheduledAt).format("h:mma")} {s.game}
                  </Link>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: "#161b22",
  color: "white",
  border: "1px solid #30363d",
  borderRadius: "6px",
  padding: "0.3rem 0.75rem",
  cursor: "pointer",
  fontSize: "1rem",
};
