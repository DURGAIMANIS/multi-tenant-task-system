const API = "http://localhost:5000/api/tasks";
const USERS_API = "http://localhost:5000/api/users";

// Handle Google OAuth redirect — save token from URL params
const urlParams = new URLSearchParams(window.location.search);
const oauthToken = urlParams.get("token");
if (oauthToken) {
  localStorage.setItem("token", oauthToken);
  localStorage.setItem("user", JSON.stringify({
    id: urlParams.get("id"),
    name: decodeURIComponent(urlParams.get("name") || ""),
    email: decodeURIComponent(urlParams.get("email") || ""),
    role: urlParams.get("role"),
    companyName: decodeURIComponent(urlParams.get("company") || ""),
  }));
  // Clean URL
  window.history.replaceState({}, document.title, "/dashboard.html");
}

const token = localStorage.getItem("token");
if (!token) window.location.href = "index.html";

const user = JSON.parse(localStorage.getItem("user") || "{}");
document.getElementById("sidebarName").textContent = user.name || "User";
document.getElementById("sidebarRole").textContent = user.role || "employee";
document.getElementById("topbarName").textContent = user.name || "User";
document.getElementById("avatarInitial").textContent = (user.name || "U")[0].toUpperCase();

let allTasks = [];
let currentFilter = "all";

// ── Section Toggle ─────────────────────────────────────
function showSection(section, navEl) {
  ["sectionTasks", "sectionMytasks", "sectionPresence"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  const target = document.getElementById("section" + section.charAt(0).toUpperCase() + section.slice(1));
  if (target) target.style.display = "block";

  document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
  navEl.classList.add("active");

  if (section === "presence") loadUserStatus();
  if (section === "mytasks") renderTasksAlt();
}

function renderTasksAlt() {
  const list = document.getElementById("taskListAlt");
  if (!list) return;
  if (!allTasks.length) {
    list.innerHTML = '<p class="empty-state">No tasks yet.</p>';
    return;
  }
  list.innerHTML = allTasks.map((task) => `
    <div class="task-card">
      <div class="task-card-header">
        <span class="badge badge-${task.status}">${task.status}</span>
        <span class="badge badge-priority-${task.priority}">${task.priority}</span>
        <div class="task-actions">
          <button class="icon-btn edit-btn" onclick='openModal(${JSON.stringify(task)})' title="Edit">✎</button>
          <button class="icon-btn delete-btn" onclick="deleteTask('${task._id}')" title="Delete">✕</button>
        </div>
      </div>
      <h4 class="task-title">${escapeHtml(task.title)}</h4>
      <p class="task-desc">${escapeHtml(task.description || "No description")}</p>
      <div class="task-footer">
        <span class="task-meta">By: ${task.createdBy?.name || "—"}</span>
        <span class="task-date">${new Date(task.createdAt).toLocaleDateString()}</span>
      </div>
    </div>`).join("");
}

// ── Logout ─────────────────────────────────────────────
function logout() {
  fetch("http://localhost:5000/api/auth/logout", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
  }).finally(() => {
    localStorage.clear();
    window.location.href = "index.html";
  });
}

// ── Presence ───────────────────────────────────────────
async function loadUserStatus() {
  const container = document.getElementById("presenceList");
  container.innerHTML = '<p class="empty-state">Loading...</p>';

  try {
    const res = await fetch(`${USERS_API}/status`, {
      headers: { Authorization: "Bearer " + token },
    });

    if (res.status === 403) {
      container.innerHTML = '<p class="empty-state">Only Admin and Manager can view team presence.</p>';
      return;
    }
    if (!res.ok) {
      container.innerHTML = '<p class="empty-state">Failed to load team status.</p>';
      return;
    }

    const users = await res.json();
    if (!users.length) {
      container.innerHTML = '<p class="empty-state">No team members found.</p>';
      return;
    }
    renderPresence(users);
  } catch {
    container.innerHTML = '<p class="empty-state">Cannot connect to server.</p>';
  }
}

