const STORAGE_KEY = 'task-console-tasks-v1';
let scope = 'day';
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

const $ = (selector) => document.querySelector(selector);
const date = new Intl.DateTimeFormat('en-US', { weekday:'long', month:'short', day:'numeric', year:'numeric' }).format(new Date());
$('#sessionDate').textContent = date.toUpperCase();

function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function addTask(text) { const clean = text.trim(); if (!clean) return; tasks.unshift({ id: Date.now(), text: clean, done: false, created: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }); persist(); $('#taskInput').value = ''; render(); }
function render(completedId) {
  const list = $('#taskList'); list.innerHTML = '';
  const visible = tasks.filter(t => scope === 'week' || !t.weekOnly);
  visible.forEach((task, index) => {
    const item = document.createElement('div'); item.className = `task${task.done ? ' done' : ''}${task.id === completedId ? ' completed-now' : ''}`;
    item.style.setProperty('--task-index', index);
    item.innerHTML = `<button class="check-btn" aria-label="Mark task complete">${task.done ? '✓' : ''}</button><div><div class="task-text"></div><div class="task-meta">ADDED ${task.created}</div></div><button class="delete-btn" aria-label="Delete task">×</button>`;
    item.querySelector('.task-text').textContent = task.text;
    item.querySelector('.check-btn').onclick = () => { const completed = !task.done; task.done = !task.done; persist(); render(completed ? task.id : undefined); };
    item.querySelector('.delete-btn').onclick = () => { tasks = tasks.filter(t => t.id !== task.id); persist(); render(); };
    list.appendChild(item);
  });
  $('#emptyState').style.display = visible.length ? 'none' : 'block';
  const done = visible.filter(t => t.done).length;
  $('#totalCount').textContent = visible.length; $('#doneCount').textContent = done; $('#openCount').textContent = visible.length - done;
  $('#progressBar').style.width = visible.length ? `${done / visible.length * 100}%` : '0%';
  $('#listTitle').textContent = scope === 'day' ? "TODAY'S TASKS" : "THIS WEEK'S TASKS";
  $('#scopeDescription').textContent = scope === 'day' ? 'A focused list for today.' : 'A wider view for the week ahead.';
}

document.querySelectorAll('.scope-btn').forEach(btn => btn.onclick = () => { scope = btn.dataset.scope; document.querySelectorAll('.scope-btn').forEach(b => b.classList.toggle('active', b === btn)); render(); });
$('#addTask').onclick = () => addTask($('#taskInput').value);
$('#taskInput').onkeydown = (event) => { if (event.key === 'Enter') addTask(event.target.value); };
document.querySelectorAll('.quick-btn').forEach(btn => btn.onclick = () => addTask(btn.dataset.add));
$('#clearDone').onclick = () => { tasks = tasks.filter(t => !t.done); persist(); render(); };
render();
