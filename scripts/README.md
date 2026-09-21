# Database backups

`backup-db.sh` dumps the `postgres` container to a gzip-compressed SQL file
and deletes backups older than `RETENTION_DAYS` (default 14).

## One-time setup on the deployment container

```sh
chmod +x scripts/backup-db.sh
crontab -e
```

Add a line to run it daily at 3am (adjust the path to wherever the repo
lives on the container):

```
0 3 * * * cd /root/Roadmap && ./scripts/backup-db.sh >> /var/log/roadmap-backup.log 2>&1
```

Backups land in `/root/backups/roadmap/` by default. Override `BACKUP_DIR`
or `RETENTION_DAYS` as env vars in the crontab line if needed.

## Restoring a backup

```sh
gunzip -c /root/backups/roadmap/roadmap_<timestamp>.sql.gz | \
  docker compose exec -T postgres psql -U roadmap roadmap
```

Restore into an empty database to avoid conflicts with existing rows —
either a fresh container/volume, or `docker compose exec postgres dropdb -U roadmap roadmap && docker compose exec postgres createdb -U roadmap roadmap`
first.

## Recommended: copy backups off the container

These backups live on the same disk as the container. For real disaster
recovery (container/disk failure), periodically copy `/root/backups/` to
somewhere else — e.g. a Proxmox Backup Server job, `rsync` to another
machine, or sync to cloud storage. Not set up yet; do this if the data
matters enough to survive a container loss.
