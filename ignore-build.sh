set -eo pipefail
# Semântica da Vercel: exit 0 = pula o build, exit 1 = builda.

if ! git rev-parse HEAD^ >/dev/null 2>&1; then
  echo "Sem commit pai resolvível — buildando por segurança."
  exit 1
fi

CHANGED=$(git diff --name-only HEAD^ HEAD)

if [ -z "$CHANGED" ]; then
  echo "Nenhuma mudança — pulando build."
  exit 0
fi

if echo "$CHANGED" | grep -qvE '^(assets/images/|souzas\.json$)'; then
  echo "Mudança fora do escopo ignorável — buildando:"
  echo "$CHANGED"
  exit 1
fi

echo "Só assets/images/** ou souzas.json mudaram — pulando build:"
echo "$CHANGED"
exit 0
