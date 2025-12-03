function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("menu-button").style.display = "none"
  if (window.innerWidth < 735) {
  main.style.marginLeft = "0px";
  }
  else {
  main.style.marginLeft = "250px";
  }
}

function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
  document.getElementById("menu-button").style.display = "initial"
}

// ELEMENTS
const sidebar = document.getElementById("mySidebar");
const main = document.getElementById("main");
const menuBtn = document.getElementById("menu-button");

const modal = document.getElementById("myModal");
const modalClose = document.querySelector(".close-task-module");
const modalOpenBtn = document.getElementById("myBtn");

const filterModal = document.getElementById("filterModal");
const filterOpenBtn = document.getElementById("filter-button");
const filterCloseBtn = document.getElementById("close-filter");

let taskBeingEdited = null;

// SIDEBAR
function openNav() {
  sidebar.style.width = "250px";
  menuBtn.style.display = "none";

  if (window.innerWidth < 735) {
    main.style.marginLeft = "0px";
  } else {
    main.style.marginLeft = "250px";
  }
}

function closeNav() {
  sidebar.style.width = "0";
  main.style.marginLeft = "0";
  menuBtn.style.display = "initial";
}

// MODAL HELPERS
function openModal(m) {
  m.style.display = "block";
}
function closeModal(m) {
  m.style.display = "none";
}

// EVENTS
window.addEventListener("DOMContentLoaded", () => {
  modalOpenBtn.onclick = () => openModal(modal);
  modalClose.onclick = () => closeModal(modal);
  filterOpenBtn.onclick = () => openModal(filterModal);
  filterCloseBtn.onclick = () => closeModal(filterModal);
});

// CLICK OUTSIDE
window.onclick = function (event) {
  if (event.target === modal) closeModal(modal);
  if (event.target === filterModal) closeModal(filterModal);
};

// DARK MODE
function myFunction() {
  function safeToggle(selector, className) {
    document.querySelectorAll(selector).forEach((el) =>
      el.classList.toggle(className)
    );
  }

  safeToggle("#main", "light-mode");
  safeToggle("#myModal", "light-modal-bg");
  safeToggle("#filterModal", "light-filter-bg");
  safeToggle("#new-task-modal-content", "light-modal-content");
  safeToggle("#filter-modal-content", "light-filter-content");
  safeToggle(
    ".task-due-date, .task-priority, .description, .category, .status, .asc-desc-select, .task-name",
    "light-input"
  );
}

// RENDER TASK
function renderTask(task) {
  const list = document.getElementById("task-list");

  const card = document.createElement("div");
  card.className = "task-card";

  const title = document.createElement("div");
  title.className = "task-title";
  title.textContent = task.name || "Untitled Task";

  const details = document.createElement("div");
  details.className = "task-details";

  details.innerHTML = `
    <p><strong>Due:</strong> ${task.dueDate || "No date"}</p>
    <p><strong>Priority:</strong> ${task.priority || "None"}</p>
    <p><strong>Category:</strong> ${task.category || "None"}</p>
    <p><strong>Status:</strong> ${task.status || "None"}</p>
    <p><strong>Description:</strong> ${task.description || ""}</p>

    <button class="edit-button">Edit</button>
    <button class="delete-button">Delete</button>
  `;

  // EXPANDABLE DETAILS
  title.onclick = () => {
    details.classList.toggle("open");
  };

  // DELETE TASK
  details.querySelector(".delete-button").onclick = async () => {
    if (confirm(`Delete "${task.name}"?`)) {
      if (task.id) {
        await fetch(`http://localhost:3000/api/tasks/${task.id}`, {
          method: "DELETE"
        });
      }
      card.remove();
    }
  };

  // EDIT TASK
  details.querySelector(".edit-button").onclick = () => {
    taskBeingEdited = { task, card };

    document.querySelector(".task-name").value = task.name;
    document.querySelector(".task-due-date").value = task.dueDate;
    document.querySelector(".task-priority").value = task.priority;
    document.querySelector(".category").value = task.category;
    document.querySelector(".status").value = task.status;
    document.querySelector(".description").value = task.description;

    modal.style.display = "block";
  };

  card.appendChild(title);
  card.appendChild(details);
  list.appendChild(card);
}

// SUBMIT BUTTON (new task or edit existing)
document.querySelector(".submit-button").onclick = async function () {

  const newData = {
    name: document.querySelector(".task-name").value,
    dueDate: document.querySelector(".task-due-date").value,
    priority: document.querySelector(".task-priority").value,
    category: document.querySelector(".category").value,
    status: document.querySelector(".status").value,
    description: document.querySelector(".description").value
  };

  // EDITING EXISTING TASK
  if (taskBeingEdited) {
    const { task, card } = taskBeingEdited;

    Object.assign(task, newData);

    // Update backend
    await fetch(`http://localhost:3000/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task)
    });

    // Re-render card
    card.querySelector(".task-title").textContent = task.name;
    card.querySelector(".task-details").innerHTML = `
      <p><strong>Due:</strong> ${task.dueDate}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <p><strong>Category:</strong> ${task.category}</p>
      <p><strong>Status:</strong> ${task.status}</p>
      <p><strong>Description:</strong> ${task.description}</p>
      <button class="edit-button">Edit</button>
      <button class="delete-button">Delete</button>
    `;

    taskBeingEdited = null;
  } 
  // NEW TASK
  else {
    const response = await fetch("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData)
    });

    const savedTask = await response.json();
    renderTask(savedTask);
  }

  modal.style.display = "none";
};