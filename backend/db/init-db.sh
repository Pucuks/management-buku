set -e

until psql -U postgres -c '\q'; do
  sleep 1
done

# Eksekusi script SQL
psql -U postgres -d management_buku -f /docker-entrypoint-initdb.d/init.sql