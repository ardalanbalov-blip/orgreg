#!/bin/bash
set -e

echo "=== STARTUP DIAGNOSTICS ==="
echo "Date: $(date)"
echo ""

# Test nginx config
echo "--- Testing nginx config ---"
nginx -t 2>&1 || echo "NGINX CONFIG ERROR!"
echo ""

# Show what nginx config is loaded
echo "--- Nginx sites-enabled ---"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "No sites-enabled dir"
echo ""
echo "--- Nginx conf.d ---"
ls -la /etc/nginx/conf.d/ 2>/dev/null || echo "No conf.d dir"
echo ""

# Show our config
echo "--- Our nginx config ---"
cat /etc/nginx/sites-enabled/default 2>/dev/null || echo "No default site config"
echo ""

# Start supervisord
echo "=== Starting supervisord ==="
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
