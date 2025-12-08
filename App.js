/* ===============================
   TASK MANAGER — COMPLETE REBUILD
   =============================== */

let allTasks = [];
let taskBeingEdited = null;

/* ================
   ELEMENTS
   ================ */
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

/* ================
   SAFE VALUE GETTER
   ================ */
const val = sel => document.querySelector(sel)?.value || "";

/* ================
   SIDEBAR
   ================ */
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

/* ================
   MODALS
   ================ */
const openModal  = m => m.style.display = "block";
const closeModal = m => m.style.display = "none";

/* ================
   DARK MODE
   ================ */
function toggleDarkMode() {
  const toggle = (sel, cls) =>
    document.querySelectorAll(sel).forEach(el => el.classList.toggle(cls));

  toggle("#main", "light-mode");
  toggle("#myModal", "light-modal-bg");
  toggle("#filterModal", "light-filter-bg");
  toggle("#new-task-modal-content", "light-modal-content");
  toggle("#filter-modal-content", "light-filter-content");
  toggle(".task-due-date, .task-priority, .description, .category, .status, .task-name", "light-input");
}

/* ============================================================
   RENDER TASK CARD + ATTACH EDIT/DELETE EVENTS TO THAT CARD
   ============================================================ */
function renderTask(task) {
  const card = document.createElement("div");
  card.className = "task-card";

  card.innerHTML = `
    <div class="task-title">${task.name || "Untitled Task"}</div>

    <div class="task-details">
      <p><strong>Due:</strong> ${task.dueDate || "No date"}</p>
      <p><strong>Priority:</strong> ${task.priority || "None"}</p>
      <p><strong>Category:</strong> ${task.category || "None"}</p>
      <p><strong>Status:</strong> ${task.status || "None"}</p>
      <p><strong>Description:</strong> ${task.description || ""}</p>

      <button class="edit-button">Edit</button>
      <button class="delete-button">Delete</button>
    </div>
  `;

  const title   = card.querySelector(".task-title");
  const details = card.querySelector(".task-details");

  // Expand on click
  title.onclick = () => details.classList.toggle("open");

  // Attach edit/delete events
  attachCardEvents(card, task);

  taskList.appendChild(card);
}

/* ==================================
   EVENT ATTACHER FOR EACH TASK CARD
   ================================== */
function attachCardEvents(card, task) {
  // DELETE
  card.querySelector(".delete-button").onclick = async () => {
    if (!confirm(`Delete "${task.name}"?`)) return;

    try {
      if (task.id) {
        await fetch(`http://localhost:3000/api/tasks/${task.id}`, { method: "DELETE" });
      }
    } catch {
      console.warn("Server offline — deleting local only.");
    }

    card.remove();
    allTasks = allTasks.filter(t => t.id !== task.id);
    saveLocal();
  };

  // EDIT
  card.querySelector(".edit-button").onclick = () => {
    taskBeingEdited = task;

    document.querySelector(".task-name").value        = task.name || "";
    document.querySelector(".task-due-date").value    = task.dueDate || "";
    document.querySelector(".task-priority").value    = task.priority || "low";
    document.querySelector(".category").value         = task.category || "";
    document.querySelector(".status").value           = task.status || "";
    document.querySelector(".description").value      = task.description || "";

    openModal(modal);
  };
}

/* ==================================
   RETRIEVE TASKS (API → FALLBACK)
   ================================== */
async function loadTasks() {
  try {
    const res = await fetch("http://localhost:3000/api/tasks");
    allTasks = await res.json();
  } catch {
    console.warn("Server offline — loading localStorage.");
    allTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  }

  taskList.innerHTML = "";
  allTasks.forEach(renderTask);
}

/* ==================================
   SAVE LOCAL STORAGE FALLBACK
   ================================== */
function saveLocal() {
  localStorage.setItem("tasks", JSON.stringify(allTasks));
}

/* ==================================
   CREATE / EDIT SUBMIT BUTTON
   ================================== */
document.querySelector(".submit-button").onclick = async () => {
  const newTask = {
    name: val(".task-name"),
    dueDate: val(".task-due-date"),
    priority: val(".task-priority"),
    category: val(".category"),
    status: val(".status"),
    description: val(".description")
  };

  // EDIT MODE
  if (taskBeingEdited) {
    Object.assign(taskBeingEdited, newTask);

    try {
      await fetch(`http://localhost:3000/api/tasks/${taskBeingEdited.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskBeingEdited)
      });
    } catch {
      console.warn("Server offline — saving local only.");
    }

    saveLocal();
    loadTasks();     // Re-render everything cleanly
    taskBeingEdited = null;
    closeModal(modal);
    return;
  }

  // NEW TASK
  let savedTask = null;

  try {
    const res = await fetch("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask)
    });
    savedTask = await res.json();
  } catch {
    console.warn("Server offline — using local ID.");
    savedTask = { ...newTask, id: Date.now() };
  }

  allTasks.push(savedTask);
  saveLocal();

  renderTask(savedTask);
  closeModal(modal);
};

/* ==================================
   FILTERING + SORTING
   ================================== */
function applyFilters() {
  const checked = [...document.querySelectorAll(".filter-option:checked")].map(cb => cb.value);
  const sortBy  = document.getElementById("sort-select")?.value || "";

  const p = ["high", "medium", "low"];
  const s = ["pending", "open", "in-progress", "done"];
  const c = ["work", "house-work", "school-work", "shopping", "hobbies", "other"];

  const pF = checked.filter(x => p.includes(x));
  const sF = checked.filter(x => s.includes(x));
  const cF = checked.filter(x => c.includes(x));

  taskList.innerHTML = "";

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
      sortBy === "priority-asc" ? order[a.priority] - order[b.priority] :
                                  order[b.priority] - order[a.priority]
    );
  }

  filtered.forEach(renderTask);
}

/* ================
   EVENT BINDING
   ================ */
modalOpenBtn.onclick = () => openModal(modal);
modalCloseBtn.onclick = () => closeModal(modal);

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

/* ================
   INITIAL LOAD
   ================ */
loadTasks();