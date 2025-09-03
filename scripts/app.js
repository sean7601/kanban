window.onload = () => {
  loadTasks();
  renderKanban();
  renderCalendar();

  // Import/Export
  document.getElementById("exportBtn").onclick = exportTasks;
  document.getElementById("importBtn").onclick = () => document.getElementById("fileInput").click();
  document.getElementById("fileInput").onchange = (e) => {
    if (e.target.files && e.target.files[0]) importTasks(e.target.files[0]);
    // reset input so selecting the same file again still triggers change
    e.target.value = "";
  };

  // Add task buttons
  document.querySelectorAll(".addTaskBtn").forEach(btn => {
    btn.onclick = () => createTask(btn.dataset.status);
  });

  // View switching
  const kanbanView = document.getElementById("kanbanView");
  const calendarView = document.getElementById("calendarView");
  const expandAllBtn = document.getElementById("expandAllBtn");
  const collapseAllBtn = document.getElementById("collapseAllBtn");

  function showKanban() {
    kanbanView.classList.remove("hidden");
    calendarView.classList.add("hidden");
    expandAllBtn.classList.remove("hidden");
    collapseAllBtn.classList.remove("hidden");
  }
  function showCalendar() {
    calendarView.classList.remove("hidden");
    kanbanView.classList.add("hidden");
    expandAllBtn.classList.add("hidden");
    collapseAllBtn.classList.add("hidden");
  }

  document.getElementById("kanbanViewBtn").onclick = showKanban;
  document.getElementById("calendarViewBtn").onclick = showCalendar;

  // Initially show Kanban + make expand/collapse visible
  showKanban();

  // Modal controls
  document.querySelector(".closeBtn").onclick = closeTaskModal;
  document.getElementById("saveTaskBtn").onclick = saveTaskChanges;
  document.getElementById("addSubtaskBtn").onclick = addSubtask;

  // Delete task from modal (uses currentTaskId)
  document.getElementById("deleteTaskBtn").onclick = () => {
    if (!currentTaskId) return;
    deleteTask(currentTaskId);
  };

  // Global expand/collapse for Kanban subtasks
  expandAllBtn.onclick = () => expandAllSubtasks();
  collapseAllBtn.onclick = () => collapseAllSubtasks();
};
