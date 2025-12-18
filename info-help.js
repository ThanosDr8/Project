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
    "button, input, select, textarea, .sidebar, .settings-modal-content, .switch .slider, .acc-modal-content"
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

    // Open / Close Modal
    signInOpenBtn?.addEventListener("click", () => { if(accModal) accModal.style.display = "block"; });
    signInCloseBtn?.addEventListener("click", () => { if(accModal) accModal.style.display = "none"; });
    cancelBtn?.addEventListener("click", () => { if(accModal) accModal.style.display = "none"; });

    // Close modal by clicking outside
    window.addEventListener("click", e => {
        if (e.target === accModal) accModal.style.display = "none";
    });

    // Sign In Button
    signInBtn?.addEventListener("click", async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            alert("Please enter both username and password");
            return;
        }

        const payload = { username, password };

        try {
            await fetch("http://localhost:3000/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } catch {
            console.warn("Backend not available, saving locally");
        }

        localStorage.setItem(USER_KEY, JSON.stringify(payload));

        // Update header button text
        signInOpenBtn.innerHTML = `
            <img src="Icons/user.png" class="user-icon">
            ${username}
        `;

        // Close modal
        if(accModal) accModal.style.display = "none";
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

})();