#!/usr/bin/env bash
set -euo pipefail

# setup-cron-example.sh
# Prints example crontab lines and systemd unit for scheduling the payment fallback check script.

FALLBACK_SCRIPT_PATH="/var/www/veilpass/scripts/payment-fallback-check.js"
LOG_PATH="/var/log/veilpass/fallback-check.log"
NODE_BIN="/usr/bin/node"

cat <<'CRON'
# Cron (every 5 minutes) - edit with: crontab -e
*/5 * * * * %NODE_BIN% %FALLBACK_SCRIPT_PATH% >> %LOG_PATH% 2>&1
CRON

echo
cat <<'SYSTEMD'
# systemd service (example) - create /etc/systemd/system/veilpass-fallback.service
[Unit]
Description=VeilPass Payment Fallback Check
After=network.target

[Service]
Type=oneshot
Environment=NODE_ENV=production
ExecStart=%NODE_BIN% %FALLBACK_SCRIPT_PATH%

# systemd timer - create /etc/systemd/system/veilpass-fallback.timer
[Unit]
Description=Run VeilPass Payment Fallback every 5 minutes

[Timer]
OnCalendar=*:0/5
Persistent=true

[Install]
WantedBy=timers.target
SYSTEMD

echo
cat <<'USAGE'
Replace placeholders in the cron/systemd snippets above with actual paths.
Example cron line (with actual paths):
*/5 * * * * /usr/bin/node /var/www/veilpass/scripts/payment-fallback-check.js >> /var/log/veilpass/fallback-check.log 2>&1

To enable systemd timer:
sudo cp ./deploy/veilpass-fallback.service /etc/systemd/system/veilpass-fallback.service
sudo cp ./deploy/veilpass-fallback.timer /etc/systemd/system/veilpass-fallback.timer
sudo systemctl daemon-reload
sudo systemctl enable --now veilpass-fallback.timer
USAGE
