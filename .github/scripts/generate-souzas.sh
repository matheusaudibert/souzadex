set -euo pipefail

# Atualização INCREMENTAL do souzas.json:
#   - entradas existentes são preservadas exatamente como estão, na mesma ordem
#     (nunca reatribui autor nem reordena o que já foi registrado)
#   - entradas de imagens que não existem mais são removidas
#   - imagens novas entram sempre no FIM da lista, em ordem de adição no git

kept_json="[]"

if [ -f souzas.json ]; then
  while IFS= read -r entry; do
    file=$(jq -rn --argjson e "$entry" '$e.file')
    [ -z "$file" ] && continue
    # git ls-files em vez de [ -e ]: é case-sensitive mesmo em filesystem
    # case-insensitive (Windows/mac), senão entradas de arquivos renomeados
    # para minúsculo sobrevivem e duplicam.
    if git ls-files --error-unmatch "assets/images/$file" >/dev/null 2>&1; then
      kept_json=$(jq -cn --argjson acc "$kept_json" --argjson e "$entry" '$acc + [$e]')
    fi
  done < <(jq -c '.[]' souzas.json 2>/dev/null)
fi

new_entries=""
shopt -s nullglob nocaseglob
for f in assets/images/*.{jpg,jpeg,png,gif}; do
  base=$(basename "$f")
  if jq -e --arg f "$base" 'map(.file) | index($f) != null' <<<"$kept_json" >/dev/null; then
    continue
  fi
  # --follow rastreia renames: o commit de adição é o do arquivo original,
  # não o do rename — senão quem renomeia vira "autor" de tudo.
  commit=$(git log --follow --diff-filter=A --format=%H -- "$f" | tail -1)
  if [ -z "$commit" ]; then
    continue
  fi
  ts=$(git show -s --format=%ct "$commit")
  # A API resolve o autor do commit para a conta atual: login pode mudar com
  # rename, mas o id é imutável — por isso guardamos os dois.
  author=$(gh api "repos/$GITHUB_REPOSITORY/commits/$commit" --jq '"\(.author.login // "")|\(.author.id // "")"' 2>/dev/null || true)
  login=${author%%|*}
  id=${author##*|}
  if [ -z "$login" ]; then
    login=$(git show -s --format=%an "$commit")
    id=""
  fi
  new_entries+="$ts|$base|$login|$id"$'\n'
done
shopt -u nullglob nocaseglob

new_json="[]"
if [ -n "$new_entries" ]; then
  new_json=$(printf '%s' "$new_entries" | sort -t'|' -k1,1n | while IFS='|' read -r ts file login id; do
    if [ -n "$id" ]; then
      jq -cn --arg file "$file" --arg author "$login" --argjson authorId "$id" \
        '{file: $file, author: $author, authorId: $authorId}'
    else
      jq -cn --arg file "$file" --arg author "$login" \
        '{file: $file, author: $author}'
    fi
  done | jq -cs '.')
fi

jq -n --argjson kept "$kept_json" --argjson new "$new_json" '$kept + $new' > souzas.json

echo "souzas.json gerado:"
cat souzas.json
