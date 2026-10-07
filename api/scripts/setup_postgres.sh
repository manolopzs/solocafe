#!/bin/bash
set -e

DATA_DIR="$HOME/postgres-data"
LOG_FILE="$HOME/postgres.log"

rm -rf "$DATA_DIR"
mkdir -p "$DATA_DIR"

/usr/lib/postgresql/16/bin/initdb -D "$DATA_DIR" --auth-local trust --auth-host trust --no-instructions

cat >> "$DATA_DIR/postgresql.conf" <<EOF
port = 5433
unix_socket_directories = '$DATA_DIR'
EOF

/usr/lib/postgresql/16/bin/pg_ctl -D "$DATA_DIR" -l "$LOG_FILE" start

/usr/lib/postgresql/16/bin/createdb -O codespace -h "$DATA_DIR" -p 5433 solocafe_development || true
/usr/lib/postgresql/16/bin/createdb -O codespace -h "$DATA_DIR" -p 5433 solocafe_test || true

/usr/lib/postgresql/16/bin/pg_isready -h "$DATA_DIR" -p 5433
