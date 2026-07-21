import type { ScheduleEntry } from '../types/ai.types';

interface ScheduleListProps {
  schedules: ScheduleEntry[];
}

export function ScheduleList({ schedules }: ScheduleListProps) {
  return (
    <div className="detail-block">
      <h5>Horarios</h5>
      <ul className="schedule-list">
        {schedules.map((schedule, index) => (
          <li key={`${schedule.day}-${index}`}>
            <span>
              <strong>{schedule.day}</strong>
              <small>{schedule.notes ?? 'Sin observaciones'}</small>
            </span>
            <span
              className={`schedule-status ${
                schedule.isAvailable
                  ? 'schedule-status--available'
                  : 'schedule-status--unavailable'
              }`}
            >
              {schedule.isAvailable
                ? `${schedule.startTime ?? 'No disponible'} – ${schedule.endTime ?? 'No disponible'}`
                : 'No disponible'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
