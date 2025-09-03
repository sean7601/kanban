function renderKanban() {
  ["todo", "inprogress", "done"].forEach(status => {
    const list = document.getElementById(status + "List");
    list.innerHTML = "";

    tasks
      .filter(t => t.status === status)
      .forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card";
        card.draggable = true;
        card.dataset.id = task.id;

        // Header: expand toggle, title, actions
        const header = document.createElement("div");
        header.className = "task-header";

        const toggle = document.createElement("span");
        toggle.className = "expand-toggle";
        toggle.textContent = task.subtasks && task.subtasks.length ? "▶" : ""; // hide if none
        toggle.title = "Show/Hide subtasks";

        const title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.title;
        title.ondblclick = () => openTaskModal(task.id);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        // Delete button on card
        const delBtn = document.createElement("button");
        delBtn.className = "icon-btn delete-task-btn";
        delBtn.title = "Delete task";
        delBtn.textContent = "🗑";

        // Prevent drag when pressing action buttons
        ["mousedown", "touchstart"].forEach(ev =>
          delBtn.addEventListener(ev, e => e.stopPropagation())
        );

        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          deleteTask(task.id);
        });

        actions.appendChild(delBtn);

        header.appendChild(toggle);
        header.appendChild(title);
        header.appendChild(actions);

        // Subtask list (hidden by default)
        const subList = document.createElement("ul");
        subList.className = "kanban-subtasks hidden";

        if (task.subtasks && task.subtasks.length) {
          task.subtasks.forEach(st => {
            const li = document.createElement("li");
            li.textContent = (st.completed ? "✓ " : "○ ") + st.title;
            subList.appendChild(li);
          });
        }

        // Toggle behavior
        toggle.addEventListener("click", () => {
          if (!task.subtasks || !task.subtasks.length) return;
          const isHidden = subList.classList.contains("hidden");
          if (isHidden) {
            subList.classList.remove("hidden");
            toggle.textContent = "▼";
          } else {
            subList.classList.add("hidden");
            toggle.textContent = "▶";
          }
        });

        // Open modal on double-click anywhere on card body (title already has dblclick)
        card.addEventListener("dblclick", () => openTaskModal(task.id));

        // Drag handlers
        card.addEventListener("dragstart", dragStart);

        card.appendChild(header);
        if (task.subtasks && task.subtasks.length) {
          card.appendChild(subList);
        }

        list.appendChild(card);
      });
  });
}

function dragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.id);
}

// Attach DnD to column lists
document.querySelectorAll(".task-list").forEach(list => {
  list.addEventListener("dragover", e => e.preventDefault());
  list.addEventListener("drop", e => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = e.currentTarget.parentElement.dataset.status;
    if (task.status !== newStatus) {
      task.status = newStatus;
      task.updatedAt = Date.now();
      task.history.push({ action: "moved to " + newStatus, timestamp: Date.now() });
      saveTasks();
      renderKanban();
      renderCalendar();
    }
  });
});

// Global expand/collapse for all cards' subtasks (used by header buttons)
function expandAllSubtasks() {
  document.querySelectorAll(".kanban-subtasks").forEach(ul => ul.classList.remove("hidden"));
  document.querySelectorAll(".task-header .expand-toggle").forEach(t => {
    if (t.textContent) t.textContent = "▼";
  });
}

function collapseAllSubtasks() {
  document.querySelectorAll(".kanban-subtasks").forEach(ul => ul.classList.add("hidden"));
  document.querySelectorAll(".task-header .expand-toggle").forEach(t => {
    if (t.textContent) t.textContent = "▶";
  });
}

