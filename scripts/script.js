(function () {
  "use strict";

  var SIZE_OPTIONS = [20, 40, 60, 80];
  var DEFAULT_SIZE = 20;

  var grid = document.getElementById("grid");
  var pagination = document.getElementById("pagination");
  var searchInput = document.getElementById("search");

  function titleFromFile(file) {
    return file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").toLowerCase();
  }

  // O ID do GitHub é imutável; o username pode mudar com rename da conta.
  function avatarUrl(souza, size) {
    return souza.authorId
      ? "https://avatars.githubusercontent.com/u/" + souza.authorId + "?s=" + size
      : "https://github.com/" + souza.author + ".png?size=" + size;
  }

  // Imagens vêm direto do repo no GitHub, não do build da Vercel: assim uma
  // imagem nova aparece sem precisar de um novo deploy.
  function imageUrl(file) {
    return "https://raw.githubusercontent.com/matheusaudibert/souzadex/main/assets/images/" + encodeURIComponent(file);
  }

  function downloadImage(url, filename) {
    fetch(url)
      .then(function (res) { return res.blob(); })
      .then(function (blob) {
        var objectUrl = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
      });
  }

  // Link cross-origin: o atributo download sozinho não força o save-as,
  // então baixamos via blob.
  var downloadOriginal = document.querySelector(".download-original");
  if (downloadOriginal) {
    downloadOriginal.addEventListener("click", function (event) {
      event.preventDefault();
      downloadImage(imageUrl("original.jpeg"), "original.jpeg");
    });
  }

  // Lê o tamanho da página da URL (?size=N), aceitando só os valores válidos.
  function currentSize() {
    var raw = parseInt(new URLSearchParams(window.location.search).get("size"), 10);
    return SIZE_OPTIONS.indexOf(raw) !== -1 ? raw : DEFAULT_SIZE;
  }

  // Lê o termo de busca da URL (?q=...), normalizado (trim + minúsculo).
  function currentQuery() {
    return (new URLSearchParams(window.location.search).get("q") || "").trim().toLowerCase();
  }

  var pageSize = currentSize();
  var query = currentQuery();

  // Monta a URL preservando tamanho e busca escolhidos (omitindo o que for padrão/vazio).
  function urlFor(page, size, q) {
    var params = new URLSearchParams();
    if (q) params.set("q", q);
    if (size !== DEFAULT_SIZE) params.set("size", size);
    if (page > 1) params.set("page", page);
    var qs = params.toString();
    return qs ? "index.html?" + qs : "index.html";
  }

  function pageHref(page) {
    return urlFor(page, pageSize, query);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function cardHtml(entry) {
    var souza = entry.souza;
    var title = titleFromFile(souza.file);

    return (
      '<article class="card" data-name="' + title + '">' +
      '<a class="card-image" href="souza.html?foto=' + encodeURIComponent(souza.file) + '">' +
      '  <img src="' + imageUrl(souza.file) + '" alt="' + title + '" loading="lazy">' +
      "</a>" +
      '<div class="card-info">' +
      '  <h2 class="card-title">' +
      '    <span class="card-number">#' + entry.number + ":</span> " + title +
      "  </h2>" +
      '  <div class="card-authors">' +
      '    <a href="https://github.com/' + souza.author + '" target="_blank" rel="noopener" title="' + souza.author + '">' +
      '      <img src="' + avatarUrl(souza, 64) + '" alt="' + souza.author + '" width="28" height="28" loading="lazy">' +
      "    </a>" +
      "  </div>" +
      "</div>" +
      "</article>"
    );
  }

  // Constrói a sequência de páginas exibidas, com "..." quando há muitas:
  // ex.: [1, "...", 4, 5, 6, "...", 20]
  function pageTokens(page, total) {
    var delta = 1;
    var tokens = [];
    var range = [];
    for (var i = Math.max(1, page - delta); i <= Math.min(total, page + delta); i++) {
      range.push(i);
    }
    if (range[0] > 1) {
      tokens.push(1);
      if (range[0] > 2) tokens.push("...");
    }
    range.forEach(function (p) { tokens.push(p); });
    var last = range[range.length - 1];
    if (last < total) {
      if (last < total - 1) tokens.push("...");
      tokens.push(total);
    }
    return tokens;
  }

  // Dropdown customizado de tamanho de página: substitui o <select> nativo
  // para permitir a seta girar ao abrir. Escolher um valor navega para a
  // página 1 com ?size=N, preservando a busca (mesmo comportamento de antes).
  function setupSizeDropdown() {
    var root = document.getElementById("page-size");
    if (!root) return;

    var trigger = document.getElementById("page-size-trigger");
    var valueEl = document.getElementById("page-size-value");
    var menu = document.getElementById("page-size-menu");

    valueEl.textContent = pageSize;

    SIZE_OPTIONS.forEach(function (n) {
      var li = document.createElement("li");
      li.setAttribute("role", "option");
      li.setAttribute("data-value", n);
      li.setAttribute("tabindex", "-1");
      li.textContent = n;
      if (n === pageSize) li.setAttribute("aria-selected", "true");
      menu.appendChild(li);
    });

    var options = Array.prototype.slice.call(menu.children);

    function isOpen() {
      return root.classList.contains("open");
    }

    function toggle(open) {
      root.classList.toggle("open", open);
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      menu.hidden = !open;
    }

    function select(value) {
      window.location.href = urlFor(1, parseInt(value, 10), query);
    }

    // Move o foco entre as opções do menu (delta = +1 para baixo, -1 para cima).
    function focusOption(from, delta) {
      var idx = options.indexOf(from);
      var next = idx === -1
        ? (delta > 0 ? 0 : options.length - 1)
        : (idx + delta + options.length) % options.length;
      options[next].focus();
    }

    trigger.addEventListener("click", function () {
      toggle(!isOpen());
      if (isOpen()) {
        var current = menu.querySelector('[aria-selected="true"]') || options[0];
        if (current) current.focus();
      }
    });

    trigger.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle(true);
        var current = menu.querySelector('[aria-selected="true"]') || options[0];
        if (current) current.focus();
      } else if (event.key === "Escape") {
        toggle(false);
      }
    });

    options.forEach(function (li) {
      li.addEventListener("click", function () {
        select(this.getAttribute("data-value"));
      });
      li.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select(this.getAttribute("data-value"));
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          focusOption(this, 1);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          focusOption(this, -1);
        } else if (event.key === "Escape") {
          event.preventDefault();
          toggle(false);
          trigger.focus();
        }
      });
    });

    document.addEventListener("click", function (event) {
      if (isOpen() && !root.contains(event.target)) toggle(false);
    });
  }

  // Todos os cards já com número original, na ordem de exibição (mais recentes
  // primeiro). Preenchido após o fetch; usado como fonte para filtrar.
  var allItems = [];

  // Lê a página da URL (?page=N), limitando ao total informado.
  function currentPage(totalPages) {
    var page = parseInt(new URLSearchParams(window.location.search).get("page"), 10);
    if (isNaN(page) || page < 1) return 1;
    if (page > totalPages) return totalPages;
    return page;
  }

  function renderGrid(items, page) {
    var start = (page - 1) * pageSize;
    var pageItems = items.slice(start, start + pageSize);

    if (!pageItems.length) {
      grid.innerHTML = query
        ? '<p class="empty">Nenhum Souza encontrado para "' + escapeHtml(query) + '".</p>'
        : '<p class="empty">Nenhum Souza por aqui ainda.</p>';
      return;
    }

    grid.innerHTML = pageItems.map(cardHtml).join("");
  }

  function renderPagination(totalPages, page) {
    if (!pagination) return;
    if (totalPages <= 1) {
      pagination.innerHTML = "";
      return;
    }

    var html = "";

    if (page > 1) {
      html += '<a class="page-link page-nav" href="' + pageHref(page - 1) + '" rel="prev">&larr; Anterior</a>';
    } else {
      html += '<span class="page-disabled page-nav">&larr; Anterior</span>';
    }

    pageTokens(page, totalPages).forEach(function (token) {
      if (token === "...") {
        html += '<span class="page-ellipsis">&hellip;</span>';
      } else if (token === page) {
        html += '<span class="page-current" aria-current="page">' + token + "</span>";
      } else {
        html += '<a class="page-link" href="' + pageHref(token) + '">' + token + "</a>";
      }
    });

    if (page < totalPages) {
      html += '<a class="page-link page-nav" href="' + pageHref(page + 1) + '" rel="next">Próximo &rarr;</a>';
    } else {
      html += '<span class="page-disabled page-nav">Próximo &rarr;</span>';
    }

    pagination.innerHTML = html;
  }

  // Filtra pelo nome (título derivado do arquivo) e renderiza grid + paginação.
  function apply() {
    var items = query
      ? allItems.filter(function (item) {
        return titleFromFile(item.souza.file).indexOf(query) !== -1;
      })
      : allItems;

    var totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    var page = currentPage(totalPages);
    renderGrid(items, page);
    renderPagination(totalPages, page);
  }

  // Busca ao vivo: normaliza o termo, volta para a página 1, sincroniza a URL
  // (sem reload) e re-renderiza. Debounce para não filtrar a cada tecla.
  function setupSearch() {
    if (!searchInput) return;

    searchInput.value = query;

    var timer;
    searchInput.addEventListener("input", function () {
      clearTimeout(timer);
      var value = this.value;
      timer = setTimeout(function () {
        query = value.trim().toLowerCase();
        history.replaceState(null, "", urlFor(1, pageSize, query));
        apply();
      }, 200);
    });
  }

  setupSizeDropdown();
  setupSearch();

  fetch("/api/souzas")
    .then(function (res) {
      if (!res.ok) throw new Error("status " + res.status);
      return res.json();
    })
    .then(function (souzas) {
      // souzas está em ordem cronológica; exibimos os mais recentes primeiro,
      // mantendo o número original (posição de chegada) de cada card.
      allItems = souzas.map(function (souza, index) {
        return { souza: souza, number: index + 1 };
      }).reverse();
      apply();
    })
    .catch(function () {
      grid.innerHTML = '<p class="empty">Não foi possível carregar a galeria. Tente recarregar a página.</p>';
    });
})();
