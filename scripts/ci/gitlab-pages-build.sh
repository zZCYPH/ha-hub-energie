#!/bin/sh
# Shared GitLab Pages build for the marketing site (used by production + beta tag pipelines).
# Usage: CI_COMMIT_TAG=... ./scripts/ci/gitlab-pages-build.sh production|beta
set -eu

TAG="${CI_COMMIT_TAG:?CI_COMMIT_TAG is required}"
MODE="${1:?usage: $0 production|beta}"

case "$MODE" in
  production)
    if ! printf '%s' "$TAG" | grep -qE '^site-v[0-9]+\.[0-9]+\.[0-9]+-[0-9]+$'; then
      echo "pages: unexpected tag ${TAG} (expected site-vX.Y.Z-i matching manifest version)"
      exit 1
    fi
    TAG_VER="$(node -e "const t=process.env.CI_COMMIT_TAG; const m=t.match(/^site-v([0-9]+\\.[0-9]+\\.[0-9]+)-[0-9]+$/); if(!m){process.exit(1)}; process.stdout.write(m[1])")"
    ;;
  beta)
    if ! printf '%s' "$TAG" | grep -qE '^beta-site-v[0-9]+\.[0-9]+\.[0-9]+-[0-9]+$'; then
      echo "pages-beta: unexpected tag ${TAG} (expected beta-site-vX.Y.Z-i)"
      exit 1
    fi
    TAG_VER="$(node -e "const t=process.env.CI_COMMIT_TAG; const m=t.match(/^beta-site-v([0-9]+\\.[0-9]+\\.[0-9]+)-[0-9]+$/); if(!m){process.exit(1)}; process.stdout.write(m[1])")"
    ;;
  *)
    echo "pages: unknown mode ${MODE} (use production or beta)"
    exit 1
    ;;
esac

MANIFEST_VER="$(node -p "JSON.parse(require('fs').readFileSync('custom_components/hub_energie/manifest.json','utf8')).version")"
if [ "$TAG_VER" != "$MANIFEST_VER" ]; then
  echo "pages: tag base version ${TAG_VER} must match manifest.json version ${MANIFEST_VER} (tag ${TAG})"
  exit 1
fi

AUTH_HEADER="JOB-TOKEN: ${CI_JOB_TOKEN}"
SEMVER_TAG="v${MANIFEST_VER}"
REL_ENC="$(printf '%s' "$SEMVER_TAG" | jq -sRr @uri)"
RELEASE_API="${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/releases/${REL_ENC}"
READY=""
for _try in $(seq 1 90); do
  HTTP_CODE="$(curl -sS -o /tmp/gitlab_release.json -w "%{http_code}" \
    --header "${AUTH_HEADER}" "$RELEASE_API")"
  if [ "$HTTP_CODE" = "200" ] && \
     jq -e 'any(.assets.links[]?; (.name // "") | test("^hub-energie-.*\\.zip$"))' \
       /tmp/gitlab_release.json >/dev/null 2>&1; then
    echo "pages: release ${SEMVER_TAG} is ready (ZIP asset present)."
    READY=1
    break
  fi
  echo "pages: waiting for release ${SEMVER_TAG} + ZIP asset (${_try}/90, HTTP ${HTTP_CODE})…"
  sleep 5
done
if [ -z "$READY" ]; then
  echo "pages: timed out waiting for ${SEMVER_TAG}. Push the v*.*.* tag before or with the site tag," \
       "and ensure the job token can read releases (Job token permissions)."
  exit 1
fi

node site/scripts/fetch-releases.mjs
export VITE_SITE_BASE="$(node -e "const u=process.env.CI_PAGES_URL||'';if(!u){process.stdout.write('/');process.exit(0)}try{let p=new URL(u).pathname||'/';if(p!=='/'&&!p.endsWith('/'))p+='/';process.stdout.write(p)}catch{process.stdout.write('/')}")"
(cd site && npm ci && npm run build)
rm -rf public
mkdir -p public
cp -r site/dist/. public/
if [ "${VITE_SITE_BASE:-/}" = "/" ] || [ -z "${VITE_SITE_BASE:-}" ]; then
  printf '%s\n' '/* /index.html 200' > public/_redirects
else
  _b="${VITE_SITE_BASE}"
  _b="${_b%/}"
  printf '%s/* %s/index.html 200\n' "${_b}" "${_b}" > public/_redirects
fi
