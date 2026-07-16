set -euo pipefail

CHANGED=$(git diff --name-only --diff-filter=ACMR "$BASE_SHA...$HEAD_SHA")

if [ -z "$CHANGED" ]; then
  echo "Nenhum arquivo alterado."
  exit 0
fi

fail=0
declare -A new_lower_names

# Nomes já existentes no repo (na base do PR), em minúsculo, pra checar colisão.
existing_lower=$(git ls-tree -r --name-only "$BASE_SHA" -- assets/images \
  | sed 's#.*/##' \
  | tr '[:upper:]' '[:lower:]')

while IFS= read -r f; do
  [ -z "$f" ] && continue

  if [[ "$f" != assets/images/* ]]; then
    echo "::error file=$f,line=1::Este PR só pode alterar arquivos em assets/images/. Remova mudanças em outros arquivos."
    fail=1
    continue
  fi

  base=$(basename "$f")
  ext="${base##*.}"
  ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
  case "$ext_lower" in
    jpg|jpeg|png|gif) ;;
    *)
      echo "::error file=$f,line=1::Formato não aceito (use .jpg, .jpeg, .png ou .gif)."
      fail=1
      continue
      ;;
  esac

  lower=$(echo "$base" | tr '[:upper:]' '[:lower:]')
  if echo "$existing_lower" | grep -qxF "$lower"; then
    # Só é problema se for um arquivo novo colidindo com um já existente
    # (não um PR que está de fato editando o mesmo arquivo).
    if ! git cat-file -e "$BASE_SHA:$f" 2>/dev/null; then
      echo "::error file=$f,line=1::Já existe uma imagem com esse nome (ignorando maiúsculas/minúsculas): $lower"
      fail=1
    fi
  fi

  if [ -n "${new_lower_names[$lower]:-}" ]; then
    echo "::error file=$f,line=1::Duas imagens neste PR têm o mesmo nome (ignorando maiúsculas/minúsculas)."
    fail=1
  fi
  new_lower_names["$lower"]=1
done <<< "$CHANGED"

if [ "$fail" -eq 1 ]; then
  exit 1
fi

echo "Todas as imagens do PR passaram na validação."
