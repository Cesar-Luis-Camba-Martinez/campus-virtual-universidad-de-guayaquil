const $ = (selector) => document.querySelector(selector);

const FAV_KEY = "cvFavs";
const favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
let activeCampus = "todos";
let query = "";

const norm = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));
const initials = (t) => t.split(/\s+/)
  .filter((w) => w.length > 2).slice(0, 2)
  .map((w) => w[0]).join("").toUpperCase();
const keyOf = (c, f) => `${c.id}|${f.nombre}`;

function visible(c, f) {
  const q = norm(query.trim());
  const matchQuery = !q || norm(f.nombre).includes(q) || norm(c.nombre).includes(q);
  const matchCampus = activeCampus === "todos" || activeCampus === c.id;
  return matchQuery && matchCampus;
}

function renderChips() {
  const options = [{ id: "todos", nombre: "Todos" }, ...CAMPUS_DATA];
  $("#chips").innerHTML = options.map((o) =>
    `<button class="chip ${o.id === activeCampus ? "active" : ""}" data-id="${esc(o.id)}">${esc(o.nombre)}</button>`
  ).join("");
}

function facultyItem(c, f) {
  const key = keyOf(c, f);
  const on = favs.has(key);
  return `
    <li class="fac">
      <span class="avatar">${esc(initials(f.nombre))}</span>
      <a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.nombre)}</a>
      <button class="star ${on ? "on" : ""}" data-key="${esc(key)}"
        aria-label="Marcar como favorita" aria-pressed="${on}">${on ? "★" : "☆"}</button>
    </li>`;
}

function renderCampuses() {
  let shown = 0;
  $("#campusGrid").innerHTML = CAMPUS_DATA.map((c, i) => {
    const facs = c.facultades.filter((f) => visible(c, f));
    if (!facs.length) return "";
    shown += facs.length;
    return `
      <article class="card" style="--delay:${i * 70}ms">
        <div class="card-head">
          <div>
            <h3>${esc(c.nombre)}</h3>
            <small>${facs.length} de ${c.facultades.length} facultades</small>
          </div>
          <a class="go" href="${esc(c.url)}" target="_blank" rel="noopener">Ingresar ↗</a>
        </div>
        <ul>${facs.map((f) => facultyItem(c, f)).join("")}</ul>
      </article>`;
  }).join("");
  $("#empty").classList.toggle("hidden", shown > 0);
}

function renderFavs() {
  const items = [];
  CAMPUS_DATA.forEach((c) =>
    c.facultades.forEach((f) => {
      if (favs.has(keyOf(c, f)) && visible(c, f)) items.push(`<span>${esc(f.nombre)}</span>`);
    })
  );
  $("#favList").innerHTML = items.join("");
  $("#favSection").classList.toggle("hidden", items.length === 0);
}

function renderAll() {
  renderChips();
  renderCampuses();
  renderFavs();
  $("#statFav").textContent = favs.size;
}

function countUp(el, target) {
  const start = performance.now();
  const duration = 900;
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Eventos
document.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (chip) {
    activeCampus = chip.dataset.id;
    renderAll();
    return;
  }
  const star = e.target.closest(".star");
  if (star) {
    const key = star.dataset.key;
    favs.has(key) ? favs.delete(key) : favs.add(key);
    localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
    renderAll();
  }
});

$("#search").addEventListener("input", (e) => {
  query = e.target.value;
  renderCampuses();
  renderFavs();
});

document.addEventListener("keydown", (e) => {
  const search = $("#search");
  if (e.key === "/" && document.activeElement !== search) {
    e.preventDefault();
    search.focus();
  }
  if (e.key === "Escape" && document.activeElement === search) {
    search.value = "";
    query = "";
    renderCampuses();
    renderFavs();
  }
});

$("#themeBtn").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("cvTheme", next);
});

// Inicio
renderAll();
countUp($("#statCampus"), CAMPUS_DATA.length);
countUp($("#statFac"), CAMPUS_DATA.reduce((n, c) => n + c.facultades.length, 0));