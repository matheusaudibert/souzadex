(function () {
  "use strict";

  var list = document.getElementById("ranking-list");

  function render(souzas) {
    var counts = {};
    souzas.forEach(function (souza) {
      var key = souza.authorId ? "id:" + souza.authorId : "name:" + souza.author;
      if (!counts[key]) {
        counts[key] = { author: souza.author, authorId: souza.authorId, count: 0 };
      }
      // mantém o username mais recente do JSON caso o @ tenha mudado entre entradas
      counts[key].author = souza.author;
      counts[key].count++;
    });

    var ranked = Object.keys(counts)
      .map(function (key) { return counts[key]; })
      .sort(function (a, b) { return b.count - a.count; });

    ranked.forEach(function (entry, index) {
      var rank = index + 1;
      var avatarUrl = entry.authorId
        ? "https://avatars.githubusercontent.com/u/" + entry.authorId + "?s=128"
        : "https://github.com/" + entry.author + ".png?size=128";

      var item = document.createElement("div");
      item.className = "ranking-item";
      if (rank === 1) item.classList.add("ranking-item--gold");
      else if (rank === 2) item.classList.add("ranking-item--silver");
      else if (rank === 3) item.classList.add("ranking-item--bronze");

      var label = entry.count === 1 ? "imagem" : "imagens";

      item.innerHTML =
        '<span class="ranking-position">' + rank + '</span>' +
        '<img class="ranking-avatar" src="' + avatarUrl + '" alt="' + entry.author + '" width="48" height="48" loading="lazy">' +
        '<a class="ranking-name" href="https://github.com/' + entry.author + '" target="_blank" rel="noopener">' + entry.author + '</a>' +
        '<span class="ranking-count">' + entry.count + ' ' + label + '</span>';

      list.appendChild(item);
    });
  }

  fetch("/api/souzas")
    .then(function (res) {
      if (!res.ok) throw new Error("status " + res.status);
      return res.json();
    })
    .then(render)
    .catch(function () {
      list.innerHTML = '<p class="empty">Não foi possível carregar o ranking. Tente recarregar a página.</p>';
    });
})();
