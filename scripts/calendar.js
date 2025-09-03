function renderCalendar() {
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  // Leading blanks for first week
  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day";
    cal.appendChild(empty);
  }

  // Helper: create a calendar entry and wire hover to highlight group
  function makeEntry(text, taskId, titleText, status) {
    const div = document.createElement("div");
    div.className = "task-entry";
    if (status) {
      // status is one of: "todo" | "inprogress" | "done"
      div.classList.add(`status-${status}`);
    }
    div.textContent = text;
    div.dataset.taskid = taskId;
    div.title = titleText || "Edit task";

    // Hover group highlight (parent + all subtasks for same taskId)
    div.addEventListener("mouseenter", () => highlightCalendarGroup(taskId, true));
    div.addEventListener("mouseleave", () => highlightCalendarGroup(taskId, false));

    return div;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayDiv = document.createElement("div");
    dayDiv.className = "calendar-day";

    const h = document.createElement("h4");
    h.textContent = String(d);
    dayDiv.appendChild(h);

    // Add tasks & subtasks that have this deadline
    tasks.forEach(t => {
      if (t.deadline === dateStr) {
        dayDiv.appendChild(makeEntry(t.title, t.id, "Edit task", t.status));
      }
      t.subtasks.forEach(st => {
        if (st.deadline === dateStr) {
          // Color by parent task status
          dayDiv.appendChild(makeEntry(`${st.title} (subtask)`, t.id, "Edit parent task", t.status));
        }
      });
    });

    cal.appendChild(dayDiv);
  }
}

// Highlight/unhighlight every calendar entry that belongs to the same task
function highlightCalendarGroup(taskId, on) {
  const entries = document.querySelectorAll(".task-entry");
  entries.forEach(el => {
    if (el.dataset.taskid === taskId) {
      el.classList.toggle("related-hover", on);
    }
  });
}

// Click to open task modal (parent task for both tasks and subtasks)
(function bindCalendarClicks() {
  const cal = document.getElementById("calendar");
  cal.addEventListener("click", (e) => {
    const entry = e.target.closest(".task-entry");
    if (!entry) return;
    const taskId = entry.dataset.taskid;
    if (taskId) openTaskModal(taskId);
  });
})();
