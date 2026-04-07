#!/usr/bin/env bash
# Deploy this integration (package under custom_components/hub_energie/) to Home Assistant.
# Same pattern as before: rsync to /tmp, then sudo install (no write perms needed on config/).
#
# Run from the integration root, for example:
#   ./scripts/deploy-integrations.sh
#
# Rsync uses .gitignore plus .deployignore so dev-only paths (.git, tests, pytest, .cursor,
# scripts/, frontend/src & npm metadata, etc.) are not shipped.
#
# Optional env:
#   REMOTE_USER, REMOTE_HOST, REMOTE_CUSTOM_COMPONENTS_DIR
#   SSH_PASSWORD  – used with sshpass if set
#   SUDO_PASSWORD – passed via sudo -S on the server
#   SKIP_BUILD=1  – skip npm build (frontend/dist is normally committed; use to save time on deploy)
#   FORCE_WSL_NPM=1 – always run npm install/build through WSL (Linux Rollup lockfile)
# Best: SSH keys + NOPASSWD sudo for the copy commands.
#
# Frontend: Rollup uses OS-specific optional deps. Running `npm` on Windows rewrites
# package-lock for win32 and breaks Linux builds. When this script runs from Git Bash /
# Windows and `wsl` exists, npm is executed inside WSL unless already in WSL.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MODULE_ROOT="$(cd "$REPO_ROOT/custom_components/hub_energie" && pwd)"
INTEGRATION_NAME="hub_energie"

REMOTE_USER="${REMOTE_USER:-cyph}"
REMOTE_HOST="${REMOTE_HOST:-192.168.5.190}"
REMOTE_CUSTOM_COMPONENTS_DIR="${REMOTE_CUSTOM_COMPONENTS_DIR:-/home/cyph/home-assistant/config/custom_components}"

# Reuse one SSH connection (password asked once when not using keys)
SSH_OPTS="${SSH_OPTS:--o ControlMaster=auto -o ControlPersist=300 -o ControlPath=${HOME}/.ssh/cm-%r@%h:%p}"

REMOTE_STAGING="${REMOTE_STAGING:-/tmp/ha-integrations-staging}"
REMOTE_TARGET="${REMOTE_USER}@${REMOTE_HOST}"

SSH_CMD="ssh"
RSYNC_SSH="ssh"
if [[ -n "${SSH_PASSWORD:-}" ]]; then
  if command -v sshpass &>/dev/null; then
    SSH_CMD="sshpass -e ssh"
    RSYNC_SSH="sshpass -e ssh"
    export SSHPASS="$SSH_PASSWORD"
  else
    echo "Warning: SSH_PASSWORD is set but sshpass not found. Install: apt install sshpass" >&2
  fi
fi

if [[ ! -f "$MODULE_ROOT/manifest.json" ]]; then
  echo "manifest.json not found under $MODULE_ROOT — run this script from the integration package root (scripts/ is inside it)." >&2
  exit 1
fi

