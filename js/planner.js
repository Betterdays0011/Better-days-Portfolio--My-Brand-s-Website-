/* ==========================================================================
   planner.js - Academic Planner
   A small task manager built with plain JavaScript.

   How it works
   - All tasks live in one array of objects called `tasks`.
   - Every change (add, tick, delete, clear) updates that array first, saves it
     to the browser's localStorage, then calls render() to redraw the list.
   - render() builds the list items with the DOM (createElement), so the page
     updates instantly without reloading.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'bde-planner-v1';

  // --- Page elements ---------------------------------------------------------
  var form = document.getElementById('task-form');
  var titleInput = document.getElementById('task-title');
  var categoryInput = document.getElementById('task-category');
  var dueInput = document.getElementById('task-due');
  var titleError = document.getElementById('task-title-error');
  var listEl = document.getElementById('task-list');
  var emptyEl = document.getElementById('empty-state');
  var progressText = document.getElementById('progress-text');
  var progressCount = document.getElementById('progress-count');
  var progressBar = document.getElementById('progress-bar');
  var progressTrack = document.getElementById('progress-track');
  var clearBtn = document.getElementById('clear-completed');
  var filterButtons = document.querySelectorAll('[data-filter]');
  var liveRegion = document.getElementById('planner-status');

  if (!form || !listEl) return; // not on the planner page

  // --- State ------------------------------------------------------------------
  var tasks = [];          // the array that holds every task object
  var currentFilter = 'all'; // 'all' | 'active' | 'completed'
  var newestId = null;     // used to animate a freshly added task

  // --- Helpers ------------------------------------------------------------------
  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function todayISO(offsetDays) {
    var d = new Date();
    d.setDate(d.getDate() + (offsetDays || 0));
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + month + '-' + day;
  }

  // Turns "2026-10-15" into "Thu 15 Oct". Dates are built from their parts so
  // the browser's time zone cannot shift the day.
  function formatDue(iso) {
    var parts = iso.split('-');
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function announce(message) {
    if (liveRegion) liveRegion.textContent = message;
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // --- Storage ------------------------------------------------------------------
  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      // Private browsing can block storage. The planner still works for this visit.
    }
  }

  function sampleTasks() {
    return [
      { id: makeId(), title: 'Submit the COS 106 term project', category: 'Assignment', due: todayISO(3), done: false },
      { id: makeId(), title: 'Plan the next physics lesson on stress and strain', category: 'Better Days Education', due: todayISO(1), done: false },
      { id: makeId(), title: 'Revise cybersecurity notes', category: 'Study session', due: todayISO(5), done: false }
    ];
  }

  function loadTasks() {
    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      saved = null;
    }
    if (saved === null) {
      tasks = sampleTasks(); // first visit: show a few examples
      saveTasks();
      return;
    }
    try {
      var parsed = JSON.parse(saved);
      tasks = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      tasks = [];
    }
  }

  // --- Task actions ---------------------------------------------------------------
  function addTask(title, category, due) {
    var task = { id: makeId(), title: title, category: category, due: due, done: false };
    tasks.push(task);
    newestId = task.id;
    saveTasks();
    render();
    announce('Task added: ' + title);
  }

  function toggleTask(id) {
    tasks.forEach(function (task) {
      if (task.id === id) task.done = !task.done;
    });
    saveTasks();
    render();
  }

  function deleteTask(id) {
    var removed = tasks.filter(function (task) { return task.id === id; })[0];
    tasks = tasks.filter(function (task) { return task.id !== id; });
    saveTasks();
    render();
    if (removed) announce('Task deleted: ' + removed.title);
  }

  function clearCompleted() {
    var count = tasks.filter(function (task) { return task.done; }).length;
    if (count === 0) return;
    tasks = tasks.filter(function (task) { return !task.done; });
    saveTasks();
    render();
    announce(count + (count === 1 ? ' completed task cleared' : ' completed tasks cleared'));
  }

  function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-filter') === filter));
    });
    render();
  }

  // --- Reading the array ------------------------------------------------------------
  // Open tasks first (earliest due date first, undated last), finished tasks last.
  function sortedTasks() {
    return tasks.slice().sort(function (a, b) {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.due && b.due) return a.due < b.due ? -1 : a.due > b.due ? 1 : 0;
      if (a.due) return -1;
      if (b.due) return 1;
      return 0;
    });
  }

  function visibleTasks() {
    return sortedTasks().filter(function (task) {
      if (currentFilter === 'active') return !task.done;
      if (currentFilter === 'completed') return task.done;
      return true;
    });
  }

  // --- Drawing the page ---------------------------------------------------------------
  function buildTaskItem(task) {
    var li = document.createElement('li');
    li.className = 'task' + (task.done ? ' is-done' : '');
    li.setAttribute('data-id', task.id);
    if (task.id === newestId) {
      li.classList.add('is-new');
      newestId = null;
    }

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'check-' + task.id;
    checkbox.checked = task.done;

    var body = document.createElement('div');
    var label = document.createElement('label');
    label.setAttribute('for', checkbox.id);
    label.textContent = task.title;

    var meta = document.createElement('div');
    meta.className = 'task-meta';

    var badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = task.category;
    meta.appendChild(badge);

    if (task.due) {
      var due = document.createElement('span');
      due.textContent = 'Due ' + formatDue(task.due);
      meta.appendChild(due);
      if (!task.done && task.due < todayISO(0)) {
        var late = document.createElement('span');
        late.className = 'badge badge--late';
        late.textContent = 'Overdue';
        meta.appendChild(late);
      }
    }

    body.appendChild(label);
    body.appendChild(meta);

    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'task-delete';
    del.textContent = 'Delete';
    del.setAttribute('data-action', 'delete');
    del.setAttribute('aria-label', 'Delete task: ' + task.title);

    li.appendChild(checkbox);
    li.appendChild(body);
    li.appendChild(del);
    return li;
  }

  function updateProgress() {
    var total = tasks.length;
    var done = tasks.filter(function (task) { return task.done; }).length;
    var percent = total === 0 ? 0 : Math.round((done / total) * 100);
    progressText.textContent = total === 0 ? 'No tasks yet' : done + ' of ' + total + ' done';
    progressCount.textContent = percent + '%';
    progressBar.style.width = percent + '%';
    progressTrack.setAttribute('aria-valuenow', String(percent));
    clearBtn.disabled = done === 0;
  }

  function updateEmptyState(visibleCount) {
    var title = emptyEl.querySelector('strong');
    var text = emptyEl.querySelector('span');
    if (tasks.length === 0) {
      title.textContent = 'Your planner is empty';
      text.textContent = 'Add your first task using the form.';
    } else if (currentFilter === 'completed') {
      title.textContent = 'Nothing completed yet';
      text.textContent = 'Tick a task when it is done and it will appear here.';
    } else {
      title.textContent = 'All caught up';
      text.textContent = 'There are no open tasks. Add a new one when you are ready.';
    }
    emptyEl.hidden = visibleCount !== 0;
  }

  function render() {
    var visible = visibleTasks();
    listEl.textContent = ''; // clear the old list
    visible.forEach(function (task) {
      listEl.appendChild(buildTaskItem(task));
    });
    updateEmptyState(visible.length);
    updateProgress();
  }

  // --- Events -------------------------------------------------------------------------
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var title = titleInput.value.trim();

    if (title === '') {
      titleError.textContent = 'Enter a task before adding it.';
      titleInput.setAttribute('aria-invalid', 'true');
      titleInput.focus();
      return;
    }

    titleError.textContent = '';
    titleInput.removeAttribute('aria-invalid');
    addTask(title, categoryInput.value, dueInput.value);
    form.reset();
    titleInput.focus();
  });

  titleInput.addEventListener('input', function () {
    if (titleInput.value.trim() !== '') {
      titleError.textContent = '';
      titleInput.removeAttribute('aria-invalid');
    }
  });

  // One listener on the list handles every checkbox and delete button (event delegation).
  listEl.addEventListener('change', function (event) {
    var item = event.target.closest('.task');
    if (item && event.target.type === 'checkbox') toggleTask(item.getAttribute('data-id'));
  });

  listEl.addEventListener('click', function (event) {
    var button = event.target.closest('[data-action="delete"]');
    if (!button) return;
    var item = button.closest('.task');
    var id = item.getAttribute('data-id');
    if (reducedMotion()) {
      deleteTask(id);
    } else {
      item.classList.add('is-leaving'); // slide out first, then remove
      window.setTimeout(function () { deleteTask(id); }, 240);
    }
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      setFilter(button.getAttribute('data-filter'));
    });
  });

  clearBtn.addEventListener('click', clearCompleted);

  // --- Start --------------------------------------------------------------------------
  loadTasks();
  render();
})();
