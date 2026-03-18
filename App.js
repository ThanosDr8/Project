// ======================
// Dark mode helper
// ======================
function toggleDarkMode(isLight) {
  const body = document.body;
  body.classList.toggle("light-mode", isLight);

  // Toggle Modal Backgrounds
  const modals = ["myModal", "filterModal", "settingsModal", "accModal"];
  const modalContents = ["new-task-modal-content", "filter-modal-content", "settings-modal-content", "accModalContent"];

  modals.forEach(id => document.getElementById(id)?.classList.toggle("light-modal-bg", isLight));
  modalContents.forEach(id => document.getElementById(id)?.classList.toggle("light-modal-content", isLight));

  // Loop through all interactive elements to apply specific light-mode styles
  document.querySelectorAll("input, textarea, select, button").forEach(el => {
    const isSearchBar = el.id === "search-bar";
    const isNewTaskBtn = el.classList.contains("newtask");
    
    // Check for the specific buttons that should NOT be forced to white bg
    const isSpecificControlBtn = 
      el.classList.contains("menu-button") || 
      el.classList.contains("close-button") || 
      el.classList.contains("settings-button") || 
      el.classList.contains("filter-button") || 
      el.classList.contains("view-type-button") ||
      el.classList.contains("sign-in-button") ||
      el.classList.contains("submit-button") ||
      el.classList.contains("sign-in");

    // Only apply the white-bg/dark-border class if it's a standard modal input
    if (!isSearchBar && !isNewTaskBtn && !isSpecificControlBtn) {
      el.classList.toggle("light-input", isLight);
    }
  });
}

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

  const LOCAL_KEY = "tasks";
  const val = sel => document.querySelector(sel)?.value || "";

  // ======================
  // Helpers
  // ======================
  const saveLocal = () => localStorage.setItem(LOCAL_KEY, JSON.stringify(allTasks));
  const loadLocal = () => {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; }
    catch { return []; }
  };

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

  const escapeHtml = str => String(str || "").replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);

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
    applyBorderColor(localStorage.getItem("borderColor") || "#ccc"); // Re-apply color to new cards
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
  // API Wrappers
  // ======================
  async function apiGetAll(userId) {
    if (!userId) return loadLocal();
    try {
      const res = await fetch(`http://localhost:3000/api/tasks?userId=${userId}`);
      return res.ok ? (await res.json()).map(normalizeTask) : loadLocal();
    } catch { return loadLocal(); }
  }

  async function apiDelete(id) {
    try {
      await fetch(`http://localhost:3000/api/tasks/${id}`, { method: "DELETE" });
    } catch (e) { console.warn("Offline: Delete saved locally"); }
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

    if (taskBeingEdited) {
      const merged = normalizeTask({ ...taskBeingEdited, ...payload });
      allTasks = allTasks.map(t => String(t.id) === String(merged.id) ? merged : t);
      await fetch(`http://localhost:3000/api/tasks/${merged.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged)
      }).catch(() => {});
    } else {
      const newTask = normalizeTask(payload);
      allTasks.push(newTask);
      await fetch("http://localhost:3000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
      }).catch(() => {});
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

  function applyFilters() {
    const checked = [...document.querySelectorAll(".filter-option:checked")].map(cb => cb.value);
    const sortBy = document.getElementById("sort-select")?.value;

    const priorities = ["High", "Medium", "Low"];
    const statuses = ["Open", "In progress", "Done"];
    
    let filtered = allTasks.filter(t => {
      const pMatch = checked.some(c => priorities.includes(c)) ? checked.includes(t.priority) : true;
      const sMatch = checked.some(c => statuses.includes(c)) ? checked.includes(t.status) : true;
      return pMatch && sMatch;
    });

    if (sortBy === "due-date-asc") filtered.sort((a,b) => (a.dueDate||"").localeCompare(b.dueDate||""));
    if (sortBy === "priority-desc") {
      const weight = { High: 3, Medium: 2, Low: 1 };
      filtered.sort((a,b) => weight[b.priority] - weight[a.priority]);
    }

    renderTasks(filtered);
  }

  // ======================
  // Event Listeners
  // ======================
  taskList.onclick = async e => {
    const card = e.target.closest(".task-card");
    if (!card) return;
    const id = card.dataset.id;
    const task = allTasks.find(t => String(t.id) === id);

    if (e.target.matches(".edit-button")) {
      taskBeingEdited = task;
      populateForm(task);
      openModal(modal);
    } else if (e.target.matches(".delete-button")) {
      if (confirm(`Delete "${task.name}"?`)) {
        allTasks = allTasks.filter(t => String(t.id) !== id);
        renderTasks();
        saveLocal();
        apiDelete(id);
      }
    } else if (e.target.matches(".task-title")) {
      card.querySelector(".task-details").classList.toggle("open");
    }
  };

  document.querySelector(".submit-button").onclick = handleTaskSubmit;
  
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
      currentUser = await res.json();
      localStorage.setItem("user", JSON.stringify(currentUser));
      initUserUI();
      closeModal(accModal);
    } catch { alert("Login failed"); }
  };

  darkModeToggle?.addEventListener("change", () => toggleDarkMode(darkModeToggle.checked));
  borderColorPicker?.addEventListener("input", e => applyBorderColor(e.target.value));
  
  searchBar?.addEventListener("input", () => {
    const term = searchBar.value.toLowerCase();
    renderTasks(allTasks.filter(t => 
      Object.values(t).some(v => String(v).toLowerCase().includes(term))
    ));
  });

  document.getElementById("view-type-button").onclick = () => {
    const isGrid = tasksContainer.classList.toggle("grid-view");
    document.body.classList.toggle("grid-mode", isGrid);
    document.querySelectorAll(".task-details").forEach(d => d.classList.toggle("open", isGrid));
  };

  // Nav Handlers
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

  // Generic Closers
  document.getElementById("myBtn").onclick = () => { taskBeingEdited = null; populateForm(); openModal(modal); };
  document.querySelector(".close-task-module").onclick = () => closeModal(modal);
  document.getElementById("filter-button").onclick = () => openModal(filterModal);
  document.querySelector(".filter-close").onclick = () => closeModal(filterModal);
  document.getElementById("apply-filters-button").onclick = () => { applyFilters(); closeModal(filterModal); };
  document.querySelector(".settings-button").onclick = () => openModal(settingsModal);
  document.querySelector(".close-settings").onclick = () => closeModal(settingsModal);
  signInOpenBtn.onclick = () => openModal(accModal);
  document.getElementById("closeAccModal").onclick = () => closeModal(accModal);
  document.getElementById("cancel").onclick = () => closeModal(accModal);

  window.onclick = e => [modal, filterModal, settingsModal, accModal].forEach(m => { if(e.target === m) closeModal(m); });

  // ======================
  // Init
  // ======================
  function initUserUI() {
    if (currentUser) {
      signInOpenBtn.innerHTML = `<img src="Icons/user.png" class="user-icon">${currentUser.username}`;
    }
  }

  async function init() {
    initUserUI();
    const savedColor = localStorage.getItem("borderColor");
    if (savedColor) {
      applyBorderColor(savedColor);
      if (borderColorPicker) borderColorPicker.value = savedColor;
    }
    
    allTasks = await apiGetAll(currentUser?.id);
    renderTasks();
  }

  init();
})();