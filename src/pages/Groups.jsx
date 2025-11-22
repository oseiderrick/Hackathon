import { useState } from "react";
import { useData } from "../state/DataContext.jsx";

export default function Groups() {
  const {
    groups,
    employees,
    addGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    currentUser,
  } = useData();

  const isAdmin = currentUser?.isAdmin;

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", description: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!form.id || !form.name) return;
    addGroup({ ...form, isDefaultAdmin: false, memberIds: [] });
    setForm({ id: "", name: "", description: "" });
    setShowForm(false);
  };

  const memberCount = (g) => g.memberIds?.length || 0;

  const getMembers = (g) =>
    employees.filter((e) => g.memberIds?.includes(e.id));

  const getNonMembers = (g) =>
    employees.filter((e) => !(g.memberIds || []).includes(e.id));

  return (
    <div className="page">
      <div className="page-header">
        <h2>Groups</h2>
        {isAdmin && (
          <button className="primary-btn" onClick={() => setShowForm(true)}>
            + New Group
          </button>
        )}
      </div>

      <div className="cards-row">
        {groups.map((g) => (
          <div key={g.id} className="card">
            <div className="card-flex-header">
              <h3>{g.name}</h3>
              {g.isDefaultAdmin && <span className="badge">Admin group</span>}
            </div>
            <p className="muted tiny">{g.description || "No description"}</p>
            <p className="muted tiny" style={{ marginTop: "0.25rem" }}>
              {memberCount(g)} members
            </p>

            <div className="chips">
              {getMembers(g).map((m) => (
                <span key={m.id} className="chip">
                  {m.name}
                  {isAdmin &&
                    !(g.isDefaultAdmin && m.isProtected) && ( // can't remove Support from Admin
                      <button
                        className="chip-remove"
                        type="button"
                        onClick={() => removeMemberFromGroup(g.id, m.id)}
                      >
                        ×
                      </button>
                    )}
                </span>
              ))}
              {getMembers(g).length === 0 && (
                <span className="muted tiny">No members yet.</span>
              )}
            </div>

            {isAdmin && (
              <div style={{ marginTop: "0.5rem" }}>
                <label className="tiny">
                  Add member:
                  <select
                    className="input"
                    defaultValue=""
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) return;
                      addMemberToGroup(g.id, value);
                      e.target.value = "";
                    }}
                  >
                    <option value="">Select employee</option>
                    {getNonMembers(g).map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && isAdmin && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Group</h2>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Group ID
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
              <label className="full-width">
                Description
                <textarea
                  className="input"
                  rows="3"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
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
                <button type="submit" className="primary-btn">
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
