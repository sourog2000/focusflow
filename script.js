/*************************************************
 * FocusFlow – FINAL script.js
 *************************************************/

/* =====================
   1. DATE (Dashboard)
===================== */
const todayDate = document.getElementById("today-date");
const today = new Date();
todayDate.textContent = today.toLocaleDateString("en-IN", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

/* =====================
   2. GLOBAL STATE
===================== */
let tasks = [];

/* =====================
   3. DOM REFERENCES
===================== */
// Task form
const taskForm = document.getElementById("task-form");
const taskNameInput = document.getElementById("task-name");
const taskCategorySelect = document.getElementById("task-category");
const taskPrioritySelect = document.getElementById("task-priority");
const taskDueDateInput = document.getElementById("task-duedate");
const taskList = document.getElementById("task-list");

// Dashboard cards
const totalTasksEl = document.getElementById("total-tasks");
const completedTasksEl = document.getElementById("completed-tasks");

// Stats
const completionPercentEl = document.getElementById("completion-percent");
const completionBarEl = document.getElementById("completion-bar");

// Habits
const habitsDoneEl = document.getElementById("habits-done");
const habitCheckboxes = document.querySelectorAll(
  ".habit-list input[type='checkbox']"
);

// Controls
const searchInput = document.getElementById("search-input");
const filterCategory = document.getElementById("filter-category");
const filterPriority = document.getElementById("filter-priority");
const sortBySelect = document.getElementById("sort-by");
const clearAllBtn = document.getElementById("clear-all");

/* =====================
   4. LOCAL STORAGE
===================== */
function saveTasks() {
  localStorage.setItem("focusflowTasks", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem("focusflowTasks");
  tasks = saved ? JSON.parse(saved) : [];
}

/* =====================
   5. PURE FUNCTIONS
===================== */
function getFilteredTasks() {
  let result = [...tasks];

  if (filterCategory.value !== "All") {
    result = result.filter((task) => task.category === filterCategory.value);
  }

  if (filterPriority.value !== "All") {
    result = result.filter((task) => task.priority === filterPriority.value);
  }

  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    result = result.filter((task) => task.name.toLowerCase().includes(query));
  }

  if (sortBySelect.value === "due-earliest") {
    result.sort((a, b) =>
      (a.dueDate || "9999").localeCompare(b.dueDate || "9999")
    );
  }

  if (sortBySelect.value === "due-latest") {
    result.sort((a, b) =>
      (b.dueDate || "0000").localeCompare(a.dueDate || "0000")
    );
  }

  return result;
}

function updateSummary() {
  totalTasksEl.textContent = tasks.length;
  completedTasksEl.textContent = tasks.filter((task) => task.completed).length;
}

function updateStats() {
  if (tasks.length === 0) {
    completionPercentEl.textContent = 0;
    completionBarEl.style.width = "0%";
    return;
  }

  const completed = tasks.filter((task) => task.completed).length;
  const percent = Math.round((completed / tasks.length) * 100);

  completionPercentEl.textContent = percent;
  completionBarEl.style.width = percent + "%";
}

function updateHabitsSummary() {
  const done = [...habitCheckboxes].filter((cb) => cb.checked).length;
  habitsDoneEl.textContent = done;
}

/* =====================
   6. RENDER TASKS
===================== */
function renderTasks() {
  taskList.innerHTML = "";

  const visibleTasks = getFilteredTasks();

  visibleTasks.forEach((task) => {
    const taskItemEl = document.createElement("li");
    taskItemEl.className = "task-item";
    if (task.completed) taskItemEl.classList.add("completed");

    const labelEl = document.createElement("label");
    labelEl.className = "task-label";

    const checkboxEl = document.createElement("input");
    checkboxEl.type = "checkbox";
    checkboxEl.checked = task.completed;

    const taskNameEl = document.createElement("span");
    taskNameEl.textContent = task.name;

    labelEl.appendChild(checkboxEl);
    labelEl.appendChild(taskNameEl);

    const metaEl = document.createElement("span");
    metaEl.className = "task-meta";
    metaEl.textContent =
      `${task.category} • ${task.priority}` +
      (task.dueDate ? ` • Due: ${task.dueDate}` : "");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "ghost-btn";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "ghost-btn";

    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("button-wrapper");
    wrapperDiv.appendChild(editBtn);
    wrapperDiv.appendChild(deleteBtn);

    taskItemEl.appendChild(labelEl);
    taskItemEl.appendChild(metaEl);
    taskItemEl.appendChild(wrapperDiv);
    taskList.appendChild(taskItemEl);

    /* Checkbox */
    checkboxEl.addEventListener("change", () => {
      task.completed = checkboxEl.checked;
      renderTasks();
      updateSummary();
      updateStats();
      saveTasks();
    });

    /* Delete */
    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter((t) => t !== task);
      renderTasks();
      updateSummary();
      updateStats();
      saveTasks();
    });

    /* Edit */
    editBtn.addEventListener("click", () => {
      const inputEl = document.createElement("input");
      inputEl.value = task.name;
      labelEl.replaceChild(inputEl, taskNameEl);
      inputEl.focus();

      const commit = () => {
        task.name = inputEl.value.trim() || task.name;
        renderTasks();
        updateSummary();
        updateStats();
        saveTasks();
      };

      inputEl.addEventListener("blur", commit);
      inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") renderTasks();
      });
    });
  });
}

/* =====================
   7. EVENT HANDLERS
===================== */
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = taskNameInput.value.trim();
  if (!name) return;

  tasks.unshift({
    name,
    category: taskCategorySelect.value,
    priority: taskPrioritySelect.value,
    dueDate: taskDueDateInput.value || "",
    completed: false,
  });

  taskNameInput.value = "";
  taskDueDateInput.value = "";

  renderTasks();
  updateSummary();
  updateStats();
  saveTasks();
});

searchInput.addEventListener("input", renderTasks);
filterCategory.addEventListener("change", renderTasks);
filterPriority.addEventListener("change", renderTasks);
sortBySelect.addEventListener("change", renderTasks);

clearAllBtn.addEventListener("click", () => {
  if (!confirm("Clear ALL tasks?")) return;
  tasks = [];
  renderTasks();
  updateSummary();
  updateStats();
  saveTasks();
});

/* =====================
   8. INITIALIZATION
===================== */
loadTasks();
renderTasks();
updateSummary();
updateStats();
updateHabitsSummary();

habitCheckboxes.forEach((cb) =>
  cb.addEventListener("change", updateHabitsSummary)
);
