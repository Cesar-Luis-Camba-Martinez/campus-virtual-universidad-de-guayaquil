// Se ejecuta antes de pintar la página para evitar parpadeos al cargar el tema.
(function () {
  const saved = localStorage.getItem("cvTheme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = saved || (prefersDark ? "dark" : "light");
})();