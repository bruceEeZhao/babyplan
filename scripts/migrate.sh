#!/bin/sh
set -e

# 等待数据库就绪
i=0
until psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c '\q' >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -gt 30 ]; then
    echo "ERROR: database not ready after 60s" >&2
    exit 1
  fi
  sleep 2
done

# 创建迁移跟踪表（与 Prisma migrate 兼容）
psql -v ON_ERROR_STOP=1 -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c '
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" VARCHAR(36) PRIMARY KEY,
  "checksum" VARCHAR(64) NOT NULL DEFAULT '"'"''"'"',
  "finished_at" TIMESTAMPTZ,
  "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMPTZ,
  "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);' >/dev/null

# 按时间戳顺序应用未执行的迁移
for dir in prisma/migrations/*/; do
  name=$(basename "$dir")
  sql="$dir/migration.sql"
  [ -f "$sql" ] || continue

  applied=$(psql -t -A -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c \
    "SELECT count(*) FROM \"_prisma_migrations\" WHERE \"migration_name\" = '$name'")

  if [ "$applied" = "0" ]; then
    echo "applying migration: $name"
    psql -v ON_ERROR_STOP=1 -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -f "$sql"
    psql -v ON_ERROR_STOP=1 -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c \
      "INSERT INTO \"_prisma_migrations\" (id, \"migration_name\", started_at, finished_at, applied_steps_count) VALUES (md5(random()::text || clock_timestamp()::text), '$name', now(), now(), 1)" >/dev/null
  fi
done

echo "migrations up to date"

# 内容库 seed：仅当内容表为空时执行（幂等）
content_count=$(psql -t -A -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c 'SELECT count(*) FROM "Activity"' 2>/dev/null || echo "0")
if [ "$content_count" = "0" ]; then
  echo "seeding content library..."
  psql -v ON_ERROR_STOP=1 -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -f /app/db-seed/01-content.sql >/dev/null
  echo "content library seeded"
fi
