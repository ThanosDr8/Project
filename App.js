(() => {
  "use strict";

  // ===========
  // State
  // ===========
  let allTasks = [];
  let taskBeingEdited = null;

  // ===========
  // Elements
  // ===========
  const sidebar        = document.getElementById("mySidebar");
  const main           = document.getElementById("main");
  const menuBtn        = document.getElementById("menu-button");
  const taskList       = document.getElementById("task-list");

  const modal          = document.getElementById("myModal");
  const modalOpenBtn   = document.getElementById("myBtn");
  const modalCloseBtn  = document.querySelector(".close-task-module");

  const filterModal        = document.getElementById("filterModal");
  const filterOpenBtn      = document.getElementById("filter-button");
  const filterCloseBtn     = document.getElementById("close-filter");
  const applyFiltersBtn    = document.getElementById("apply-filters-button");

  // Safe getter
  const val = sel => document.querySelector(sel)?.value || "";

  // ===========
  // Helpers
  // ===========
  const LOCAL_KEY = "tasks";

  function saveLocal() {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(allTasks));
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn("Failed to parse localStorage tasks:", err);
      return [];
    }
  }

  // Generates a local id if server doesn't return one
  function makeLocalId() {
    return `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  // Merge incoming task (ensures id exists)
  function normalizeTask(task) {
    if (!task) return null;
    if (!task.id) task.id = makeLocalId();
    // ensure fields exist so UI doesn't show "undefined"
    return {
      id: task.id,
      name: task.name || "",
      dueDate: task.dueDate || "",
      priority: task.priority || "low",
      category: task.category || "",
      status: task.status || "pending",
      description: task.description || ""
    };
  }

  // ===========
  // API wrappers (graceful)
  // ===========
  async function apiGetAll() {
    try {
      const r = await fetch("http://localhost:3000/api/tasks");
      if (!r.ok) throw new Error("non-200");
      const data = await r.json();
      return Array.isArray(data) ? data.map(normalizeTask) : [];
    } catch (err) {
      console.warn("Server offline or API error in GET — using localStorage.", err);
      return loadLocal().map(normalizeTask);
    }
  }

  async function apiCreate(task) {
    try {
      const r = await fetch("http://localhost:3000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
      });
      if (!r.ok) throw new Error("non-200");
      const saved = await r.json();
      return normalizeTask(saved);
    } catch (err) {
      console.warn("Server offline — creating local task.", err);
      return normalizeTask({ ...task, id: makeLocalId() });
    }
  }

  async function apiUpdate(task) {
    try {
      if (!task.id) throw new Error("missing-id");
      const r = await fetch(`http://localhost:3000/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
      });
      if (!r.ok) throw new Error("non-200");
      const saved = await r.json();
      return normalizeTask(saved);
    } catch (err) {
      console.warn("Server offline or API error in PUT — saving local only.", err);
      return normalizeTask(task); // keep local changes
    }
  }

  async function apiDelete(id) {
    try {
      if (!id) throw new Error("missing id");
      const r = await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: "DELETE"
      });
      if (!r.ok) throw new Error("non-200");
      return true;
    } catch (err) {
      console.warn("Server offline or API error in DELETE — removing local only.", err);
      return false;
    }
  }

  // ===========
  // Rendering
  // ===========
  function createTaskCard(task) {
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
  }

  function renderTasks(tasks = allTasks) {
    taskList.innerHTML = "";
    tasks.forEach(t => taskList.appendChild(createTaskCard(t)));
  }

  // very small HTML-escape utility
  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ===========
  // Event handling (delegation)
  // ===========
  taskList.addEventListener("click", async (e) => {
    const card = e.target.closest(".task-card");
    if (!card) return;
    const id = card.dataset.id;
    const taskIndex = allTasks.findIndex(t => String(t.id) === String(id));
    if (e.target.matches(".edit-button")) {
      // EDIT
      if (taskIndex === -1) return console.warn("Task not found for edit:", id);
      taskBeingEdited = { ...allTasks[taskIndex] }; // clone
      populateForm(taskBeingEdited);
      openModal(modal);
      return;
    }

    if (e.target.matches(".delete-button")) {
      // DELETE
      if (taskIndex === -1) return console.warn("Task not found for delete:", id);
      if (!confirm(`Delete "${allTasks[taskIndex].name}"?`)) return;

      // Optimistic UI removal
      const removed = allTasks.splice(taskIndex, 1)[0];
      renderTasks();
      saveLocal();

      // Try to delete on server (if fails, local stays removed)
      await apiDelete(removed.id);
      return;
    }

    // toggle details on title click
    if (e.target.matches(".task-title")) {
      const details = card.querySelector(".task-details");
      if (details) details.classList.toggle("open");
      return;
    }
  });

  // ===========
  // Form / Modal helpers
  // ===========
  function populateForm(task) {
    document.querySelector(".task-name").value        = task.name || "";
    document.querySelector(".task-due-date").value   = task.dueDate || "";
    document.querySelector(".task-priority").value   = task.priority || "low";
    document.querySelector(".category").value        = task.category || "";
    document.querySelector(".status").value          = task.status || "";
    document.querySelector(".description").value     = task.description || "";
  }

  function clearForm() {
    document.querySelector(".task-name").value        = "";
    document.querySelector(".task-due-date").value   = "";
    document.querySelector(".task-priority").value   = "low";
    document.querySelector(".category").value        = "";
    document.querySelector(".status").value          = "";
    document.querySelector(".description").value     = "";
  }

  const openModal = (m) => m.style.display = "block";
  const closeModal = (m) => m.style.display = "none";

  // ===========
  // Submission (create / edit)
  // ===========
  document.querySelector(".submit-button").onclick = async () => {
    const newTaskPayload = {
      name: val(".task-name"),
      dueDate: val(".task-due-date"),
      priority: val(".task-priority"),
      category: val(".category"),
      status: val(".status"),
      description: val(".description")
    };

    // EDIT mode
    if (taskBeingEdited) {
      // merge changes into a copy with the existing id
      const merged = normalizeTask({ ...taskBeingEdited, ...newTaskPayload });
      // update local array
      const idx = allTasks.findIndex(t => String(t.id) === String(merged.id));
      if (idx !== -1) allTasks[idx] = merged;
      else allTasks.push(merged);

      renderTasks();
      saveLocal();

      // Attempt server update but don't block UI
      const saved = await apiUpdate(merged);
      // Ensure the returned task (maybe with server id) is reflected
      const finalIdx = allTasks.findIndex(t => String(t.id) === String(merged.id) || String(t.id) === String(saved.id));
      if (finalIdx !== -1) {
        allTasks[finalIdx] = saved;
        saveLocal();
        renderTasks();
      }

      taskBeingEdited = null;
      closeModal(modal);
      return;
    }

    // NEW task
    // Create UI-optimistically with a local ID, then try to create on server and reconcile.
    const optimistic = normalizeTask({ ...newTaskPayload, id: makeLocalId() });
    allTasks.push(optimistic);
    renderTasks();
    saveLocal();
    closeModal(modal);
    clearForm();

    // Attempt server create
    const created = await apiCreate(newTaskPayload);

    // Replace optimistic task with server task if server returned a different id
    const optimisticIdx = allTasks.findIndex(t => t.id === optimistic.id);
    if (optimisticIdx !== -1) {
      // If server returned another id (server created persistent id), replace
      allTasks[optimisticIdx] = created;
    } else {
      // If optimistic disappeared for any reason, push the confirmed task
      allTasks.push(created);
    }

    saveLocal();
    renderTasks();
  };

  // ===========
  // Filters & sorting (keeps your original logic, but uses renderTasks)
  // ===========
  function applyFilters() {
    const checked = [...document.querySelectorAll(".filter-option:checked")].map(cb => cb.value);
    const sortBy  = document.getElementById("sort-select")?.value || "";

    const p = ["high", "medium", "low"];
    const s = ["pending", "open", "in-progress", "done"];
    const c = ["work", "house-work", "school-work", "shopping", "hobbies", "other"];

    const pF = checked.filter(x => p.includes(x));
    const sF = checked.filter(x => s.includes(x));
    const cF = checked.filter(x => c.includes(x));

    let filtered = allTasks.filter(t =>
      (pF.length === 0 || pF.includes(t.priority)) &&
      (sF.length === 0 || sF.includes(t.status))   &&
      (cF.length === 0 || cF.includes(t.category))
    );

    if (sortBy === "due-date-asc")
      filtered.sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));

    if (sortBy === "due-date-desc")
      filtered.sort((a, b) => (b.dueDate || "").localeCompare(a.dueDate || ""));

    if (sortBy.includes("priority")) {
      const order = { low: 1, medium: 2, high: 3 };
      filtered.sort((a, b) =>
        sortBy === "priority-asc" ? (order[a.priority] || 0) - (order[b.priority] || 0) :
                                    (order[b.priority] || 0) - (order[a.priority] || 0)
      );
    }

    renderTasks(filtered);
  }

  // ===========
  // UI bindings
  // ===========
  modalOpenBtn.onclick = () => {
    taskBeingEdited = null;
    clearForm();
    openModal(modal);
  };
  modalCloseBtn.onclick = () => {
    taskBeingEdited = null;
    closeModal(modal);
  };

  filterOpenBtn.onclick = () => openModal(filterModal);
  filterCloseBtn.onclick = () => closeModal(filterModal);

  applyFiltersBtn.onclick = () => {
    applyFilters();
    closeModal(filterModal);
  };

  window.onclick = e => {
    if (e.target === modal) closeModal(modal);
    if (e.target === filterModal) closeModal(filterModal);
  };

  // Sidebar open/close (keeps your original behavior)
  function openNav() {
    sidebar.style.width = "250px";
    menuBtn.style.display = "none";
    main.style.marginLeft = window.innerWidth < 735 ? "0px" : "250px";
  }

  function closeNav() {
    sidebar.style.width = "0";
    menuBtn.style.display = "initial";
    main.style.marginLeft = "0";
  }

  // Expose for potential binding in HTML
  window.openNav = openNav;
  window.closeNav = closeNav;

  // ===========
  // Initial load
  // ===========
  async function init() {
    // Try API first; fallback to local
    allTasks = await apiGetAll();
    // Ensure normalization and stable ids
    allTasks = (allTasks || []).map(normalizeTask);
    saveLocal(); // make local mirror authoritative right away
    renderTasks();
  }

  // run
  init();

})();