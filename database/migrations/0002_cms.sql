-- Telmo Partilhas CMS: schema normalizado para D1.
-- Mantém app_state para migração segura de versões antigas.
CREATE TABLE IF NOT EXISTS app_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS site_stats (id TEXT PRIMARY KEY, sort_order INTEGER NOT NULL DEFAULT 0, value TEXT NOT NULL, label TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS gallery (id TEXT PRIMARY KEY, title TEXT NOT NULL, event TEXT NOT NULL, driver TEXT NOT NULL, date TEXT NOT NULL, location TEXT NOT NULL, category TEXT NOT NULL, image TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS races (id TEXT PRIMARY KEY, name TEXT NOT NULL, date TEXT NOT NULL, end_date TEXT NOT NULL DEFAULT '', location TEXT NOT NULL, circuit TEXT NOT NULL, country TEXT NOT NULL, category TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'done', image TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', result TEXT NOT NULL DEFAULT '', link TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS results (id TEXT PRIMARY KEY, race TEXT NOT NULL, date TEXT NOT NULL, driver TEXT NOT NULL, category TEXT NOT NULL, position TEXT NOT NULL, time TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS partners (id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, logo TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', website TEXT NOT NULL DEFAULT '', instagram TEXT NOT NULL DEFAULT '', facebook TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS news (id TEXT PRIMARY KEY, title TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '', content TEXT NOT NULL DEFAULT '', date TEXT NOT NULL, category TEXT NOT NULL, image TEXT NOT NULL DEFAULT '', published INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT '', rating INTEGER NOT NULL DEFAULT 5 CHECK(rating BETWEEN 1 AND 5), text TEXT NOT NULL, approved INTEGER NOT NULL DEFAULT 0, featured INTEGER NOT NULL DEFAULT 0, date TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, object_key TEXT UNIQUE NOT NULL, url TEXT NOT NULL, original_name TEXT NOT NULL, mime_type TEXT NOT NULL, media_type TEXT NOT NULL CHECK(media_type IN ('image','video')), size INTEGER NOT NULL, width INTEGER, height INTEGER, duration REAL, alt TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, date TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, subject TEXT NOT NULL DEFAULT '', message TEXT NOT NULL, read INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS audit_log (id TEXT PRIMARY KEY, action TEXT NOT NULL, entity TEXT NOT NULL, entity_id TEXT, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_gallery_date ON gallery(date);
CREATE INDEX IF NOT EXISTS idx_races_date ON races(date);
CREATE INDEX IF NOT EXISTS idx_results_date ON results(date);
CREATE INDEX IF NOT EXISTS idx_news_date ON news(date);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved, featured);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(media_type, status);
CREATE INDEX IF NOT EXISTS idx_messages_date ON messages(date);
