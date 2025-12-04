#!/bin/bash
# Sync NERC changes to upstream coldfront for local development

NERC_ROOT="/mnt/MOC/coldfront-nerc"
COLDFRONT_ROOT="/mnt/MOC/coldfront"

echo "Syncing NERC changes to upstream coldfront..."

# Sync static files
echo "Copying static files..."
mkdir -p "$COLDFRONT_ROOT/coldfront/static/chartjs"
cp -r "$NERC_ROOT/src/static/chartjs/"* "$COLDFRONT_ROOT/coldfront/static/chartjs/"

mkdir -p "$COLDFRONT_ROOT/coldfront/static/css"
cp -r "$NERC_ROOT/src/static/css/"* "$COLDFRONT_ROOT/coldfront/static/css/"

mkdir -p "$COLDFRONT_ROOT/coldfront/static/js"
cp -r "$NERC_ROOT/src/static/js/"* "$COLDFRONT_ROOT/coldfront/static/js/"

# Sync templates
echo "Copying templates..."
mkdir -p "$COLDFRONT_ROOT/coldfront/core/allocation/templates/allocation"
cp "$NERC_ROOT/src/templates/allocation/allocation_detail.html" "$COLDFRONT_ROOT/coldfront/core/allocation/templates/allocation/allocation_detail.html"

echo "Done! You can now run the dev server:"
echo "cd $COLDFRONT_ROOT"
echo "DEBUG=True python manage.py runserver 0.0.0.0:8000"
