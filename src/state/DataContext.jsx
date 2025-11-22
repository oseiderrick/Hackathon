import React, { createContext, useContext, useEffect, useState } from "react";

const DataContext = createContext();

const STORAGE_KEY = "valmed-admin-data-v1";

/* ===== DEFAULT DATA ===== */

const defaultStatuses = [
  { id: "S_OPEN", name: "Open", color: "#f97316", order: 0, isDefault: true },
  {
    id: "S_IN_PROGRESS",
    name: "In Progress",
    color: "#3b82f6",
    order: 1,
    isDefault: true,
  },
  {
    id: "S_COMPLETE",
    name: "Complete",
    color: "#22c55e",
    order: 2,
    isDefault: true,
  },
];

const defaultEmployees = [
  {
    id: "E001",
    name: "Sarah Johnson",
    address: "123 Main St, Valdosta, GA",
    salary: 75000,
    dateOfHire: "2022-04-01",
    dateOfBirth: "1990-06-15",
    department: "Administration",
    role: "Clinic Admin",
    groupIds: ["G_ADMIN"],
  },
  {
    id: "E002",
    name: "Michael Lee",
    address: "445 Oak Ave, Valdosta, GA",
    salary: 65000,
    dateOfHire: "2021-08-10",
    dateOfBirth: "1994-12-03",
    department: "Nursing",
    role: "RN",
    groupIds: ["G_NURSES"],
  },
  {
    id: "E003",
    name: "Support",
    address: "Valdosta IT Office",
    salary: 80000,
    dateOfHire: "2020-01-10",
    dateOfBirth: "1992-03-10",
    department: "IT",
    role: "Support Admin",
    groupIds: ["G_ADMIN"],
    isProtected: true, // cannot be deleted or removed from Admin group
  },
];

const defaultGroups = [
  {
    id: "G_ADMIN",
    name: "Admin",
    description: "System administrators with full access",
    isDefaultAdmin: true,
    memberIds: ["E001", "E003"], // Sarah + Support
  },
  {
    id: "G_NURSES",
    name: "Nurses",
    description: "Nursing staff",
    memberIds: ["E002"],
  },
];

const defaultTasks = [
  {
    id: "T001",
    title: "Post-op follow-up call",
    description: "Call patient #10231 for follow-up within 24 hours.",
    assigneeId: "E002",
    groupId: "G_NURSES",
    statusId: "S_IN_PROGRESS",
    createdAt: new Date().toISOString(),
    dueDate: new Date().toISOString().slice(0, 10),
  },
  {
    id: "T002",
    title: "Verify insurance forms",
    description: "Confirm coverage with Azalea Health for new patients.",
    assigneeId: "E001",
    groupId: "G_ADMIN",
    statusId: "S_OPEN",
    createdAt: new Date().toISOString(),
    dueDate: "",
  },
];

const defaultActivity = [
  {
    id: "A1",
    message: "System initialized with demo data.",
    timestamp: new Date().toISOString(),
  },
];

/* ===== LOAD / STATE ===== */

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        employees: defaultEmployees,
        groups: defaultGroups,
        statuses: defaultStatuses,
        tasks: defaultTasks,
        activity: defaultActivity,
        currentUser: null,
        theme: "dark",
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      employees: defaultEmployees,
      groups: defaultGroups,
      statuses: defaultStatuses,
      tasks: defaultTasks,
      activity: defaultActivity,
      currentUser: null,
      theme: "dark",
    };
  }
}

