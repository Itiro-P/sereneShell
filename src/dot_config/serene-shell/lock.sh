#!/usr/bin/env bash
set -euo pipefail

LOCKER_QML="$HOME/.config/serene-shell/serene-locker.qml"
LOCK_PATTERN="qs -d -p .*serene-locker\.qml"

if pgrep -f "$LOCK_PATTERN" > /dev/null 2>&1; then
    exit 0
fi

setsid -f qs -d -p "$LOCKER_QML" > /dev/null 2>&1
