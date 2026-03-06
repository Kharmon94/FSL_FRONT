#!/bin/sh
set -e
cd /app
PORT=${PORT:-3000}
exec serve -s dist -l "tcp://0.0.0.0:${PORT}"
