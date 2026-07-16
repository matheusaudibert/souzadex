(function () {
  "use strict";

  var STORAGE_KEY = "souzadex-theme";
  var theme;

  try {
    theme = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    theme = null;
  }

  if (theme !== "dark" && theme !== "light") {
    theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  apply(theme);

  function apply(value) {
    document.documentElement.setAttribute("data-theme", value);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;

    updateLabel();

    toggle.addEventListener("click", function () {
      theme = theme === "dark" ? "light" : "dark";
      apply(theme);
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (e) {}
      updateLabel();
    });

    function updateLabel() {
      toggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
      );
    }
  });
})();
