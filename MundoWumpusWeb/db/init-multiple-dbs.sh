#!/bin/bash
# =============================================================
# Inicializa múltiples bases de datos en PostgreSQL
# Usada por docker-compose en el primer arranque
# =============================================================

set -e
set -u

function create_user_and_database() {
    local database=$1
    echo "  Creando base de datos '$database'..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
        CREATE DATABASE $database;
        GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRES_USER;
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
    echo "Inicializando múltiples bases de datos: $POSTGRES_MULTIPLE_DATABASES"
    for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
        create_user_and_database $db
    done
    echo "Bases de datos creadas exitosamente."
fi
