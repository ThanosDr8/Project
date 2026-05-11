// ======================
// Dark mode helper
// ======================
function toggleDarkMode(isLight) {
  const body = document.body;
  body.classList.toggle("light-mode", isLight);

  const modals = ["myModal", "filterModal", "settingsModal", "accModal"];
  const modalContents = ["new-task-modal-content", "filter-modal-content", "settings-modal-content", "accModalContent"];

  modals.forEach(id => document.getElementById(id)?.classList.toggle("light-modal-bg", isLight));
  modalContents.forEach(id => document.getElementById(id)?.classList.toggle("light-modal-content", isLight));

  document.querySelectorAll("input, textarea, select, button").forEach(el => {
    const isSearchBar = el.id === "search-bar";
    const isNewTaskBtn = el.classList.contains("newtask");
    
    const isSpecificControlBtn = 
      el.classList.contains("menu-button") || 
      el.classList.contains("close-button") || 
      el.classList.contains("settings-button") || 
      el.classList.contains("filter-button") || 
      el.classList.contains("view-type-button") ||
      el.classList.contains("sign-in-button") ||
      el.classList.contains("submit-button") ||
      el.classList.contains("sign-in") ||
      el.classList.contains("logout-button") ||
      el.classList.contains("close-task-module") ||
      el.classList.contains("filter-close") ||
      el.classList.contains("close-settings") ||
      el.id === "closeAccModal" ||
      el.id === "cancel" ||
      el.id === "apply-filters-button" ||
      el.id === "reset-filters" ||
      el.classList.contains("delete-button") ||
      el.classList.contains("edit-button");

    if (!isSearchBar && !isNewTaskBtn && !isSpecificControlBtn) {
      el.classList.toggle("light-input", isLight);
    }
  });
}

