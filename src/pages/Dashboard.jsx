import { useData } from "../state/DataContext.jsx";

export default function Dashboard() {
  const { employees, tasks, groups, statuses, activity } = useData();

  const openCount = tasks.filter((t) => t.statusId === "S_OPEN").length;
  const inProgressCount = tasks.filter(
    (t) => t.statusId === "S_IN_PROGRESS"
  ).length;
  const completeCount = tasks.filter(
    (t) => t.statusId === "S_COMPLETE"
  ).length;

  const today = new Date().toISOString().slice(0, 10);
  const dueToday = tasks.filter((t) => t.dueDate === today).length;

  const total = tasks.length || 1;
  const pctOpen = Math.round((openCount / total) * 100);
  const pctInProg = Math.round((inProgressCount / total) * 100);
  const pctComplete = Math.round((completeCount / total) * 100);

  return (
    <>
      <section className="cards-row">
        <div className="card">
          <p className="card-label">Employees</p>
          <p className="card-value">{employees.length}</p>
          <p className="muted tiny">Active staff in the system</p>
        </div>
        <div className="card">
          <p className="card-label">Open Tasks</p>
          <p className="card-value">{openCount}</p>
          <p className="muted tiny">{dueToday} due today</p>
        </div>
        <div className="card">
          <p className="card-label">Groups</p>
          <p className="card-value">{groups.length}</p>
          <p className="muted tiny">Including default Admin group</p>
        </div>
        <div className="card">
          <p className="card-label">Statuses</p>
          <p className="card-value">{statuses.length}</p>
          <p className="muted tiny">Fully customizable</p>
        </div>
      </section>

      <section className="grid-two">
        <div className="card">
          <h2>Task Status Overview</h2>
          <div className="status-bars">
            <StatusBar label="Open" value={pctOpen} />
            <StatusBar label="In Progress" value={pctInProg} />
            <StatusBar label="Complete" value={pctComplete} />
          </div>
        </div>

        <div className="card">
          <h2>Recent Activity</h2>
          <ul className="timeline">
            {activity.slice(0, 7).map((a) => (
              <li key={a.id}>
                <span className="dot" />
                <div>
                  <p>{a.message}</p>
                  <small className="muted">
                    {new Date(a.timestamp).toLocaleString()}
                  </small>
                </div>
              </li>
            ))}
            {activity.length === 0 && (
              <p className="muted tiny">No activity yet.</p>
            )}
          </ul>
        </div>
      </section>
    </>
  );
}

function StatusBar({ label, value }) {
  return (
    <div className="status-bar">
      <div className="status-bar-header">
        <span>{label}</span>
        <span className="muted tiny">{value}%</span>
      </div>
      <div className="status-bar-track">
        <div
          className="status-bar-fill"
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}
