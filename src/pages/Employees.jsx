import { useState } from "react";
import { useData } from "../state/DataContext.jsx";

export default function Employees() {
  const {
    employees,
    groups,
    addEmployee,
    removeEmployee,
    currentUser,
  } = useData();

  const isAdmin = currentUser?.isAdmin;

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(""); // duplicate ID error
  const [form, setForm] = useState({
    id: "",
    name: "",
    address: "",
    salary: "",
    dateOfHire: "",
    dateOfBirth: "",
    department: "",
    role: "",
  });

  const filtered = employees.filter((e) =>
    (e.name + e.department + e.role)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (employees.some((emp) => emp.id === form.id)) {
      setError("Employee ID already exists. Please choose another ID.");
      return;
    }

    if (!form.id || !form.name) return;

    addEmployee({
      ...form,
      salary: Number(form.salary || 0),
      groupIds: [],
    });

    setForm({
      id: "",
      name: "",
      address: "",
      salary: "",
      dateOfHire: "",
      dateOfBirth: "",
      department: "",
      role: "",
    });
    setError("");
    setShowForm(false);
  };

  const getGroupsFor = (emp) =>
    groups.filter((g) => g.memberIds?.includes(emp.id)).map((g) => g.name);

  return (
    <div className="page">
      <div className="page-header">
        <input
          className="input"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isAdmin && (
          <button className="primary-btn" onClick={() => setShowForm(true)}>
            + Add Employee
          </button>
        )}
      </div>

      <div className="card table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department / Role</th>
              <th>Groups</th>
              <th>Date of Hire</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id}>
                <td>{e.id}</td>
                <td>{e.name}</td>
                <td>
                  {e.department} • <span className="muted">{e.role}</span>
                </td>
                <td>
                  {getGroupsFor(e).length ? (
                    getGroupsFor(e).join(", ")
                  ) : (
                    <span className="muted tiny">None</span>
                  )}
                </td>
                <td>{e.dateOfHire}</td>
                {isAdmin && (
                  <td>
                    <button
                      className="ghost-btn tiny"
                      onClick={() => {
                        if (window.confirm(`Remove employee ${e.name}?`)) {
                          removeEmployee(e.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="muted tiny">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && isAdmin && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Employee</h2>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Employee ID
                <input
                  className="input"
                  value={form.id}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((f) => ({ ...f, id: value }));
                    if (employees.some((emp) => emp.id === value)) {
                      setError(
                        "Employee ID already exists. Please choose another ID."
                      );
                    } else {
                      setError("");
                    }
                  }}
                  required
                />
                {error && (
                  <span
                    className="tiny"
                    style={{ color: "#f97316", marginTop: "0.15rem" }}
                  >
                    {error}
                  </span>
                )}
              </label>
              <label>
                Name
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Address
                <input
                  className="input"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </label>
              <label>
                Salary
                <input
                  type="number"
                  className="input"
                  value={form.salary}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, salary: e.target.value }))
                  }
                />
              </label>
              <label>
                Date of Hire
                <input
                  type="date"
                  className="input"
                  value={form.dateOfHire}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dateOfHire: e.target.value }))
                  }
                />
              </label>
              <label>
                Date of Birth
                <input
                  type="date"
                  className="input"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dateOfBirth: e.target.value }))
                  }
                />
              </label>
              <label>
                Department
                <input
                  className="input"
                  value={form.department}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, department: e.target.value }))
                  }
                />
              </label>
              <label>
                Role
                <input
                  className="input"
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                />
              </label>
              <div className="form-actions full-width">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={!!error}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
