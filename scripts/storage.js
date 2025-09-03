let tasks = [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const data = localStorage.getItem("tasks");
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) tasks = parsed;
    } catch {}
  }
}

function exportTasks() {
  const blob = new Blob([JSON.stringify(tasks)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tasks.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importTasks(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        data.forEach(t => {
          t.title = sanitizeString(t.title);
          t.notes = sanitizeString(t.notes || "");
          if (t.subtasks) {
            t.subtasks.forEach(st => st.title = sanitizeString(st.title));
          }
        });
        tasks = data;
        saveTasks();
        renderKanban();
        renderCalendar();
      }
    } catch {}
  };
  reader.readAsText(file);
}