// ======================
// Main IIFE
// ======================
(() => {
  "use strict";

  // ======================
  // State
  // ======================
  let allTasks = [];
  let taskBeingEdited = null;
  let currentUser = JSON.parse(localStorage.getItem("user")) || null;

  // ======================
  // Elements
  // ======================
  const sidebar = document.getElementById("mySidebar");
  const main = document.getElementById("main");
  const menuBtn = document.getElementById("menu-button");
  const taskList = document.getElementById("task-list");
  const tasksContainer = document.querySelector(".tasks");

  const modal = document.getElementById("myModal");
  const filterModal = document.getElementById("filterModal");
  const settingsModal = document.getElementById("settingsModal");
  const accModal = document.getElementById("accModal");

  const darkModeToggle = document.getElementById("darkModeToggle");
  const borderColorPicker = document.getElementById("borderColorPicker");
  const searchBar = document.getElementById("search-bar");
  const signInOpenBtn = document.getElementById("signInButton");
  const newTaskBtn = document.getElementById("myBtn");

  const LOCAL_KEY = "tasks";
  const val = sel => document.querySelector(sel)?.value || "";

  // ======================
  // Helpers
  // ======================
  const saveLocal = () => localStorage.setItem(LOCAL_KEY, JSON.stringify(allTasks));

  const makeLocalId = () => `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const normalizeTask = task => ({
    id: task.id || makeLocalId(),
    userId: task.userId || (currentUser ? currentUser.id : ""),
    name: task.name || "",
    dueDate: task.dueDate || "",
    priority: task.priority || "",
    category: task.category || "",
    status: task.status || "",
    description: task.description || ""
  });

  const escapeHtml = str => String(str || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

  // ======================
  // UI Rendering
  // ======================
  const createTaskCard = task => {
    const card = document.createElement("div");
    card.className = "task-card";
    card.dataset.id = task.id;
    card.innerHTML = `
      <div class="task-title">${escapeHtml(task.name) || "Untitled Task"}</div>
      <div class="task-details ${document.body.classList.contains("grid-mode") ? "open" : ""}">
        <p><strong>Due:</strong> ${escapeHtml(task.dueDate) || "No date"}</p>
        <p><strong>Priority:</strong> ${escapeHtml(task.priority) || "None"}</p>
        <p><strong>Category:</strong> ${escapeHtml(task.category) || "None"}</p>
        <p><strong>Status:</strong> ${escapeHtml(task.status) || "None"}</p>
        <p><strong>Description:</strong> ${escapeHtml(task.description) || ""}</p>
        <div class="card-actions">
          <button class="edit-button">Edit</button>
          <button class="delete-button">Delete</button>
        </div>
      </div>
    `;
    return card;
  };

  const renderTasks = (tasks = allTasks) => {
    taskList.innerHTML = "";
    tasks.forEach(t => taskList.appendChild(createTaskCard(t)));
    applyBorderColor(localStorage.getItem("borderColor") || "#ccc");
  };

  const openModal = m => m && (m.style.display = "block");
  const closeModal = m => m && (m.style.display = "none");

  const populateForm = (task = {}) => {
    document.querySelector(".task-name").value = task.name || "";
    document.querySelector(".task-due-date").value = task.dueDate || "";
    document.querySelector(".task-priority").value = task.priority || "";
    document.querySelector(".category").value = task.category || "";
    document.querySelector(".status").value = task.status || "";
    document.querySelector(".description").value = task.description || "";
  };

  // ======================
  // API Wrappers with JWT
  // ======================
  async function apiGetAll() {
    if (!currentUser) return [];
    try {
      const res = await fetch("http://localhost:3000/api/tasks", {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      return res.ok ? (await res.json()).map(normalizeTask) : [];
    } catch {
      return [];
    }
  }

  async function apiSubmitTask(task, isEdit = false) {
    const url = isEdit ? `http://localhost:3000/api/tasks/${task.id}` : "http://localhost:3000/api/tasks";
    const method = isEdit ? "PUT" : "POST";
    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify(task)
      });
    } catch {}
  }

  async function apiDelete(id) {
    try {
      await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
    } catch {}
  }

  // ======================
  // Core Logic
  // ======================
  async function handleTaskSubmit() {
    if (!currentUser) return alert("Please sign in first!");

    const payload = {
      name: val(".task-name"),
      dueDate: val(".task-due-date"),
      priority: val(".task-priority"),
      category: val(".category"),
      status: val(".status"),
      description: val(".description")
    };

    const taskData = normalizeTask(taskBeingEdited ? { ...taskBeingEdited, ...payload } : payload);

    if (taskBeingEdited) {
      allTasks = allTasks.map(t => t.id === taskData.id ? taskData : t);
      await apiSubmitTask(taskData, true);
    } else {
      allTasks.push(taskData);
      await apiSubmitTask(taskData);
    }

    saveLocal();
    renderTasks();
    closeModal(modal);
    taskBeingEdited = null;
  }
   function applyBorderColor(color) {
    if (!color) return;
    document.querySelectorAll(
      "button, input, select, textarea, .modal-content, .filter-modal-content, .acc-modal-content, .settings-modal-content, .sidebar, .switch, .slider, hr, .task-card, .light-mode .modal-content, .light-mode .filter-modal-content, .light-mode .settings-modal-content, .light-mode .acc-modal-content, .task-name .light-input, light-input"
    ).forEach(el => el.style.borderColor = color);
    document.querySelectorAll(".switch .slider").forEach(s => s.style.backgroundColor = color);
    localStorage.setItem("borderColor", color);
  }

  // ======================
  // 2. Filters
  // ======================
  function applyFilters() {
    const checked = [...document.querySelectorAll(".filter-option:checked")].map(cb => cb.value);
    const sortBy = document.getElementById("sort-select")?.value;

    const priorities = ["High", "Medium", "Low"];
    const statuses = ["Open", "In progress", "Done"];
    const categories = ["Work", "House work", "School work", "Shopping", "Hobbies", "Other"];
    
    let filtered = allTasks.filter(t => {

      const pMatch = checked.some(c => priorities.includes(c)) ? checked.includes(t.priority) : true;
      const sMatch = checked.some(c => statuses.includes(c)) ? checked.includes(t.status) : true;
      const cMatch = checked.some(c => categories.includes(c)) ? checked.includes(t.category) : true;

      return pMatch && sMatch && cMatch;
    });

    if (sortBy === "due-date-asc") filtered.sort((a,b) => (a.dueDate||"").localeCompare(b.dueDate||""));
    if (sortBy === "due-date-desc") filtered.sort((a,b) => (b.dueDate||"").localeCompare(a.dueDate||""));
    if (sortBy === "priority-desc") {
      const weight = { High: 3, Medium: 2, Low: 1 };
      filtered.sort((a,b) => (weight[b.priority] || 0) - (weight[a.priority] || 0));
    }

    renderTasks(filtered);
  }
  
  // ======================
  // Reset Filters Logic
  // ======================
  function resetFilters() {
    document.querySelectorAll(".filter-option").forEach(cb => cb.checked = false);

    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) sortSelect.selectedIndex = 0;

    if (searchBar) searchBar.value = "";

    renderTasks(allTasks);

    closeModal(filterModal);
  }

  // ======================
  // Event Listeners
  // ======================
  taskList.onclick = async e => {
    const card = e.target.closest(".task-card");
    if (!card) return;
    const id = card.dataset.id;
    const task = allTasks.find(t => t.id === id);

    if (e.target.matches(".edit-button")) {
      taskBeingEdited = task;
      populateForm(task);
      openModal(modal);
    } else if (e.target.matches(".delete-button")) {
      if (confirm(`Delete "${task.name}"?`)) {
        allTasks = allTasks.filter(t => t.id !== id);
        renderTasks();
        saveLocal();
        await apiDelete(id);
      }
    } else if (e.target.matches(".task-title")) {
      card.querySelector(".task-details").classList.toggle("open");
    }
  };

  document.querySelector(".submit-button").onclick = handleTaskSubmit;

  // ======================
  // Sign in / JWT handling
  // ======================
  signInOpenBtn.onclick = () => openModal(accModal);

  document.getElementById("signIn").onclick = async () => {
    const username = val(".username").trim();
    const password = val(".password").trim();
    if (!username || !password) return alert("Missing credentials");

    try {
      const res = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.error) return alert(data.error);

      currentUser = { id: data.id, username: data.username, token: data.token };
      localStorage.setItem("user", JSON.stringify(currentUser));

      signInOpenBtn.innerHTML = `<img src="Icons/user.png" class="user-icon">${data.username}`;
      closeModal(accModal);

      allTasks = await apiGetAll();
      renderTasks();
      initUserUI();
    } catch { alert("Login failed"); }
  };

  // ======================
  // Logout Button
  // ======================
  const logoutBtn = document.createElement("button");
  logoutBtn.id = "logoutButton";
  logoutBtn.className = "logout-button";
  logoutBtn.textContent = "Logout";
  logoutBtn.style.display = currentUser ? "inline-flex" : "none";
  logoutBtn.style.marginLeft = "0px";

  signInOpenBtn.parentNode.appendChild(logoutBtn);

  logoutBtn.onclick = () => {
    localStorage.removeItem("user");
    currentUser = null;

    signInOpenBtn.innerHTML = `<img src="Icons/user.png" class="user-icon"> Sign In`;
    logoutBtn.style.display = "none";

    allTasks = [];
    taskList.innerHTML = "";
    localStorage.removeItem("tasks");
    initUserUI();
  };

  // ======================
  // Other UI
  // ======================
  darkModeToggle?.addEventListener("change", () => toggleDarkMode(darkModeToggle.checked));
  borderColorPicker?.addEventListener("input", e => applyBorderColor(e.target.value));
  searchBar?.addEventListener("input", () => {
    const term = searchBar.value.toLowerCase();
    renderTasks(allTasks.filter(t => Object.values(t).some(v => String(v).toLowerCase().includes(term))));
  });

  document.getElementById("view-type-button").onclick = () => {
    const isGrid = tasksContainer.classList.toggle("grid-view");
    document.body.classList.toggle("grid-mode", isGrid);
    document.querySelectorAll(".task-details").forEach(d => d.classList.toggle("open", isGrid));
  };

  // ======================
  // Nav Handlers
  // ======================
  window.openNav = () => { 
    sidebar.style.width = "250px"; 
    menuBtn.style.display = "none"; 
    main.style.marginLeft = window.innerWidth < 750 ? "0" : "250px"; 
  };
  window.closeNav = () => { 
    sidebar.style.width = "0"; 
    menuBtn.style.display = "initial"; 
    main.style.marginLeft = "0"; 
  };

  // ======================
  // Generic Closers
  // ======================
  newTaskBtn.onclick = () => { 
    if (!currentUser) { alert("Please sign in first to create a task!"); return; }
    taskBeingEdited = null; 
    populateForm(); 
    openModal(modal); 
  };

  document.querySelector(".close-task-module").onclick = () => closeModal(modal);
  document.getElementById("filter-button").onclick = () => openModal(filterModal);
  document.querySelector(".filter-close").onclick = () => closeModal(filterModal);
  document.getElementById("apply-filters-button").onclick = () => { applyFilters(); closeModal(filterModal); };
  document.querySelector(".settings-button").onclick = () => openModal(settingsModal);
  document.querySelector(".close-settings").onclick = () => closeModal(settingsModal);
  document.getElementById("closeAccModal").onclick = () => closeModal(accModal);
  document.getElementById("cancel").onclick = () => closeModal(accModal);
  window.onclick = e => [modal, filterModal, settingsModal, accModal].forEach(m => { if(e.target === m) closeModal(m); });
  document.getElementById("reset-filters").onclick = resetFilters;
  // ======================
  // Init
  // ======================
  function initUserUI() {
    if (currentUser) {
      signInOpenBtn.innerHTML = `<img src="Icons/user.png" class="user-icon">${currentUser.username}`;
      logoutBtn.style.display = "inline-flex";
      if (newTaskBtn) { newTaskBtn.disabled = false; newTaskBtn.title = ""; }
    } else {
      logoutBtn.style.display = "none";
      if (newTaskBtn) { newTaskBtn.disabled = true; newTaskBtn.title = "Sign in to create tasks"; }
    }
  }

  async function init() {
    initUserUI();
    const savedColor = localStorage.getItem("borderColor");
    if (savedColor) {
      applyBorderColor(savedColor);
      if (borderColorPicker) borderColorPicker.value = savedColor;
    }
    
    allTasks = await apiGetAll();
    renderTasks();
  }

  init();
})();