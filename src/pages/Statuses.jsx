import { useState } from "react";
import { useData } from "../state/DataContext.jsx";

export default function Statuses() {
  const { statuses, addStatus, updateStatusOrder, removeStatus } = useData();
  const [form, setForm] = useState({ id: "", name: "", color: "#6366f1" });

  const ordered = [...statuses].sort((a, b) => a.order - b.order);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id || !form.name) return;
    const maxOrder = ordered.reduce(
      (max, s) => (s.order > max ? s.order : max),
      0
    );
    addStatus({ ...form, order: maxOrder + 1, isDefault: false });
    setForm({ id: "", name: "", color: "#6366f1" });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Statuses</h2>
      </div>

      <div className="grid-two">
        <div className="card">
          <h3>Existing Statuses</h3>
          <ul className="status-list">
            {ordered.map((s) => (
              <li key={s.id} className="status-row">
                <span
                  className="status-dot"
                  style={{ backgroundColor: s.color }}
                />
                <span className="status-name">
                  {s.name}{" "}
                  <span className="muted tiny">
                    ({s.id}) {s.isDefault ? "• default" : ""}
                  </span>
                </span>
                <div className="status-actions">
                  <button
                    className="ghost-btn tiny"
                    onClick={() => updateStatusOrder(s.id, "up")}
                  >
                    ↑
                  </button>
                  <button
                    className="ghost-btn tiny"
                    onClick={() => updateStatusOrder(s.id, "down")}
                  >
                    ↓
                  </button>
                  {!s.isDefault && (
                    <button
                      className="ghost-btn tiny"
                      onClick={() => removeStatus(s.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>Add Status</h3>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Status ID
              <input
                className="input"
                value={form.id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, id: e.target.value }))
                }
                required
              />
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
              Color
              <input
                type="color"
                className="input"
                value={form.color}
                onChange={(e) =>
                  setForm((f) => ({ ...f, color: e.target.value }))
                }
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="primary-btn">
                Add
              </button>
            </div>
          </form>
          <p className="muted tiny" style={{ marginTop: "0.75rem" }}>
            Custom statuses can be deleted. Default core statuses cannot.
          </p>
        </div>
      </div>
    </div>
  );
}
