let currentTaskId = null;

function createTask(status) {
  const task = {
    id: uuid(),
    title: "New Task",
    notes: "",
    status,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deadline: null,
    subtasks: [],
    history: [{ action: "created", timestamp: Date.now() }]
  };
  tasks.push(task);
  saveTasks();
  renderKanban();
  renderCalendar();
}

function openTaskModal(taskId) {
  currentTaskId = taskId;
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const titleEl = document.getElementById("taskTitle");
  const notesEl = document.getElementById("taskNotes");
  const deadlineEl = document.getElementById("taskDeadline");

  titleEl.value = task.title;
  notesEl.value = task.notes;
  deadlineEl.value = task.deadline || "";

  renderSubtasks(task);

  document.getElementById("taskModal").classList.remove("hidden");
}

function closeTaskModal() {
  document.getElementById("taskModal").classList.add("hidden");
}

function saveTaskChanges() {
  const task = tasks.find(t => t.id === currentTaskId);
  if (!task) return;

  task.title = sanitizeString(document.getElementById("taskTitle").value);
  task.notes = sanitizeString(document.getElementById("taskNotes").value);
  task.deadline = document.getElementById("taskDeadline").value || null;
  task.updatedAt = Date.now();

  saveTasks();
  renderKanban();
  renderCalendar();
  closeTaskModal();
}

function renderSubtasks(task) {
  const ul = document.getElementById("subtaskList");
  ul.innerHTML = "";

  task.subtasks.forEach(st => {
    const li = document.createElement("li");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!st.completed;
    cb.dataset.id = st.id;

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = st.title;
    titleInput.className = "subtask-title";
    titleInput.dataset.id = st.id;

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = st.deadline || "";
    dateInput.dataset.id = st.id;

    const delBtn = document.createElement("button");
    delBtn.className = "icon-btn del-subtask";
    delBtn.title = "Delete subtask";
    delBtn.dataset.id = st.id;
    delBtn.textContent = "🗑";

    li.appendChild(cb);
    li.appendChild(titleInput);
    li.appendChild(dateInput);
    li.appendChild(delBtn);

    ul.appendChild(li);
  });
}

function addSubtask() {
  const task = tasks.find(t => t.id === currentTaskId);
  if (!task) return;

  let title = prompt("Enter subtask name:", "New Subtask");
  if (!title) title = "New Subtask";

  const subtask = {
    id: uuid(),
    title: sanitizeString(title),
    completed: false,
    deadline: null
  };

  task.subtasks.push(subtask);
  task.updatedAt = Date.now();

  saveTasks();
  renderSubtasks(task);
  renderKanban();
  renderCalendar();
}

function deleteSubtask(taskId, subtaskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const idx = task.subtasks.findIndex(s => s.id === subtaskId);
  if (idx === -1) return;

  task.subtasks.splice(idx, 1);
  task.updatedAt = Date.now();

  saveTasks();
  renderSubtasks(task);
  renderKanban();
  renderCalendar();
}

function deleteTask(taskId) {
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return;
  const ok = confirm("Delete this task and all its subtasks? This cannot be undone.");
  if (!ok) return;

  tasks.splice(idx, 1);
  saveTasks();

  // If the modal is open for this task, close it
  if (currentTaskId === taskId) {
    currentTaskId = null;
    closeTaskModal();
  }

  renderKanban();
  renderCalendar();
}

// --- Modal subtask events (title/checkbox/date/delete) ---
(function bindSubtaskEvents() {
  const subtaskList = document.getElementById("subtaskList");

  // Title edits
  subtaskList.addEventListener("input", (e) => {
    if (!currentTaskId) return;
    if (e.target.classList.contains("subtask-title")) {
      const task = tasks.find(t => t.id === currentTaskId);
      if (!task) return;
      const st = task.subtasks.find(s => s.id === e.target.dataset.id);
      if (!st) return;
      st.title = sanitizeString(e.target.value);
      task.updatedAt = Date.now();
      saveTasks();
      renderKanban();
      renderCalendar();
    }
  });

  // Checkbox & date changes
  subtaskList.addEventListener("change", (e) => {
    if (!currentTaskId) return;
    const task = tasks.find(t => t.id === currentTaskId);
    if (!task) return;

    if (e.target.type === "checkbox") {
      const st = task.subtasks.find(s => s.id === e.target.dataset.id);
      if (!st) return;
      st.completed = e.target.checked;
      task.updatedAt = Date.now();
      saveTasks();
      renderKanban();
      renderCalendar();
    } else if (e.target.type === "date") {
      const st = task.subtasks.find(s => s.id === e.target.dataset.id);
      if (!st) return;
      st.deadline = e.target.value || null;
      task.updatedAt = Date.now();
      saveTasks();
      renderKanban();
      renderCalendar();
    }
  });

  // Delete subtask button
  subtaskList.addEventListener("click", (e) => {
    const btn = e.target.closest(".del-subtask");
    if (!btn) return;
    if (!currentTaskId) return;

    const ok = confirm("Delete this subtask?");
    if (!ok) return;

    deleteSubtask(currentTaskId, btn.dataset.id);
  });
})();
