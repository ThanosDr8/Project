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

// ======================
// Apply Border Color (including HRs)
// ======================
function applyBorderColor(color) {
  document.querySelectorAll(
    "button, input, select, textarea, .modal-content, .filter-modal-content, .acc-modal-content, .settings-modal-content, .sidebar, .switch .slider, hr, .logout-button"
  ).forEach(el => {
    el.style.borderColor = color;
  });

  document.querySelectorAll(".switch .slider").forEach(slider => {
    slider.style.backgroundColor = color;
  });

  if (borderColorPicker) borderColorPicker.value = color;
  localStorage.setItem("borderColor", color);
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

  // ========================
  // Modal open/close
  // ========================
  const openModal = m => m && (m.style.display = "block");
  const closeModal = m => m && (m.style.display = "none");

  settingsButton?.addEventListener("click", () => openModal(settingsModal));
  closeSettings?.addEventListener("click", () => closeModal(settingsModal));

  // Close modal when clicking outside
  window.addEventListener("click", e => {
    if (e.target === settingsModal) closeModal(settingsModal);
  });

  // =============================
  // Border Color Persistence
  // =============================
  const savedColor = localStorage.getItem("borderColor");
  if (savedColor) applyBorderColor(savedColor);

  borderColorPicker?.addEventListener("input", (e) => {
    const color = e.target.value;
    applyBorderColor(color);
    localStorage.setItem("borderColor", color);
  });

  // ========================
  // Dark Mode
  // ========================
  darkModeToggle?.addEventListener("change", () => {
    document.body.classList.toggle("light-mode", darkModeToggle.checked);
  });
})();

// ======================
// Account Modal + Sign In
// ======================
(function() {
  const accModal = document.getElementById("accModal");
  const signInOpenBtn = document.getElementById("signInButton");
  const signInCloseBtn = document.getElementById("closeAccModal");
  const signInBtn = document.getElementById("signIn");
  const cancelBtn = document.getElementById("cancel");
  const usernameInput = document.querySelector(".username");
  const passwordInput = document.querySelector(".password");
  const USER_KEY = "user";

  signInOpenBtn?.addEventListener("click", () => { if(accModal) accModal.style.display = "block"; });
  signInCloseBtn?.addEventListener("click", () => { if(accModal) accModal.style.display = "none"; });
  cancelBtn?.addEventListener("click", () => { if(accModal) accModal.style.display = "none"; });

  window.addEventListener("click", e => {
    if (e.target === accModal) accModal.style.display = "none";
  });

  signInBtn?.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      // Αποθηκεύουμε το αντικείμενο με το token
      localStorage.setItem(USER_KEY, JSON.stringify(data));

      // Ενημερώνουμε το header
      signInOpenBtn.innerHTML = `
        <img src="Icons/user.png" class="user-icon">
        ${data.username}
      `;

      if(accModal) accModal.style.display = "none";

      // Φορτώνουμε τα tasks για analytics
      if (typeof loadTasks === "function") loadTasks();

    } catch (err) {
      alert("Login failed: " + err.message);
    }
  });

  // Restore user on load
  const savedUser = localStorage.getItem(USER_KEY);
  if (savedUser) {
    const { username } = JSON.parse(savedUser);
    signInOpenBtn.innerHTML = `
      <img src="Icons/user.png" class="user-icon">
      ${username}
    `;
  }

  // ======================
  // Logout Button Logic
  // ======================
  const logoutBtn = document.createElement("button");
  logoutBtn.id = "logoutButton";
  logoutBtn.className = "logout-button";
  logoutBtn.textContent = "Logout";

  const userExists = localStorage.getItem("user");
  logoutBtn.style.display = userExists ? "inline-flex" : "none";
  logoutBtn.style.marginLeft = "5px";

  signInOpenBtn.parentNode.appendChild(logoutBtn);

  logoutBtn.onclick = () => {
    localStorage.removeItem("user");
    signInOpenBtn.innerHTML = `<img src="Icons/user.png" class="user-icon"> Sign In`;
    logoutBtn.style.display = "none";

    tasks = [];
    const taskList = document.getElementById("taskList"); 
    if (taskList) taskList.innerHTML = "";
    if (typeof loadTasks === "function") loadTasks();

    alert("Logged out successfully");
  };

  const currentSavedColor = localStorage.getItem("borderColor");
  if (currentSavedColor) logoutBtn.style.borderColor = currentSavedColor;
})();