function renderPresence(users) {
  const online = users.filter((u) => u.isOnline);
  const offline = users.filter((u) => !u.isOnline);
  const sorted = [...online, ...offline];

  document.getElementById("presenceList").innerHTML = sorted.map((u) => `
    <div class="presence-card">
      <div class="presence-avatar ${u.isOnline ? "online" : "offline"}">
        ${u.name[0].toUpperCase()}
      </div>
      <div class="presence-info">
        <div class="presence-name">${escapeHtml(u.name)}</div>
        <div class="presence-role">${u.role}</div>
      </div>
      <div class="presence-status-col">
        <span class="presence-badge ${u.isOnline ? "badge-online" : "badge-offline"}">
          ${u.isOnline ? "● Online" : "○ Offline"}
        </span>
        <div class="presence-time">
          ${u.lastActiveAt ? "Last seen: " + new Date(u.lastActiveAt).toLocaleString() : "Never logged in"}
        </div>
      </div>
    </div>`).join("");
}

// ── Modal ──────────────────────────────────────────────
function openModal(task = null) {
  document.getElementById("modalOverlay").classList.add("open");
  document.getElementById("taskTitle").value = task?.title || "";
  document.getElementById("taskDesc").value = task?.description || "";
  document.getElementById("taskStatus").value = task?.status || "pending";
  document.getElementById("taskPriority").value = task?.priority || "medium";
  document.getElementById("editTaskId").value = task?._id || "";
  document.getElementById("modalTitle").textContent = task ? "Edit Task" : "New Task";
  document.getElementById("modalSubmitBtn").textContent = task ? "Save Changes" : "Create Task";
  document.getElementById("taskTitle").focus();
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

function closeModalOnOverlay(e) {
  if (e.target.id === "modalOverlay") closeModal();
}

// ── CRUD ───────────────────────────────────────────────
async function submitTask(e) {
  e.preventDefault();
  const id = document.getElementById("editTaskId").value;
  const body = {
    title: document.getElementById("taskTitle").value,
    description: document.getElementById("taskDesc").value,
    status: document.getElementById("taskStatus").value,
    priority: document.getElementById("taskPriority").value,
  };

  try {
    const res = await fetch(id ? `${API}/${id}` : API, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify(body),
    });
    if (res.status === 401) { logout(); return; }
    if (!res.ok) { const err = await res.json(); alert(err.message || "Failed"); return; }
    closeModal();
    loadTasks();
  } catch {
    alert("Cannot connect to server.");
  }
}

async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    if (res.status === 401) { logout(); return; }
    loadTasks();
  } catch {
    alert("Cannot connect to server.");
  }
}

// ── Load & Render Tasks ────────────────────────────────
async function loadTasks() {
  try {
    const res = await fetch(API, { headers: { Authorization: "Bearer " + token } });
    if (res.status === 401) { logout(); return; }
    const data = await res.json();
    allTasks = Array.isArray(data) ? data : (data.tasks || []);
    updateStats();
    renderTasks();
  } catch {
    document.getElementById("taskList").innerHTML = '<p class="empty-state">Cannot connect to server.</p>';
  }
}

function updateStats() {
  document.getElementById("statTotal").textContent = allTasks.length;
  document.getElementById("statPending").textContent = allTasks.filter((t) => t.status === "pending").length;
  document.getElementById("statInProgress").textContent = allTasks.filter((t) => t.status === "in-progress").length;
  document.getElementById("statCompleted").textContent = allTasks.filter((t) => t.status === "completed").length;
}

function filterTasks(status, btn) {
  currentFilter = status;
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderTasks();
}

function renderTasks() {
  const filtered = currentFilter === "all" ? allTasks : allTasks.filter((t) => t.status === currentFilter);
  const list = document.getElementById("taskList");

  if (filtered.length === 0) {
    list.innerHTML = `<p class="empty-state">${currentFilter === "all" ? "No tasks yet. Create your first task!" : `No ${currentFilter} tasks.`}</p>`;
    return;
  }

  list.innerHTML = filtered.map((task) => `
    <div class="task-card">
      <div class="task-card-header">
        <span class="badge badge-${task.status}">${task.status}</span>
        <span class="badge badge-priority-${task.priority}">${task.priority}</span>
        <div class="task-actions">
          <button class="icon-btn edit-btn" onclick='openModal(${JSON.stringify(task)})' title="Edit">✎</button>
          <button class="icon-btn delete-btn" onclick="deleteTask('${task._id}')" title="Delete">✕</button>
        </div>
      </div>
      <h4 class="task-title">${escapeHtml(task.title)}</h4>
      <p class="task-desc">${escapeHtml(task.description || "No description")}</p>
      <div class="task-footer">
        <span class="task-meta">By: ${task.createdBy?.name || "—"}</span>
        <span class="task-date">${new Date(task.createdAt).toLocaleDateString()}</span>
      </div>
    </div>`).join("");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

loadTasks();
