#!/bin/bash

set -xe

>&2 echo "Waiting for database..."
while ! echo exit | nc $DB_HOST 3306; do sleep 5; done
>&2 echo "Database is up - Starting"

sleep 10

python -m django initial_setup
python -m django register_openstack_attributes

if [[ "$DEBUG" == "True" ]]
then
  python -m django runserver 0.0.0.0:8080
else
  python -m gunicorn coldfront.config.wsgi -b 0.0.0.0:8080
fi
