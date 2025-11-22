import { useState } from "react";
import { useData } from "./state/DataContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Employees from "./pages/Employees.jsx";
import Groups from "./pages/Groups.jsx";
import Statuses from "./pages/Statuses.jsx";
import Tasks from "./pages/Tasks.jsx";
import Login from "./pages/Login.jsx";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "employees", label: "Employees", icon: "👤" },
  { key: "tasks", label: "Tasks", icon: "✅" },
  { key: "groups", label: "Groups", icon: "👥" },
  { key: "statuses", label: "Statuses", icon: "🏷️", adminOnly: true },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const { theme, setTheme, currentUser, employees, logout } = useData();

  if (!currentUser) {
    return <Login />;
  }

  const user = employees.find((e) => e.id === currentUser.employeeId);
  const isAdmin = currentUser.isAdmin;

  let pageTitle = "Dashboard";
  let content = <Dashboard />;

  if (page === "employees") {
    pageTitle = "Employees";
    content = <Employees />;
  } else if (page === "tasks") {
    pageTitle = "Tasks";
    content = <Tasks />;
  } else if (page === "groups") {
    pageTitle = "Groups";
    content = <Groups />;
  } else if (page === "statuses") {
    pageTitle = "Statuses";
    content = <Statuses />;
  }

  return (
    <div className={`app ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      {/* sidebar */}
      <aside className="sidebar">
        <div className="logo">ValMed Admin</div>
        <nav className="nav">
          {NAV_ITEMS.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            return (
              <button
                key={item.key}
                className={`nav-item ${page === item.key ? "active" : ""}`}
                onClick={() => setPage(item.key)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <small className="muted">Hackathon • ByteForce</small>
        </div>
      </aside>

      {/* main */}
      <div className="main">
        <header className="topbar">
          <div>
            <h1>{pageTitle}</h1>
            <p className="muted">
              Logged in as {user?.name} {isAdmin ? "(Admin)" : "(User)"}
            </p>
          </div>
          <div className="topbar-right">
            <button
              className="ghost-btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button className="ghost-btn" onClick={logout}>
              Log out
            </button>
            <div className="avatar">
              {user?.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          </div>
        </header>
        <main className="content">{content}</main>
      </div>
    </div>
  );
}
