import { useState } from "react";
import { useData } from "../state/DataContext.jsx";

export default function Tasks() {
  const {
    tasks,
    statuses,
    employees,
    groups,
    addTask,
    updateTask,
    currentUser,
  } = useData();

  const [showForm, setShowForm] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigneeId: "",
    groupId: "",
    statusId: "S_OPEN",
    dueDate: "",
  });

  const isAdmin = currentUser?.isAdmin;

  const filteredTasks = tasks.filter((t) => {
    if (!isAdmin) {
      // normal user: only own tasks or group tasks
      const myId = currentUser.employeeId;
      const myGroups = groups
        .filter((g) => g.memberIds?.includes(myId))
        .map((g) => g.id);
      if (!(t.assigneeId === myId || myGroups.includes(t.groupId))) {
        return false;
      }
    }
    if (filterAssignee && t.assigneeId !== filterAssignee) return false;
    if (filterGroup && t.groupId !== filterGroup) return false;
    if (
      search &&
      !(t.title + t.description)
        .toLowerCase()
        .includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const byStatus = {};
  statuses.forEach((s) => {
    byStatus[s.id] = [];
  });
  filteredTasks.forEach((t) => {
    (byStatus[t.statusId] || (byStatus[t.statusId] = [])).push(t);
  });

  const orderedStatuses = [...statuses].sort((a, b) => a.order - b.order);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!form.title || !form.assigneeId) return;
    addTask({
      ...form,
      id: "T" + (tasks.length + 1).toString().padStart(3, "0"),
      createdAt: new Date().toISOString(),
    });
    setForm({
      title: "",
      description: "",
      assigneeId: "",
      groupId: "",
      statusId: "S_OPEN",
      dueDate: "",
    });
    setShowForm(false);
  };

  const markComplete = (task) => {
    const completeStatus =
      statuses.find((s) => s.id === "S_COMPLETE") ||
      statuses[statuses.length - 1];
    updateTask(task.id, { statusId: completeStatus.id });
  };

  const getEmployeeName = (id) =>
    employees.find((e) => e.id === id)?.name || "Unassigned";

  const getGroupName = (id) =>
    groups.find((g) => g.id === id)?.name || "";

  return (
    <div className="page">
      <div className="page-header">
        <div className="filters">
          <input
            className="input"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input"
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
          >
            <option value="">All assignees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
          >
            <option value="">All groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        {isAdmin && (
          <button className="primary-btn" onClick={() => setShowForm(true)}>
            + New Task
          </button>
        )}
      </div>

      <div className="kanban">
        {orderedStatuses.map((s) => (
          <div key={s.id} className="kanban-column">
            <div className="kanban-column-header">
              <span className="status-pill" style={{ borderColor: s.color }}>
                <span
                  className="status-dot"
                  style={{ backgroundColor: s.color }}
                />
                {s.name}
              </span>
              <span className="muted tiny">
                {byStatus[s.id]?.length || 0} tasks
              </span>
            </div>
            <div className="kanban-column-body">
              {(byStatus[s.id] || []).map((t) => (
                <div key={t.id} className="task-card">
                  <h4>{t.title}</h4>
                  {t.description && (
                    <p className="muted tiny">{t.description}</p>
                  )}
                  <div className="task-meta">
                    <span className="chip small">
                      👤 {getEmployeeName(t.assigneeId)}
                    </span>
                    {t.groupId && (
                      <span className="chip small">
                        👥 {getGroupName(t.groupId)}
                      </span>
                    )}
                    {t.dueDate && (
                      <span className="chip small">📅 Due {t.dueDate}</span>
                    )}
                  </div>
                  <div className="task-footer">
                    <select
                      className="input small"
                      value={t.statusId}
                      onChange={(e) =>
                        updateTask(t.id, { statusId: e.target.value })
                      }
                    >
                      {orderedStatuses.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="ghost-btn tiny"
                      onClick={() => markComplete(t)}
                    >
                      ✓ Mark complete
                    </button>
                  </div>
                </div>
              ))}
              {(byStatus[s.id] || []).length === 0 && (
                <p className="muted tiny empty-column">No tasks.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && isAdmin && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Task</h2>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label className="full-width">
                Title
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
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
              <label>
                Assignee
                <select
                  className="input"
                  value={form.assigneeId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, assigneeId: e.target.value }))
                  }
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Group (optional)
                <select
                  className="input"
                  value={form.groupId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, groupId: e.target.value }))
                  }
                >
                  <option value="">None</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select
                  className="input"
                  value={form.statusId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, statusId: e.target.value }))
                  }
                >
                  {orderedStatuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Due date
                <input
                  type="date"
                  className="input"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