_append_exclude_file() {
  local root="$1"
  local path="$2"
  local src="$root/$path"
  [[ -f "$src" ]] || return 0
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    [[ -z "$line" || "$line" == \#* ]] && continue
    [[ "$line" == !* ]] && continue
    printf '%s\n' "$line"
  done < "$src"
}

RSYNC_EXCLUDES_FILE="$(mktemp "${TMPDIR:-/tmp}/hub-energie-deploy-excludes.XXXXXX")"
cleanup_excludes() { rm -f "$RSYNC_EXCLUDES_FILE"; }
trap cleanup_excludes EXIT

{
  _append_exclude_file "$REPO_ROOT" ".gitignore"
  _append_exclude_file "$REPO_ROOT" ".deployignore"
} > "$RSYNC_EXCLUDES_FILE"

echo "=== Deploy $INTEGRATION_NAME -> $REMOTE_TARGET:$REMOTE_CUSTOM_COMPONENTS_DIR ==="

_in_wsl() {
  [[ -n "${WSL_DISTRO_NAME:-}" ]]
}

_wsl_path_from_bash() {
  local dir="$1"
  if [[ "$dir" =~ ^/mnt/[a-zA-Z]/ ]]; then
    printf '%s' "$dir"
    return
  fi
  if [[ "$dir" =~ ^/([a-zA-Z])/(.*)$ ]]; then
    printf '/mnt/%s/%s' "${BASH_REMATCH[1],,}" "${BASH_REMATCH[2]}"
    return
  fi
  printf '%s' "$dir"
}

_should_use_wsl_npm() {
  local frontend_dir="$1"
  if _in_wsl; then
    return 1
  fi
  command -v wsl >/dev/null 2>&1 || return 1
  if [[ "${FORCE_WSL_NPM:-0}" == "1" ]]; then
    return 0
  fi
  # Git Bash / MSYS: /f/projects/... (not already /mnt/...)
  if [[ "$frontend_dir" =~ ^/[a-zA-Z]/ ]] && [[ ! "$frontend_dir" =~ ^/mnt/ ]]; then
    return 0
  fi
  return 1
}

_run_npm_build_frontend() {
  local frontend_dir="$1"

  local use_wsl=0
  if _should_use_wsl_npm "$frontend_dir"; then
    use_wsl=1
  fi

  if [[ "$use_wsl" -eq 1 ]]; then
    local wsl_p
    wsl_p="$(_wsl_path_from_bash "$frontend_dir")"
    echo "   > npm via WSL in $wsl_p"
    # Rollup optional native addon often missing if node_modules came from another OS or a bad npm install.
    wsl -e bash -lc "set -euo pipefail; cd $(printf '%q' "$wsl_p"); \
      if [[ -d node_modules ]] && [[ ! -f node_modules/@rollup/rollup-linux-x64-gnu/package.json ]]; then \
        echo '   > Removing node_modules (Rollup Linux native module missing)'; \
        rm -rf node_modules; \
      fi; \
      if [[ ! -d node_modules ]]; then \
        if [[ -f package-lock.json ]]; then npm ci; else npm install; fi; \
      fi; \
      npm run build"
    return
  fi

  (
    cd "$frontend_dir"
    if [[ -d node_modules ]] && [[ ! -f node_modules/@rollup/rollup-linux-x64-gnu/package.json ]] && command -v uname >/dev/null && [[ "$(uname -s)" == Linux ]]; then
      echo "   > Removing node_modules (Rollup Linux native module missing)"
      rm -rf node_modules
    fi
    if [[ ! -d node_modules ]]; then
      if [[ -f package-lock.json ]]; then
        npm ci
      else
        npm install
      fi
    fi
    npm run build
  )
}

_build_frontend_if_needed() {
  local integration_path="$1"
  local name="$2"
  local frontend_dir="$integration_path/frontend"
  local package_json="$frontend_dir/package.json"
  local dist_boot="$frontend_dir/dist/hub-energie-card-boot.js"
  local dist_js="$frontend_dir/dist/hub-energie-card.js"

  [[ -d "$frontend_dir" ]] || return 0
  [[ -f "$package_json" ]] || return 0

  if [[ "${SKIP_BUILD:-0}" == "1" ]]; then
    echo "   > Build skipped for $name (SKIP_BUILD=1)"
    return 0
  fi

  if ! _should_use_wsl_npm "$frontend_dir"; then
    if ! command -v npm >/dev/null 2>&1; then
      echo "npm is required to build $name frontend but was not found in PATH." >&2
      exit 1
    fi
  fi

  echo "   > Building frontend for $name"
  _run_npm_build_frontend "$frontend_dir"

  if [[ ! -f "$dist_boot" || ! -f "$dist_js" ]]; then
    echo "Build finished for $name but hub-energie-card-boot.js or hub-energie-card.js is missing under dist/." >&2
    exit 1
  fi
}

_install_one() {
  local name="$1"
  if [[ -n "${SUDO_PASSWORD:-}" ]]; then
    printf '%s\n' "$SUDO_PASSWORD" | $SSH_CMD $SSH_OPTS -t "$REMOTE_TARGET" \
      "sudo -S bash -c 'set -e; mkdir -p \"$REMOTE_CUSTOM_COMPONENTS_DIR\"; rm -rf \"$REMOTE_CUSTOM_COMPONENTS_DIR/$name\"; cp -a \"$REMOTE_STAGING/$name\" \"$REMOTE_CUSTOM_COMPONENTS_DIR/\"; rm -rf \"$REMOTE_STAGING/$name\"'"
  else
    $SSH_CMD $SSH_OPTS -t "$REMOTE_TARGET" \
      "sudo bash -c 'set -e; mkdir -p \"$REMOTE_CUSTOM_COMPONENTS_DIR\"; rm -rf \"$REMOTE_CUSTOM_COMPONENTS_DIR/$name\"; cp -a \"$REMOTE_STAGING/$name\" \"$REMOTE_CUSTOM_COMPONENTS_DIR/\"; rm -rf \"$REMOTE_STAGING/$name\"'"
  fi
}

if [[ -z "${SUDO_PASSWORD:-}" ]]; then
  read -r -s -p "Sudo password (server) [leave blank if NOPASSWD]: " SUDO_PASSWORD
  echo
fi

_build_frontend_if_needed "$MODULE_ROOT" "$INTEGRATION_NAME"

echo " - Staging + installing $INTEGRATION_NAME (excludes from .gitignore + .deployignore)"
$SSH_CMD $SSH_OPTS "$REMOTE_TARGET" "mkdir -p '$REMOTE_STAGING/$INTEGRATION_NAME'"
rsync -avz --delete --chmod=F644,D755 -e "$RSYNC_SSH $SSH_OPTS" \
  --exclude-from="$RSYNC_EXCLUDES_FILE" \
  "$MODULE_ROOT/" \
  "$REMOTE_TARGET:$REMOTE_STAGING/$INTEGRATION_NAME/"
_install_one "$INTEGRATION_NAME"

echo "=== Done. Restart Home Assistant to load custom_components changes. ==="
