// ==========================================
// Sidebar Controls
// ==========================================
function openNav() {
  const sidebar = document.getElementById("mySidebar");
  const main = document.getElementById("main");
  const menuButton = document.getElementById("menu-button");

  if (!sidebar || !main) return;

  sidebar.style.width = "250px";
  menuButton.style.display = "none";
  main.style.marginLeft = window.innerWidth < 735 ? "0px" : "250px";
}

function closeNav() {
  const sidebar = document.getElementById("mySidebar");
  const main = document.getElementById("main");
  const menuButton = document.getElementById("menu-button");

  if (!sidebar || !main) return;

  sidebar.style.width = "0";
  menuButton.style.display = "initial";
  main.style.marginLeft = "0";
}

// ==========================================
// Styling Helpers
// ==========================================
function applyBorderColor(color) {
  document.querySelectorAll(
    "button, input, select, textarea, .sidebar, .settings-modal-content, .switch .slider"
  ).forEach(el => el.style.borderColor = color);

  document.querySelectorAll(".switch .slider")
    .forEach(sl => sl.style.backgroundColor = color);

  const picker = document.getElementById("borderColorPicker");
  if (picker) picker.value = color;
}

// ==========================================
// Settings Modal
// ==========================================
(function () {
  const settingsModal = document.getElementById("settingsModal");
  const settingsButton = document.querySelector(".settings-button");
  const closeSettings = settingsModal?.querySelector(".close-settings");

  const borderColorPicker = document.getElementById("borderColorPicker");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // ---------------------
  // Modal open/close
  // ---------------------
  const openModal = m => m && (m.style.display = "block");
  const closeModal = m => m && (m.style.display = "none");

  settingsButton?.addEventListener("click", () => openModal(settingsModal));
  closeSettings?.addEventListener("click", () => closeModal(settingsModal));

  // Close modal when clicking outside
  window.addEventListener("click", e => {
    if (e.target === settingsModal) closeModal(settingsModal);
  });

  // ---------------------
  // Border Color Persistence
  // ---------------------
  const savedColor = localStorage.getItem("borderColor");
  if (savedColor) applyBorderColor(savedColor);

  borderColorPicker?.addEventListener("input", (e) => {
    const color = e.target.value;
    applyBorderColor(color);
    localStorage.setItem("borderColor", color);
  });

  // ---------------------
  // Dark Mode
  // ---------------------
  darkModeToggle?.addEventListener("change", () => {
    document.body.classList.toggle("light-mode", darkModeToggle.checked);
  });
})();