export function DataProvider({ children }) {
  const [state, setState] = useState(loadInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const logActivity = (message) => {
    setState((prev) => ({
      ...prev,
      activity: [
        {
          id: "A" + (prev.activity.length + 1),
          message,
          timestamp: new Date().toISOString(),
        },
        ...prev.activity,
      ].slice(0, 30),
    }));
  };

  const setTheme = (theme) => setState((prev) => ({ ...prev, theme }));

  const isAdmin = () => !!state.currentUser?.isAdmin;

  const loginAsEmployee = (employeeId, isAdminOverride = false) => {
    const emp = state.employees.find((e) => e.id === employeeId);
    if (!emp) return;
    const isInAdminGroup = state.groups
      .find((g) => g.isDefaultAdmin)
      ?.memberIds.includes(emp.id);
    const admin = isAdminOverride || isInAdminGroup;
    setState((prev) => ({ ...prev, currentUser: { employeeId, isAdmin: admin } }));
    logActivity(`Logged in as ${emp.name} (${admin ? "Admin" : "User"})`);
  };

  const logout = () => {
    setState((prev) => ({ ...prev, currentUser: null }));
  };

  /* ===== EMPLOYEES ===== */

  const addEmployee = (employee) => {
    if (!isAdmin()) {
      logActivity("Unauthorized attempt to add employee.");
      return;
    }
    setState((prev) => ({
      ...prev,
      employees: [...prev.employees, employee],
    }));
    logActivity(`Employee ${employee.name} added.`);
  };

  const updateEmployee = (id, patch) => {
    if (!isAdmin()) {
      logActivity("Unauthorized attempt to update employee.");
      return;
    }
    setState((prev) => ({
      ...prev,
      employees: prev.employees.map((e) =>
        e.id === id ? { ...e, ...patch } : e
      ),
    }));
    logActivity(`Employee ${id} updated.`);
  };

  const removeEmployee = (id) => {
    if (!isAdmin()) {
      logActivity("Unauthorized attempt to remove employee.");
      return;
    }

    const emp = state.employees.find((e) => e.id === id);
    if (emp?.isProtected) {
      logActivity("Attempted to delete protected admin Support – blocked.");
      return;
    }

    setState((prev) => {
      const employees = prev.employees.filter((e) => e.id !== id);

      const groups = prev.groups.map((g) => ({
        ...g,
        memberIds: g.memberIds?.filter((mid) => mid !== id) || [],
      }));

      const tasks = prev.tasks.map((t) =>
        t.assigneeId === id ? { ...t, assigneeId: "" } : t
      );

      return { ...prev, employees, groups, tasks };
    });
    logActivity(`Employee ${id} removed.`);
  };

  /* ===== GROUPS & MEMBERSHIP ===== */

  const addGroup = (group) => {
    if (!isAdmin()) {
      logActivity("Unauthorized attempt to create group.");
      return;
    }
    setState((prev) => ({
      ...prev,
      groups: [...prev.groups, group],
    }));
    logActivity(`Group ${group.name} created.`);
  };

  const updateGroup = (id, patch) => {
    if (!isAdmin()) {
      logActivity("Unauthorized attempt to update group.");
      return;
    }
    setState((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
    logActivity(`Group ${id} updated.`);
  };

  // ADMIN ONLY: add / remove members from groups
  const addMemberToGroup = (groupId, employeeId) => {
    if (!isAdmin()) {
      logActivity("Unauthorized attempt to add member to group.");
      return;
    }
    setState((prev) => {
      const groups = prev.groups.map((g) => {
        if (g.id !== groupId) return g;
        const memberIds = g.memberIds || [];
        if (memberIds.includes(employeeId)) return g;
        return { ...g, memberIds: [...memberIds, employeeId] };
      });

      return { ...prev, groups };
    });
    logActivity(`Employee ${employeeId} added to group ${groupId}.`);
  };

  const removeMemberFromGroup = (groupId, employeeId) => {
    if (!isAdmin()) {
      logActivity("Unauthorized attempt to remove member from group.");
      return;
    }

    const group = state.groups.find((g) => g.id === groupId);
    const emp = state.employees.find((e) => e.id === employeeId);

    // Never remove Support from default Admin group
    if (group?.isDefaultAdmin && emp?.isProtected) {
      logActivity(
        "Attempted to remove protected admin Support from Admin group – blocked."
      );
      return;
    }

    setState((prev) => {
      const groups = prev.groups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          memberIds: (g.memberIds || []).filter((id) => id !== employeeId),
        };
      });
      return { ...prev, groups };
    });
    logActivity(`Employee ${employeeId} removed from group ${groupId}.`);
  };

  /* ===== STATUSES ===== */

  const addStatus = (status) => {
    if (!isAdmin()) {
      logActivity("Unauthorized attempt to add status.");
      return;
    }
    setState((prev) => ({
      ...prev,
      statuses: [...prev.statuses, { ...status, isDefault: !!status.isDefault }],
    }));
    logActivity(`Status "${status.name}" added.`);
  };

  const updateStatusOrder = (id, direction) => {
    if (!isAdmin()) {
      logActivity("Unauthorized attempt to reorder statuses.");
      return;
    }
    setState((prev) => {
      const statuses = [...prev.statuses].sort((a, b) => a.order - b.order);
      const index = statuses.findIndex((s) => s.id === id);
      if (index === -1) return prev;
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= statuses.length) return prev;
      const tmp = statuses[index].order;
      statuses[index].order = statuses[swapIndex].order;
      statuses[swapIndex].order = tmp;
      return { ...prev, statuses };
    });
    logActivity(`Status order updated.`);
  };

  const removeStatus = (id) => {
    if (!isAdmin()) {
      logActivity("Unauthorized attempt to remove status.");
      return;
    }

    const statusToRemove = state.statuses.find((s) => s.id === id);
    if (!statusToRemove) return;
    if (statusToRemove.isDefault) {
      logActivity(`Attempted to delete default status ${id} – blocked.`);
      return;
    }

    setState((prev) => {
      const statuses = prev.statuses.filter((s) => s.id !== id);

      // fallback status = first default or first remaining
      const fallback =
        prev.statuses.find((s) => s.isDefault) || statuses[0] || null;

      let tasks = prev.tasks;
      if (fallback) {
        tasks = prev.tasks.map((t) =>
          t.statusId === id ? { ...t, statusId: fallback.id } : t
        );
      }

      return { ...prev, statuses, tasks };
    });
    logActivity(`Status ${id} removed.`);
  };

  /* ===== TASKS ===== */

  const addTask = (task) => {
    // ONLY ADMIN may create tasks
    if (!isAdmin()) {
      logActivity("Unauthorized attempt to create task.");
      return;
    }
    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, task],
    }));
    logActivity(`Task "${task.title}" created.`);
  };

  const updateTask = (id, patch) => {
    let updatedTask;
    setState((prev) => {
      const tasks = prev.tasks.map((t) => {
        if (t.id === id) {
          updatedTask = { ...t, ...patch };
          return updatedTask;
        }
        return t;
      });
      return { ...prev, tasks };
    });
    if (updatedTask?.statusId) {
      logActivity(
        `Task "${updatedTask.title}" updated (status: ${updatedTask.statusId}).`
      );
    } else {
      logActivity(`Task "${updatedTask?.title || id}" updated.`);
    }
  };

  const value = {
    ...state,
    setTheme,
    loginAsEmployee,
    logout,
    // employees
    addEmployee,
    updateEmployee,
    removeEmployee,
    // groups
    addGroup,
    updateGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    // statuses
    addStatus,
    updateStatusOrder,
    removeStatus,
    // tasks
    addTask,
    updateTask,
    // misc
    logActivity,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
