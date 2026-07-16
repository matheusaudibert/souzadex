(function () {
  "use strict";

  var SIZE_OPTIONS = [20, 40];
  var DEFAULT_SIZE = 20;

  var grid = document.getElementById("grid");
  var pagination = document.getElementById("pagination");
  var sizeSelect = document.getElementById("page-size");
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

  // SOUZAS está em ordem cronológica; exibimos os mais recentes primeiro, mas
  // mantendo o número original (posição de chegada) de cada card.
  var items = SOUZAS.map(function (souza, index) {
    return { souza: souza, number: index + 1 };
  }).reverse();

  var params = new URLSearchParams(window.location.search);

  // --- Tamanho da página (?size=N), aceitando só os valores válidos. ---
  function currentSize() {
    var raw = parseInt(params.get("size"), 10);
    return SIZE_OPTIONS.indexOf(raw) !== -1 ? raw : DEFAULT_SIZE;
  }

  var pageSize = currentSize();

  // --- Busca (?q=) ---
  // Normaliza para comparar sem diferenciar maiúsculas nem acentos:
  // "palhaco" encontra "palhaço".
  function normalize(text) {
    return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  var query = (params.get("q") || "").trim();

  // filtered/totalPages dependem da busca e do tamanho, então são recalculados
  // sempre que a query muda.
  var filtered = items;
  var totalPages = 1;

  function recompute() {
    var nq = normalize(query);
    filtered = nq
      ? items.filter(function (entry) {
          return normalize(titleFromFile(entry.souza.file)).indexOf(nq) !== -1;
        })
      : items;
    totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  }

  // Lê a página da URL (?page=N), limitando ao intervalo válido.
  function currentPage() {
    var page = parseInt(params.get("page"), 10);
    if (isNaN(page) || page < 1) return 1;
    if (page > totalPages) return totalPages;
    return page;
  }

  // Monta a query string preservando busca e tamanho (omitindo o que for padrão).
  function queryString(page, size, q) {
    var p = new URLSearchParams();
    if (q) p.set("q", q);
    if (size !== DEFAULT_SIZE) p.set("size", size);
    if (page > 1) p.set("page", page);
    var qs = p.toString();
    return qs ? "?" + qs : "";
  }

  function urlFor(page, size, q) {
    return "index.html" + queryString(page, size, q);
  }

  function pageHref(page) {
    return urlFor(page, pageSize, query);
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function cardHtml(entry) {
    var souza = entry.souza;
    var title = titleFromFile(souza.file);

    return (
      '<article class="card" data-name="' + title + '">' +
      '<a class="card-image" href="souza.html?foto=' + encodeURIComponent(souza.file) + '">' +
      '  <img src="assets/images/' + souza.file + '" alt="' + title + '" loading="lazy">' +
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

  function renderGrid(page) {
    var start = (page - 1) * pageSize;
    var pageItems = filtered.slice(start, start + pageSize);

    if (!pageItems.length) {
      grid.innerHTML = query
        ? '<p class="empty">Nenhum Souza encontrado para &ldquo;' + escapeHtml(query) + "&rdquo;.</p>"
        : '<p class="empty">Nenhum Souza por aqui ainda.</p>';
      return;
    }

    grid.innerHTML = pageItems.map(cardHtml).join("");
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

  function renderPagination(page) {
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

  function render(page) {
    renderGrid(page);
    renderPagination(page);
  }

  // Preenche o seletor e volta para a página 1 ao trocar o tamanho, mantendo a busca.
  function setupSizeSelect() {
    if (!sizeSelect) return;

    SIZE_OPTIONS.forEach(function (n) {
      var opt = document.createElement("option");
      opt.value = n;
      opt.textContent = n;
      if (n === pageSize) opt.selected = true;
      sizeSelect.appendChild(opt);
    });

    sizeSelect.addEventListener("change", function () {
      window.location.href = urlFor(1, parseInt(this.value, 10), query);
    });
  }

  // Filtra ao vivo: recalcula, atualiza a URL (?q=, sem recarregar) e volta à página 1.
  function setupSearch() {
    if (!searchInput) return;

    searchInput.value = query;
    searchInput.addEventListener("input", function () {
      query = this.value.trim();
      recompute();
      window.history.replaceState(null, "", window.location.pathname + queryString(1, pageSize, query));
      render(1);
    });
  }

  recompute();
  render(currentPage());
  setupSizeSelect();
  setupSearch();
})();
