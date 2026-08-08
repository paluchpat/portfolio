#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"
python3 server/hot-reload-server.py
