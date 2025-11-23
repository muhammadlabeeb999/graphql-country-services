import os
from email.message import EmailMessage
import asyncio
import logging
from typing import List

import aiosmtplib
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("email_client")

EMAIL_FROM = os.getenv("EMAIL_FROM", "admin@usttask.example")
SMTP_HOST = os.getenv("EMAIL_SMTP_HOST", "")
SMTP_PORT = int(os.getenv("EMAIL_SMTP_PORT", 587))
SMTP_USER = os.getenv("EMAIL_SMTP_USER", "")
SMTP_PASS = os.getenv("EMAIL_SMTP_PASS", "")


async def send_email_async(subject: str, body: str, to_emails: List[str]):
    """
    Send a plain-text email asynchronously via SMTP.
    Raises exception on failure.
    """
    if not SMTP_HOST:
        # In dev, if SMTP not configured, just log and return
        logger.warning("SMTP host not configured; skipping actual send. Subject=%s To=%s", subject, to_emails)
        return True

    msg = EmailMessage()
    msg["From"] = EMAIL_FROM
    msg["To"] = ",".join(to_emails)
    msg["Subject"] = subject
    msg.set_content(body)

    logger.info("Connecting to SMTP %s:%s as %s", SMTP_HOST, SMTP_PORT, SMTP_USER or "<anon>")

    await aiosmtplib.send(
        msg,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        username=SMTP_USER or None,
        password=SMTP_PASS or None,
        start_tls=True,
    )
    logger.info("Email sent: Subject=%s To=%s", subject, to_emails)
    return True
