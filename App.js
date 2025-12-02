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

// MODAL EVENTS
modalOpenBtn.onclick = () => openModal(modal);
modalClose.onclick = () => closeModal(modal);

filterOpenBtn.onclick = () => openModal(filterModal);
filterCloseBtn.onclick = () => closeModal(filterModal);

// CLICK OUTSIDE TO CLOSE
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
    ".task-due-date, .task-priority, .description, .task-search-bar, .category, .status, .asc-desc-select",
    "light-input"
  );
}
function renderTask(task) {
  const list = document.getElementById("task-list");

  const card = document.createElement("div");
  card.className = "task-card";

  card.innerHTML = `
    <h3>${task.name || "Untitled Task"}</h3>
    <p><strong>Due:</strong> ${task.dueDate || "No date"}</p>
    <p><strong>Priority:</strong> ${task.priority || "None"}</p>
    <p><strong>Category:</strong> ${task.category || "None"}</p>
    <p><strong>Status:</strong> ${task.status || "None"}</p>
    <p><strong>Description:</strong> ${task.description || ""}</p>
  `;

  list.appendChild(card);
}


document.querySelector(".submit-button").onclick = async function () {
  const task = {
    name: document.querySelector(".task-search-bar").value,
    dueDate: document.querySelector(".task-due-date").value,
    priority: document.querySelector(".task-priority").value,
    category: document.querySelector(".category").value,
    status: document.querySelector(".status").value,
    description: document.querySelector(".description").value
  };

  // Send to backend
  await fetch("http://localhost:3000/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task)
  });

  // Show new task on page immediately
  renderTask(task);

  alert("Task created!");
  closeModal(modal);

  // Clear form
  document.querySelector(".task-search-bar").value = "";
  document.querySelector(".task-due-date").value = "";
  document.querySelector(".task-priority").value = "";
  document.querySelector(".category").value = "";
  document.querySelector(".status").value = "";
  document.querySelector(".description").value = "";
};

function renderTask(task) {
  const list = document.getElementById("task-list");

  // Task wrapper
  const card = document.createElement("div");
  card.className = "task-card";

  // Title (clickable)
  const title = document.createElement("div");
  title.className = "task-title";
  title.textContent = task.name || "Untitled Task";

  // Details (hidden at first)
  const details = document.createElement("div");
  details.className = "task-details";
  details.style.display = "none";

  details.innerHTML = `
    <p><strong>Due:</strong> ${task.dueDate || "No date"}</p>
    <p><strong>Priority:</strong> ${task.priority || "None"}</p>
    <p><strong>Category:</strong> ${task.category || "None"}</p>
    <p><strong>Status:</strong> ${task.status || "None"}</p>
    <p><strong>Description:</strong> ${task.description || ""}</p>
  `;

  // Toggle dropdown on click
  title.onclick = () => {
    details.style.display =
      details.style.display === "none" ? "block" : "none";
  };

  card.appendChild(title);
  card.appendChild(details);
  list.appendChild(card);
}