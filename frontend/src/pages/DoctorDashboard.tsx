import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import AppointmentCard from '../components/AppointmentCard';
import { Appointment, AuthState } from '../types';

const getLocalDate = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateHeading = (dateStr: string) => {
  const localToday = getLocalDate();
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  if (dateStr === localToday) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';

  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Group flat list of appointments into { date -> appointments[] }
const groupByDate = (appointments: Appointment[]) => {
  const map = new Map<string, Appointment[]>();
  for (const appt of appointments) {
    const group = map.get(appt.date) ?? [];
    group.push(appt);
    map.set(appt.date, group);
  }
  return map;
};

interface Props {
  auth: AuthState;
  onLogout: () => void;
}

export default function DoctorDashboard({ auth, onLogout }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const localToday = getLocalDate();

  useEffect(() => {
    api
      .get<Appointment[]>(`/appointments/my?date=${localToday}`, auth.token)
      .then((data) => setAppointments(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [auth.token, localToday]);

  const handleNewAppointment = useCallback((appointment: Appointment) => {
    setAppointments((prev) => {
      // avoid duplicates
      if (prev.find((a) => a._id === appointment._id)) return prev;
      const updated = [...prev, appointment];
      return updated.sort((a, b) =>
        a.date !== b.date ? a.date.localeCompare(b.date) : a.startTime.localeCompare(b.startTime)
      );
    });
    setNewIds((prev) => new Set(prev).add(appointment._id));
    setTimeout(() => {
      setNewIds((prev) => {
        const next = new Set(prev);
        next.delete(appointment._id);
        return next;
      });
    }, 5000);
  }, []);

  useSocket(auth.token, handleNewAppointment);

  const grouped = groupByDate(appointments);
  const totalCount = appointments.length;

  const headerDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>ClinicFlow</h1>
          <p style={styles.date}>{headerDate}</p>
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{auth.user.name}</span>
          <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.titleRow}>
          <h2 style={styles.sectionTitle}>Upcoming Schedule</h2>
          <span style={styles.count}>
            {totalCount} appointment{totalCount !== 1 ? 's' : ''}
          </span>
        </div>

        {loading && <p style={styles.empty}>Loading…</p>}

        {!loading && totalCount === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.empty}>No upcoming appointments.</p>
            <p style={{ color: '#999', fontSize: '0.875rem' }}>
              New bookings by the admin will appear here in real time.
            </p>
          </div>
        )}

        {!loading && Array.from(grouped.entries()).map(([date, appts]) => (
          <div key={date} style={styles.group}>
            <div style={styles.dateHeader}>
              <span style={styles.dateLabel}>{formatDateHeading(date)}</span>
              <span style={styles.dateSub}>{date === localToday ? date : date}</span>
            </div>
            <div style={styles.list}>
              {appts.map((appt) => (
                <AppointmentCard key={appt._id} appointment={appt} isNew={newIds.has(appt._id)} />
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f0f4f8', display: 'flex', flexDirection: 'column' },
  header: {
    background: '#0f5132',
    color: '#fff',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: { margin: 0, fontSize: '1.3rem' },
  date: { margin: '2px 0 0', fontSize: '0.85rem', opacity: 0.8 },
  userInfo: { display: 'flex', alignItems: 'center', gap: '1rem' },
  userName: { fontSize: '0.95rem' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: 6,
    padding: '0.4rem 0.9rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  main: { flex: 1, padding: '2rem', maxWidth: 740, margin: '0 auto', width: '100%' },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  sectionTitle: { margin: 0, color: '#222' },
  count: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#666',
    background: '#e8eef6',
    borderRadius: 20,
    padding: '3px 12px',
  },
  group: { marginBottom: '1.75rem' },
  dateHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.75rem',
    marginBottom: '0.6rem',
    borderBottom: '2px solid #d1e3f8',
    paddingBottom: '0.4rem',
  },
  dateLabel: { fontWeight: 700, fontSize: '1rem', color: '#1a73e8' },
  dateSub: { fontSize: '0.8rem', color: '#888' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.65rem' },
  emptyState: { textAlign: 'center', padding: '3rem 0' },
  empty: { color: '#666', fontSize: '1rem' },
};
