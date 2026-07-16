(function () {
  "use strict";

  var detail = document.getElementById("detail");

  function titleFromFile(file) {
    return file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").toLowerCase();
  }

  // O ID do GitHub é imutável; o username pode mudar com rename da conta.
  function avatarUrl(souza, size) {
    return souza.authorId
      ? "https://avatars.githubusercontent.com/u/" + souza.authorId + "?s=" + size
      : "https://github.com/" + souza.author + ".png?size=" + size;
  }

  var file = new URLSearchParams(window.location.search).get("foto");
  var index = -1;
  for (var i = 0; i < SOUZAS.length; i++) {
    if (SOUZAS[i].file === file) {
      index = i;
      break;
    }
  }

  if (index === -1) {
    detail.innerHTML =
      '<p class="empty">Souza não encontrado. <a href="index.html">Voltar para a Souzadex</a>.</p>';
    return;
  }

  var souza = SOUZAS[index];
  var number = index + 1;
  var title = titleFromFile(souza.file);

  detail.innerHTML =
    '<article class="card card-detail" data-name="' + title + '">' +
    '  <a class="card-image" href="assets/images/' + souza.file + '" target="_blank">' +
    '    <img src="assets/images/' + souza.file + '" alt="' + title + '">' +
    "  </a>" +
    '  <div class="card-info">' +
    '    <h1 class="card-title">' +
    '      <span class="card-number">#' + number + ":</span> " + title +
    "    </h1>" +
    '    <div class="card-actions">' +
    '      <a class="card-download" href="assets/images/' + souza.file + '" download title="Baixar imagem" aria-label="Baixar imagem">' +
    '        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">' +
    '          <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"/>' +
    '          <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"/>' +
    "        </svg>" +
    "      </a>" +
    '      <div class="card-authors">' +
    '        <a href="https://github.com/' + souza.author + '" target="_blank" rel="noopener" title="' + souza.author + '">' +
    '          <img src="' + avatarUrl(souza, 96) + '" alt="' + souza.author + '" width="36" height="36">' +
    "        </a>" +
    "      </div>" +
    "    </div>" +
    "  </div>" +
    "</article>";
})();