const API = "http://localhost:5000/api/auth";

if (localStorage.getItem("token")) window.location.href = "dashboard.html";

// Show Google button only if OAuth is configured on server
fetch("/api/auth/google/status").then(r => r.json()).then(d => {
  if (d.enabled) document.getElementById("googleBtn").style.display = "flex";
}).catch(() => {});

const urlParams = new URLSearchParams(window.location.search);
const oauthToken = urlParams.get("token");
if (oauthToken) {
  localStorage.setItem("token", oauthToken);
  localStorage.setItem("user", JSON.stringify({
    id: urlParams.get("id"),
    name: urlParams.get("name"),
    email: urlParams.get("email"),
    role: urlParams.get("role"),
    companyName: urlParams.get("company"),
  }));
  window.location.href = "dashboard.html";
}

function switchTab(tab) {
  ["loginForm", "registerForm", "forgotForm"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  const form = document.getElementById(tab + "Form");
  if (form) form.style.display = "block";

  document.querySelectorAll(".tab").forEach((btn) => btn.classList.remove("active"));
  const activeTab = document.querySelector(`[data-tab="${tab}"]`);
  if (activeTab) activeTab.classList.add("active");

  ["loginMsg", "registerMsg", "forgotMsg"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
}

async function login(e) {
  e.preventDefault();
  const btn = document.getElementById("loginBtn");
  const msg = document.getElementById("loginMsg");
  btn.disabled = true;
  btn.textContent = "Logging in...";
  msg.textContent = "";
  msg.className = "msg";

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value,
      }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "dashboard.html";
    } else {
      msg.textContent = data.message || "Login failed";
      msg.classList.add("error");
    }
  } catch {
    msg.textContent = "Cannot connect to server. Is the backend running?";
    msg.classList.add("error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Login";
  }
}

async function register(e) {
  e.preventDefault();
  const btn = document.getElementById("registerBtn");
  const msg = document.getElementById("registerMsg");
  btn.disabled = true;
  btn.textContent = "Registering...";
  msg.textContent = "";
  msg.className = "msg";

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const companyName = document.getElementById("companyName").value.trim();
  const role = document.getElementById("regRole").value;
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;

  try {
    const res = await fetch(`${API}/company/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: companyName,
        email,
        adminName: `${firstName} ${lastName}`,
        adminPassword: password,
        role,
      }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "dashboard.html";
    } else {
      msg.textContent = data.message || "Registration failed";
      msg.classList.add("error");
    }
  } catch {
    msg.textContent = "Cannot connect to server. Is the backend running?";
    msg.classList.add("error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Register";
  }
}
