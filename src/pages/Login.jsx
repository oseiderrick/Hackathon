import { useData } from "../state/DataContext.jsx";

export default function Login() {
  const { employees, loginAsEmployee } = useData();

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>ValMed Admin</h1>
        <p className="muted">Select who you want to log in as.</p>
        <div className="login-list">
          {employees.map((e) => (
            <button
              key={e.id}
              className="login-user-btn"
              onClick={() => loginAsEmployee(e.id)}
            >
              <div className="avatar small">
                {e.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="login-user-info">
                <strong>{e.name}</strong>
                <span className="muted">
                  {e.role} • {e.department}
                </span>
              </div>
            </button>
          ))}
        </div>
        <p className="muted tiny">
          Admin rights are based on membership in the Admin group.
        </p>
      </div>
    </div>
  );
}
