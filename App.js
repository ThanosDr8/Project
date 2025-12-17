// ======================
// Dark mode helper
// ======================
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle("light-mode");

  // Toggle modal light classes
  const modals = [
    document.getElementById("myModal"),
    document.getElementById("filterModal"),
    document.getElementById("settingsModal")
  ];
  const modalContents = [
    document.getElementById("new-task-modal-content"),
    document.getElementById("filter-modal-content"),
    document.getElementById("settings-modal-content")
  ];

  modals.forEach(m => m?.classList.toggle("light-modal-bg"));
  modalContents.forEach(c => c?.classList.toggle("light-modal-content"));

  // Toggle inputs and textareas
  document.querySelectorAll("input, textarea, select, button").forEach(el => {
    el.classList.toggle("light-input");
  });
}

(() => {
  "use strict";

  // ======================
  // State
  // ======================
  let allTasks = [];
  let taskBeingEdited = null;

  // ======================
  // Elements
  // ======================
  const sidebar       = document.getElementById("mySidebar");
  const main          = document.getElementById("main");
  const menuBtn       = document.getElementById("menu-button");
  const taskList      = document.getElementById("task-list");

  const modal         = document.getElementById("myModal");
  const modalOpenBtn  = document.getElementById("myBtn");
  const modalCloseBtn = modal.querySelector(".close-task-module");

  const filterModal       = document.getElementById("filterModal");
  const filterOpenBtn     = document.getElementById("filter-button");
  const filterCloseBtn    = filterModal.querySelector(".filter-close");
  const applyFiltersBtn   = document.getElementById("apply-filters-button");

  const settingsModal     = document.getElementById("settingsModal");
  const settingsButton    = document.querySelector(".settings-button");
  const closeSettings     = settingsModal.querySelector(".close-settings");

  const darkModeToggle    = document.getElementById("darkModeToggle");
  const borderColorPicker = document.getElementById("borderColorPicker");
  const searchBar         = document.getElementById("search-bar");

  const LOCAL_KEY = "tasks";
  const val = sel => document.querySelector(sel)?.value || "";

  // ======================
  // Local Storage Helpers
  // ======================
  const saveLocal = () => localStorage.setItem(LOCAL_KEY, JSON.stringify(allTasks));
  const loadLocal = () => {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; }
    catch { return []; }
  };

  // ======================
  // Task Helpers
  // ======================
  const makeLocalId = () => `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const normalizeTask = task => {
    if (!task) return null;
    if (!task.id) task.id = makeLocalId();
    return {
      id: task.id,
      name: task.name || "",
      dueDate: task.dueDate || "",
      priority: task.priority || "",
      category: task.category || "",
      status: task.status || "",
      description: task.description || ""
    };
  };

  const escapeHtml = str => String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const createTaskCard = task => {
    const card = document.createElement("div");
    card.className = "task-card";
    card.dataset.id = task.id;
    card.innerHTML = `
      <div class="task-title">${escapeHtml(task.name) || "Untitled Task"}</div>
      <div class="task-details">
        <p><strong>Due:</strong> ${escapeHtml(task.dueDate) || "No date"}</p>
        <p><strong>Priority:</strong> ${escapeHtml(task.priority) || "None"}</p>
        <p><strong>Category:</strong> ${escapeHtml(task.category) || "None"}</p>
        <p><strong>Status:</strong> ${escapeHtml(task.status) || "None"}</p>
        <p><strong>Description:</strong> ${escapeHtml(task.description) || ""}</p>
        <button class="edit-button">Edit</button>
        <button class="delete-button">Delete</button>
      </div>
    `;
    return card;
  };

  const renderTasks = tasks => {
    taskList.innerHTML = "";
    (tasks || allTasks).forEach(t => taskList.appendChild(createTaskCard(t)));
  };

  // ======================
  // Modal Helpers
  // ======================
  const openModal = m => m && (m.style.display = "block");
  const closeModal = m => m && (m.style.display = "none");

  // ======================
  // API Wrappers
  // ======================
  async function apiGetAll() {
    try {
      const res = await fetch("http://localhost:3000/api/tasks");
      if (!res.ok) throw new Error();
      const data = await res.json();
      return Array.isArray(data) ? data.map(normalizeTask) : [];
    } catch {
      return loadLocal().map(normalizeTask);
    }
  }

  async function apiCreate(task) {
    try {
      const res = await fetch("http://localhost:3000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
      });
      if (!res.ok) throw new Error();
      return normalizeTask(await res.json());
    } catch {
      return normalizeTask({ ...task, id: makeLocalId() });
    }
  }

  async function apiUpdate(task) {
    try {
      if (!task.id) throw new Error();
      const res = await fetch(`http://localhost:3000/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
      });
      if (!res.ok) throw new Error();
      return normalizeTask(await res.json());
    } catch {
      return normalizeTask(task);
    }
  }

  async function apiDelete(id) {
    try {
      if (!id) throw new Error();
      const res = await fetch(`http://localhost:3000/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      return true;
    } catch {
      return false;
    }
  }

  // ======================
  // Form Helpers
  // ======================
  function populateForm(task) {
    document.querySelector(".task-name").value = task.name || "";
    document.querySelector(".task-due-date").value = task.dueDate || "";
    document.querySelector(".task-priority").value = task.priority || "";
    document.querySelector(".category").value = task.category || "";
    document.querySelector(".status").value = task.status || "";
    document.querySelector(".description").value = task.description || "";
  }

  function clearForm() {
    document.querySelector(".task-name").value = "";
    document.querySelector(".task-due-date").value = "";
    document.querySelector(".task-priority").value = "";
    document.querySelector(".category").value = "";
    document.querySelector(".status").value = "";
    document.querySelector(".description").value = "";
  }

  // ======================
  // Event Handling
  // ======================
  taskList.addEventListener("click", async e => {
    const card = e.target.closest(".task-card");
    if (!card) return;
    const id = card.dataset.id;
    const idx = allTasks.findIndex(t => String(t.id) === id);

    if (e.target.matches(".edit-button")) {
      taskBeingEdited = { ...allTasks[idx] };
      populateForm(taskBeingEdited);
      openModal(modal);
      return;
    }

    if (e.target.matches(".delete-button")) {
      if (!confirm(`Delete "${allTasks[idx].name}"?`)) return;
      const removed = allTasks.splice(idx, 1)[0];
      renderTasks();
      saveLocal();
      await apiDelete(removed.id);
      return;
    }

    if (e.target.matches(".task-title")) {
      card.querySelector(".task-details")?.classList.toggle("open");
    }
  });

  // Task Submission
  document.querySelector(".submit-button").onclick = async () => {
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
      const idx = allTasks.findIndex(t => String(t.id) === merged.id);
      if (idx !== -1) allTasks[idx] = merged;
      renderTasks();
      saveLocal();
      await apiUpdate(merged);
      taskBeingEdited = null;
      closeModal(modal);
      return;
    }

    const optimistic = normalizeTask({ ...payload, id: makeLocalId() });
    allTasks.push(optimistic);
    renderTasks();
    saveLocal();
    closeModal(modal);
    clearForm();

    const created = await apiCreate(payload);
    const idx = allTasks.findIndex(t => t.id === optimistic.id);
    if (idx !== -1) allTasks[idx] = created;
    saveLocal();
    renderTasks();
  };

  // Filters
  function applyFilters() {
    const checked = [...document.querySelectorAll(".filter-option:checked")].map(cb => cb.value);
    const sortBy  = document.getElementById("sort-select")?.value || "";

    const priority = ["High","Medium","Low"];
    const status   = ["Open","In progress","Done"];
    const category = ["Work","House work","School work","Shopping","Hobbies","Other"];

    const pF = checked.filter(x => priority.includes(x));
    const sF = checked.filter(x => status.includes(x));
    const cF = checked.filter(x => category.includes(x));

    let filtered = allTasks.filter(t =>
      (pF.length===0 || pF.includes(t.priority)) &&
      (sF.length===0 || sF.includes(t.status)) &&
      (cF.length===0 || cF.includes(t.category))
    );

    if (sortBy === "due-date-asc") filtered.sort((a,b)=> (a.dueDate||"").localeCompare(b.dueDate||""));
    if (sortBy === "due-date-desc") filtered.sort((a,b)=> (b.dueDate||"").localeCompare(a.dueDate||""));
    if (sortBy.includes("priority")) {
      const order = { Low:1, Medium:2, High:3 };
      filtered.sort((a,b)=> sortBy==="priority-asc" ? order[a.priority]-order[b.priority] : order[b.priority]-order[a.priority]);
    }

    renderTasks(filtered);
  }

  // ======================
  // UI Bindings
  // ======================
  modalOpenBtn.onclick = () => { taskBeingEdited=null; clearForm(); openModal(modal); };
  modalCloseBtn.onclick = () => { taskBeingEdited=null; closeModal(modal); };

  filterOpenBtn.onclick  = () => openModal(filterModal);
  filterCloseBtn.onclick = () => closeModal(filterModal);
  applyFiltersBtn.onclick = () => { applyFilters(); closeModal(filterModal); };

  // Settings modal
  settingsButton.onclick = () => openModal(settingsModal);
  closeSettings.onclick = () => closeModal(settingsModal);

  // Close modals by clicking outside
  window.addEventListener("click", e => {
    [modal, filterModal, settingsModal].forEach(m => { if (e.target === m) closeModal(m); });
  });

  // Dark mode
  darkModeToggle?.addEventListener("change", () => {
    document.body.classList.toggle("light-mode", darkModeToggle.checked);
  });

  // Border color picker with persistent storage
  function applyBorderColor(color) {
    document.querySelectorAll(
      "button, input, select, textarea, .task-card, .modal-content, .filter-modal-content, .settings-modal-content, .sidebar, .switch .slider"
    ).forEach(el => {
      el.style.borderColor = color;
    });

    document.querySelectorAll(".switch .slider").forEach(slider => {
      slider.style.backgroundColor = color;
    });

    if (borderColorPicker) borderColorPicker.value = color;
  }

  const savedColor = localStorage.getItem("borderColor");
  if (savedColor) applyBorderColor(savedColor);

  borderColorPicker?.addEventListener("input", e => {
    const color = e.target.value;
    applyBorderColor(color);
    localStorage.setItem("borderColor", color);
  });

  // Search
  searchBar?.addEventListener("input", () => {
    const term = searchBar.value.trim().toLowerCase();
    renderTasks(term ? allTasks.filter(t =>
      [t.name, t.description, t.priority, t.status, t.category].some(f => (f||"").toLowerCase().includes(term))
    ) : allTasks);
  });

  // Sidebar
  window.openNav = () => { sidebar.style.width="250px"; menuBtn.style.display="none"; main.style.marginLeft=window.innerWidth<735?"0px":"250px"; };
  window.closeNav = () => { sidebar.style.width="0"; menuBtn.style.display="initial"; main.style.marginLeft="0"; };

  // ======================
  // Initialization
  // ======================
  async function init() {
    allTasks = (await apiGetAll()).map(normalizeTask);
    saveLocal();
    renderTasks();
  }
  init();

})();