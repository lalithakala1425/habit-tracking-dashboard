const APP = (() => {
  let state = {
    user: localStorage.getItem("hf_user") || "",
    habits: JSON.parse(localStorage.getItem("hf_habits") || "[]"),
    filter: "all",
    timer: null,
    pom: {
      running: false,
      time: 1500,
      mode: "focus"
    }
  };

  /* ---------------- INIT ---------------- */
  function init() {
    const savedTheme = localStorage.getItem("hf_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    if (!state.user) {
      showOnboarding();
    } else {
      startApp();
    }
  }

  function showOnboarding() {
    document.getElementById("onboarding").style.display = "flex";
    document.getElementById("app").style.display = "none";
  }

  function startApp() {
    document.getElementById("onboarding").style.display = "none";
    document.getElementById("app").style.display = "block";

    const avatarEl = document.getElementById("avatarEl");
    if (avatarEl) {
      avatarEl.innerText = state.user[0]?.toUpperCase() || "U";
    }

    const timerEl = document.getElementById("pomTimer");
    if (timerEl) timerEl.innerText = "25:00";

    renderHabits();
    updateStats();
    updateGreeting();
  }

  /* ---------------- ONBOARD ---------------- */
  document.getElementById("btnStart").onclick = () => {
    const name = document.getElementById("nameInput").value.trim();
    if (!name) return alert("Enter your name");

    state.user = name;
    localStorage.setItem("hf_user", name);
    startApp();
  };

  /* ---------------- NAV ---------------- */
  function navTo(page) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(`page-${page}`)?.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    document.getElementById(`nav-${page}`)?.classList.add("active");
  }

  /* ---------------- HABITS ---------------- */
  function saveHabits() {
    localStorage.setItem("hf_habits", JSON.stringify(state.habits));
  }

  function renderHabits() {
    const list = document.getElementById("habitsList");
    if (!list) return;

    const search = document.getElementById("searchInput")?.value.toLowerCase() || "";

    let habits = state.habits.filter(h =>
      (state.filter === "all" || h.category === state.filter) &&
      h.name.toLowerCase().includes(search)
    );

    list.innerHTML = "";

    habits.forEach(h => {
      const realIndex = state.habits.indexOf(h);

      const el = document.createElement("div");
      el.className = "habit-item";
      el.innerHTML = `
        <div>${h.name}</div>
        <button onclick="APP.toggleHabit(${realIndex})">✔</button>
        <button onclick="APP.deleteHabit(${realIndex})">🗑</button>
      `;
      list.appendChild(el);
    });

    if (habits.length === 0) {
      list.innerHTML = "<div class='empty-state'>No habits found</div>";
    }

    const countEl = document.getElementById("habitsCount");
    if (countEl) countEl.innerText = habits.length;
  }

  function openHabitModal() {
    document.getElementById("habitModal")?.classList.add("open");
  }

  function closeHabitModal() {
    document.getElementById("habitModal")?.classList.remove("open");
  }

  function saveHabit() {
    const name = document.getElementById("hName").value.trim();
    const cat = document.getElementById("hCat").value;

    if (!name) return alert("Habit name required");

    state.habits.push({
      name,
      category: cat,
      done: false,
      streak: 0
    });

    saveHabits();
    renderHabits();
    updateStats();
    closeHabitModal();
  }

  function deleteHabit(i) {
    if (!confirm("Delete habit?")) return;
    state.habits.splice(i, 1);
    saveHabits();
    renderHabits();
    updateStats();
  }

  function toggleHabit(i) {
    const h = state.habits[i];

    if (!h.done) {
      h.done = true;
      h.streak++;
    } else {
      h.done = false;
    }

    saveHabits();
    renderHabits();
    updateStats();
  }

  function setFilter(cat, el) {
    state.filter = cat;
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    el.classList.add("active");
    renderHabits();
  }

  /* ---------------- STATS ---------------- */
  function updateStats() {
    const totalEl = document.getElementById("statTotal");
    if (totalEl) totalEl.innerText = state.habits.length;

    const done = state.habits.filter(h => h.done).length;

    const todayEl = document.getElementById("statToday");
    if (todayEl) todayEl.innerText = done;

    const best = Math.max(0, ...state.habits.map(h => h.streak));

    const streakEl = document.getElementById("statStreak");
    if (streakEl) streakEl.innerText = best;

    const score = state.habits.length
      ? Math.round((done / state.habits.length) * 100)
      : 0;

    const scoreEl = document.getElementById("statScore");
    if (scoreEl) scoreEl.innerText = score + "%";

    const ringEl = document.getElementById("scoreRingVal");
    if (ringEl) ringEl.innerText = score;
  }

  /* ---------------- GREETING ---------------- */
  function updateGreeting() {
    const hour = new Date().getHours();
    let text = "GOOD EVENING";

    if (hour < 12) text = "GOOD MORNING";
    else if (hour < 18) text = "GOOD AFTERNOON";

    document.getElementById("greetTime").innerText = text;
    document.getElementById("greetText").innerText =
      `Welcome back, ${state.user}! 👋`;

    document.getElementById("greetDate").innerText =
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric"
      });
  }

  /* ---------------- THEME ---------------- */
  function toggleTheme() {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme") || "dark";

    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("hf_theme", next);
  }

  /* ---------------- TIMER ---------------- */
  function pomToggle() {
    if (state.timer) clearInterval(state.timer);

    if (state.pom.running) {
      state.pom.running = false;
      return;
    }

    state.pom.running = true;

    state.timer = setInterval(() => {
      if (state.pom.time <= 0) {
        clearInterval(state.timer);
        state.pom.running = false;
        alert("Time's up!");
        return;
      }

      state.pom.time--;

      const min = Math.floor(state.pom.time / 60);
      const sec = state.pom.time % 60;

      document.getElementById("pomTimer").innerText =
        `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    }, 1000);
  }

  function pomReset() {
    clearInterval(state.timer);
    state.pom.running = false;

    const min = document.getElementById("pomFocusMin").value;
    state.pom.time = parseInt(min) * 60;

    document.getElementById("pomTimer").innerText =
      `${String(min).padStart(2, "0")}:00`;
  }

  /* ---------------- EXPORT ---------------- */
  function exportJSON() {
    const data = JSON.stringify(state.habits, null, 2);
    const blob = new Blob([data], { type: "application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "habits.json";
    a.click();
  }

  function exportCSV() {
    let csv = "Name,Category,Streak\n";

    state.habits.forEach(h => {
      csv += `"${h.name}","${h.category}",${h.streak}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "habits.csv";
    a.click();
  }

  function clearAllData() {
    if (!confirm("Clear all data?")) return;
    localStorage.clear();
    location.reload();
  }

  /* ---------------- PUBLIC API ---------------- */
  return {
    init,
    navTo,
    openHabitModal,
    closeHabitModal,
    saveHabit,
    deleteHabit,
    toggleHabit,
    setFilter,
    renderHabits,
    toggleTheme,
    pomToggle,
    pomReset,
    exportJSON,
    exportCSV,
    clearAllData
  };
})();

/* START APP */
window.onload = APP.init;
