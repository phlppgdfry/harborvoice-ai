CREATE SCHEMA IF NOT EXISTS harborvoice;
REVOKE ALL ON SCHEMA harborvoice FROM PUBLIC;
CREATE TABLE IF NOT EXISTS harborvoice.migrations(version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS harborvoice.workspace(id integer PRIMARY KEY CHECK(id=1), data jsonb NOT NULL CHECK(jsonb_typeof(data)='object'));
CREATE TABLE IF NOT EXISTS harborvoice.webhook_events(id text PRIMARY KEY, received_at timestamptz NOT NULL DEFAULT now(), payload jsonb NOT NULL);
CREATE INDEX IF NOT EXISTS webhook_retention ON harborvoice.webhook_events(received_at);
CREATE TABLE IF NOT EXISTS harborvoice.revoked_sessions(hash text PRIMARY KEY, expires_at timestamptz NOT NULL);
REVOKE ALL ON ALL TABLES IN SCHEMA harborvoice FROM PUBLIC;
INSERT INTO harborvoice.migrations(version) VALUES(1) ON CONFLICT DO NOTHING;
