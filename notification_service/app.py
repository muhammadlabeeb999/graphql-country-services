"""
Notifier service - FastAPI app that listens on Redis pub/sub channel `country_events`
and sends email notifications to admin emails when a 'country_added' event occurs.

Environment variables used (read from root .env when running in docker-compose):
- REDIS_URL
- EMAIL_FROM
- EMAIL_SMTP_HOST
- EMAIL_SMTP_PORT
- EMAIL_SMTP_USER
- EMAIL_SMTP_PASS
- ADMIN_EMAILS (comma separated)
"""

import os
import asyncio
import json
import logging
from typing import List, Optional

from fastapi import FastAPI
from dotenv import load_dotenv

# load .env if present (helps local dev)
load_dotenv()

from email_client import send_email_async

import redis.asyncio as aioredis

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("notifier")

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
ADMIN_EMAILS = os.getenv("ADMIN_EMAILS", "admin@usttask.example").split(",")
CHANNEL = "country_events"


async def handle_pubsub(channel_name: str, stop_event: asyncio.Event):
    """
    Subscribe to Redis pubsub channel and process messages until stop_event is set.
    """
    logger.info("Connecting to Redis at %s", REDIS_URL)
    redis = aioredis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)
    pubsub = redis.pubsub()
    await pubsub.subscribe(channel_name)
    logger.info("Subscribed to channel: %s", channel_name)

    try:
        async for message in pubsub.listen():
            if stop_event.is_set():
                break
            if not message:
                continue
            # message is a dict like: {'type': 'message', 'pattern': None, 'channel': 'country_events', 'data': '...'}
            if message.get("type") != "message":
                continue
            data = message.get("data")
            try:
                payload = json.loads(data)
            except Exception:
                logger.exception("Invalid JSON payload: %s", data)
                continue

            event = payload.get("event")
            if event == "country_added":
                country_name = payload.get("name", "Unknown")
                country_id = payload.get("id", "")
                subject = f"[UST] Country added: {country_name}"
                body = f"A country was added.\n\nName: {country_name}\nID: {country_id}\n\nThis is an automated notification."
                logger.info("Sending email for country_added: %s", country_name)
                try:
                    await send_email_async(
                        subject=subject,
                        body=body,
                        to_emails=ADMIN_EMAILS,
                    )
                except Exception:
                    logger.exception("Failed to send notification email for %s", country_name)
    finally:
        try:
            await pubsub.unsubscribe(channel_name)
        except Exception:
            pass
        try:
            await redis.close()
        except Exception:
            pass
        logger.info("Pubsub listener stopped")

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    app.state._stop_event = asyncio.Event()
    app.state._pubsub_task = asyncio.create_task(handle_pubsub(CHANNEL, app.state._stop_event))
    logger.info("Notifier background task started")
    yield
    # shutdown
    logger.info("Shutting down notifier background task")
    app.state._stop_event.set()
    try:
        await asyncio.wait_for(app.state._pubsub_task, timeout=5.0)
    except Exception:
        app.state._pubsub_task.cancel()

app = FastAPI(title="UST Notifier", lifespan=lifespan)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "notifier"}
