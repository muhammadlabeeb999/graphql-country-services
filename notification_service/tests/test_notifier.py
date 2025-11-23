import asyncio
import json
import pytest
import types

# We'll monkeypatch aioredis.from_url and email_client.send_email_async
@pytest.mark.asyncio
async def test_pubsub_message_triggers_email(monkeypatch):
    # fake message that async pubsub.listen() yields
    fake_message = {"type": "message", "data": json.dumps({"event": "country_added", "id": "abc", "name": "Mockland"})}

    class DummyPubSub:
        def __init__(self, messages):
            self._messages = messages
            self._iter = iter(self._messages)

        async def subscribe(self, channel):
            return True

        async def listen(self):
            # simulate async generator
            for m in self._messages:
                yield m

        async def unsubscribe(self, channel):
            return True

    class DummyRedis:
        def __init__(self, messages):
            self._pubsub = DummyPubSub(messages)

        def pubsub(self):
            return self._pubsub

        async def close(self):
            return True

    # monkeypatch aioredis.from_url to return DummyRedis
    def fake_from_url(url, encoding=None, decode_responses=None):
        return DummyRedis([fake_message])

    monkeypatch.setattr("redis.asyncio.from_url", fake_from_url)

    # monkeypatch send_email_async to record calls
    called = {"count": 0, "last": None}

    async def fake_send(subject, body, to_emails):
        called["count"] += 1
        called["last"] = {"subject": subject, "body": body, "to": to_emails}
        return True

    monkeypatch.setattr("email_client.send_email_async", fake_send)

    # Import the handler and run it for one iteration
    from app import handle_pubsub
    stop_event = asyncio.Event()
    # run handler - it will iterate the messages and return
    await handle_pubsub("country_events", stop_event)

    assert called["count"] == 1
    assert "Mockland" in called["last"]["subject"]
