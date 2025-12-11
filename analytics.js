// ======================
// Load tasks from localStorage
// ======================
function loadTasks() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
}
const tasks = loadTasks();

// ======================
// Sidebar Controls (GLOBAL)
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
// Helper: Chart text color
// ======================
function getChartTextColor() {
    return document.body.classList.contains("light-mode") ? "#000000" : "#c9c9c9";
}

// ======================
// Chart Instances
// ======================
let tasksByCategoryChart, tasksByStatusChart, weeklyProductivityChart;

// ======================
// CHART 1: Tasks per Category (Bar)
// ======================
function drawTasksByCategory() {
    const categories = {};
    tasks.forEach(t => categories[t.category] = (categories[t.category] || 0) + 1);

    const ctx = document.getElementById("tasksByCategory").getContext("2d");
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
            plugins: {
                legend: { labels: { color: getChartTextColor() } }
            },
            scales: {
                x: { ticks: { color: getChartTextColor() } },
                y: { ticks: { color: getChartTextColor() } }
            }
        }
    });
}

// ======================
// CHART 2: Tasks per Status (Pie)
// ======================
function drawTasksByStatus() {
    const statuses = {};
    tasks.forEach(t => statuses[t.status] = (statuses[t.status] || 0) + 1);

    const ctx = document.getElementById("tasksByStatus").getContext("2d");
    tasksByStatusChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(statuses),
            datasets: [{
                data: Object.values(statuses),
                backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: getChartTextColor() } }
            }
        }
    });
}

// ======================
// CHART 3: Weekly Productivity (Line)
// ======================
function getWeekNumber(date) {
    const first = new Date(date.getFullYear(), 0, 1);
    const diff = Math.floor((date - first) / (24*60*60*1000));
    return Math.ceil((diff + first.getDay() + 1) / 7);
}

function drawWeeklyProductivity() {
    const weekly = {};
    tasks.forEach(t => {
        if (t.status !== "done") return;
        const week = getWeekNumber(new Date(t.dueDate));
        weekly[week] = (weekly[week] || 0) + 1;
    });

    const ctx = document.getElementById("weeklyProductivity").getContext("2d");
    weeklyProductivityChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: Object.keys(weekly),
            datasets: [{
                label: "Tasks Completed",
                data: Object.values(weekly),
                borderColor: "#36A2EB",
                tension: 0.25
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: getChartTextColor() } }
            },
            scales: {
                x: { ticks: { color: getChartTextColor() } },
                y: { ticks: { color: getChartTextColor() } }
            }
        }
    });
}

// ======================
// Run all charts initially
// ======================
drawTasksByCategory();
drawTasksByStatus();
drawWeeklyProductivity();

// ======================
// Settings Modal + Dark Mode + Border Color
// ======================
(function() {
    const settingsModal = document.getElementById("settingsModal");
    const settingsButton = document.querySelector(".settings-button");
    const closeSettings = settingsModal?.querySelector(".close-settings");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const borderColorPicker = document.getElementById("borderColorPicker");

    // Modal open/close
    const openModal = () => settingsModal && (settingsModal.style.display = "block");
    const closeModal = () => settingsModal && (settingsModal.style.display = "none");

    settingsButton?.addEventListener("click", openModal);
    closeSettings?.addEventListener("click", closeModal);

    window.addEventListener("click", e => {
        if (e.target === settingsModal) closeModal();
    });

    // Dark Mode: load saved state
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
        darkModeToggle.checked = true;
    }

    // Dark Mode Toggle
    darkModeToggle?.addEventListener("change", () => {
        const isLight = darkModeToggle.checked;
        document.body.classList.toggle("light-mode", isLight);
        localStorage.setItem("darkMode", isLight ? "true" : "false");

        // Update chart text colors
        const textColor = document.body.classList.contains("light-mode") ? "#000000" : "#c9c9c9";
        [tasksByCategoryChart, tasksByStatusChart, weeklyProductivityChart].forEach(chart => {
            if (!chart) return;
            if(chart.options.plugins?.legend?.labels) chart.options.plugins.legend.labels.color = textColor;
            if(chart.options.scales) Object.values(chart.options.scales).forEach(axis => axis.ticks.color = textColor);
            chart.update();
        });
    });

    // Border Color
    function applyBorderColor(color) {
        document.querySelectorAll(
            "button, input, select, textarea, .sidebar, .settings-modal-content, .switch .slider"
        ).forEach(el => el.style.borderColor = color);

        document.querySelectorAll(".switch .slider").forEach(sl => sl.style.backgroundColor = color);

        if (borderColorPicker) borderColorPicker.value = color;
    }

    const savedColor = localStorage.getItem("borderColor");
    if (savedColor) applyBorderColor(savedColor);

    borderColorPicker?.addEventListener("input", e => {
        const color = e.target.value;
        applyBorderColor(color);
        localStorage.setItem("borderColor", color);
    });
})();
