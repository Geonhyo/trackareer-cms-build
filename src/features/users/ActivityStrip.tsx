import { todayKst } from '@/shared/lib/format';
import styles from './detail.module.css';

const DAYS = 30;

function addDays(key: string, days: number): string {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** 최근 30일 접속한 날 (칸 하나가 하루, 오른쪽 끝이 오늘) */
export function ActivityStrip({ activeDates }: { activeDates: string[] }) {
  const today = todayKst();
  const active = new Set(activeDates);
  const days = Array.from({ length: DAYS }, (_, index) => addDays(today, index - (DAYS - 1)));
  return (
    <div className={styles.strip} aria-label={`최근 30일 중 ${active.size}일 접속`}>
      {days.map((day) => (
        <span
          key={day}
          className={styles.day}
          data-active={active.has(day)}
          title={`${day}${active.has(day) ? ' 접속' : ''}`}
        />
      ))}
    </div>
  );
}
