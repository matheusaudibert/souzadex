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

  function render(souzas) {
    var file = new URLSearchParams(window.location.search).get("foto");
    var index = -1;
    for (var i = 0; i < souzas.length; i++) {
      if (souzas[i].file === file) {
        index = i;
        break;
      }
    }

    if (index === -1) {
      detail.innerHTML =
        '<p class="empty">Souza não encontrado. <a href="index.html">Voltar para a Souzadex</a>.</p>';
      return;
    }

    var souza = souzas[index];
    var number = index + 1;
    var title = titleFromFile(souza.file);
    var url = imageUrl(souza.file);

    detail.innerHTML =
      '<article class="card card-detail" data-name="' + title + '">' +
      '  <a class="card-image" href="' + url + '" target="_blank">' +
      '    <img src="' + url + '" alt="' + title + '">' +
      "  </a>" +
      '  <div class="card-info">' +
      '    <h1 class="card-title">' +
      '      <span class="card-number">#' + number + ":</span> " + title +
      "    </h1>" +
      '    <div class="card-actions">' +
      '      <a class="card-download" href="' + url + '" title="Baixar imagem" aria-label="Baixar imagem">' +
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

    var downloadLink = detail.querySelector(".card-download");
    downloadLink.addEventListener("click", function (event) {
      event.preventDefault();
      downloadImage(url, souza.file);
    });
  }

  fetch("/api/souzas")
    .then(function (res) {
      if (!res.ok) throw new Error("status " + res.status);
      return res.json();
    })
    .then(render)
    .catch(function () {
      detail.innerHTML =
        '<p class="empty">Não foi possível carregar o Souza. Tente recarregar a página.</p>';
    });
})();
