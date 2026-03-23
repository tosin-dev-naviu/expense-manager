# Local Development

This repository uses Docker Compose to provide the baseline local services needed by the MVP:

- `web` as a placeholder HTTP container until the real app is added
- `worker` as a placeholder background-process container until the real worker is added
- `postgres` for the primary database
- `redis` for queueing and cache-backed coordination
- `minio` for S3-compatible object storage
- `mailhog` for local SMTP capture and inbox inspection

## Prerequisites

- Docker Desktop or a compatible Docker Engine with Compose support

## Start the stack

```bash
docker compose up --build
```

At this stage, `web` and `worker` are intentionally placeholders so the full local stack can boot before application code exists.

## Service endpoints

- Web app: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- MinIO API: `http://localhost:9000`
- MinIO console: `http://localhost:9001`
- MailHog SMTP: `localhost:1025`
- MailHog UI: `http://localhost:8025`

## Environment

Copy `.env.example` to `.env` when app runtime code begins consuming local configuration directly. The compose file already wires the baseline values into the containers for the current bootstrap phase.

## Basic verification

After startup:

- confirm the `web`, `worker`, `postgres`, `redis`, `minio`, and `mailhog` containers are running
- open the MailHog UI and MinIO console in the browser
- verify the web service is reachable on port `3000`
- verify the worker container stays running without restarting
