// ======================
// Global state
// ======================
let tasks = [];
let tasksByCategoryChart, tasksByStatusChart, weeklyProductivityChart;

// ======================
// Helper: Chart text color
// ======================
function getChartTextColor() {
    return document.body.classList.contains("light-mode") ? "#000000" : "#c9c9c9";
}

// ======================
// Load tasks (FIXED - uses API + JWT)
// ======================
async function loadTasks() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.token) {
        console.warn("No user logged in");
        tasks = [];
        drawTasksByCategory();
        drawTasksByStatus();
        drawWeeklyProductivity();
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/api/tasks", {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        });

        if (!res.ok) throw new Error("Failed to fetch tasks");

        const data = await res.json();
        tasks = Array.isArray(data) ? data : [];

    } catch (err) {
        console.error("Failed to load tasks from API", err);
        tasks = [];
    }

    drawTasksByCategory();
    drawTasksByStatus();
    drawWeeklyProductivity();
}

loadTasks();

// ======================
// Sidebar controls
// ======================
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
// Chart 1: Tasks per Category
// ======================
function drawTasksByCategory() {
    const categories = {};
    tasks.forEach(t => categories[t.category] = (categories[t.category] || 0) + 1);

    const ctx = document.getElementById("tasksByCategory").getContext("2d");
    if (tasksByCategoryChart) tasksByCategoryChart.destroy();

    tasksByCategoryChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(categories),
            datasets: [{
                label: "Tasks per Category",
                data: Object.values(categories),
                backgroundColor: "rgba(54, 162, 235, 0.6)"
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: getChartTextColor() } } },
            scales: {
                x: { ticks: { color: getChartTextColor() } },
                y: { ticks: { color: getChartTextColor() } }
            }
        }
    });
}

// ======================
// Chart 2: Tasks per Status
// ======================
function drawTasksByStatus() {
    const statuses = {};
    tasks.forEach(t => statuses[t.status] = (statuses[t.status] || 0) + 1);

    const ctx = document.getElementById("tasksByStatus").getContext("2d");
    if (tasksByStatusChart) tasksByStatusChart.destroy();

    const isMobile = window.innerWidth < 735;

    tasksByStatusChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(statuses),
            datasets: [{
                data: Object.values(statuses),
                backgroundColor: ["#36A2EB","#FF6384","#FFCE56","#4BC0C0"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: isMobile ? 2 : 1,
            plugins: {
                legend: {
                    position: isMobile ? 'bottom' : 'top',
                    labels: { color: getChartTextColor() }
                }
            }
        }
    });
}

// ======================
// Chart 3: Weekly Productivity
// ======================
function getWeekKey(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const first = new Date(year,0,1);
    const diff = Math.floor((d-first)/(24*60*60*1000));
    const week = Math.ceil((diff + first.getDay() + 1)/7);
    return `${year}-W${week}`;
}

function drawWeeklyProductivity() {
    const weekly = {};
    tasks.forEach(t => {
        if (!t.dueDate || t.status.toLowerCase() !== "done") return;
        const key = getWeekKey(t.dueDate);
        weekly[key] = (weekly[key] || 0) + 1;
    });

    const labels = Object.keys(weekly).sort();
    const data = labels.map(l => weekly[l]);

    const ctx = document.getElementById("weeklyProductivity").getContext("2d");
    if (weeklyProductivityChart) weeklyProductivityChart.destroy();

    weeklyProductivityChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Tasks Completed",
                data,
                borderColor: "#36A2EB",
                tension: 0.25
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: getChartTextColor() } } },
            scales: {
                x: { ticks: { color: getChartTextColor() } },
                y: { ticks: { color: getChartTextColor(), precision: 0 } }
            }
        }
    });
}

// ======================
// Settings + Dark Mode + Border Color
// ======================
(function() {
    const settingsModal = document.getElementById("settingsModal");
    const settingsButton = document.querySelector(".settings-button");
    const closeSettings = settingsModal?.querySelector(".close-settings");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const borderColorPicker = document.getElementById("borderColorPicker");

    const openModal = () => settingsModal && (settingsModal.style.display = "block");
    const closeModal = () => settingsModal && (settingsModal.style.display = "none");

    settingsButton?.addEventListener("click", openModal);
    closeSettings?.addEventListener("click", closeModal);
    window.addEventListener("click", e => { if (e.target === settingsModal) closeModal(); });

    darkModeToggle?.addEventListener("change", () => {
        const isLight = darkModeToggle.checked;
        document.body.classList.toggle("light-mode", isLight);
        localStorage.setItem("darkMode", isLight ? "true" : "false");
        [tasksByCategoryChart, tasksByStatusChart, weeklyProductivityChart].forEach(c => {
            if (!c) return;
            if(c.options.plugins?.legend?.labels) c.options.plugins.legend.labels.color = getChartTextColor();
            if(c.options.scales) Object.values(c.options.scales).forEach(ax => ax.ticks.color = getChartTextColor());
            c.update();
        });
    });

    const applyBorderColor = color => {
        document.querySelectorAll("button, input, select, textarea, .sidebar, .settings-modal-content, .acc-modal-content, .switch .slider")
            .forEach(el => el.style.borderColor=color);
        document.querySelectorAll(".switch .slider").forEach(sl => sl.style.backgroundColor=color);
        if (borderColorPicker) borderColorPicker.value = color;
    };

    const savedColor = localStorage.getItem("borderColor");
    if (savedColor) applyBorderColor(savedColor);

    borderColorPicker?.addEventListener("input", e => {
        applyBorderColor(e.target.value);
        localStorage.setItem("borderColor", e.target.value);
    });

})();

// ======================
// Account Modal + Sign In (FIXED)
// ======================
(function() {
    const accModal = document.getElementById("accModal");
    const signInOpenBtn = document.getElementById("signInButton");
    const signInCloseBtn = document.getElementById("closeAccModal");
    const signInBtn = document.getElementById("signIn");
    const cancelBtn = document.getElementById("cancel");
    const usernameInput = document.querySelector(".username");
    const passwordInput = document.querySelector(".password");

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

            localStorage.setItem("user", JSON.stringify(data));

            signInOpenBtn.innerHTML = `
                <img src="Icons/user.png" class="user-icon">
                ${data.username}
            `;

            if(accModal) accModal.style.display = "none";

            loadTasks(); // refresh analytics

        } catch {
            alert("Login failed");
        }
    });

    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
        signInOpenBtn.innerHTML = `
            <img src="Icons/user.png" class="user-icon">
            ${savedUser.username}
        `;
    }

})();