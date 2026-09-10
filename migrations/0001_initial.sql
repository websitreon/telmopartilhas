CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS site_texts (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS site_stats (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS races (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, date TEXT NOT NULL, endDate TEXT, location TEXT, circuit TEXT,
  country TEXT, category TEXT, status TEXT, image TEXT, description TEXT, link TEXT, result TEXT
);
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT, event TEXT, driver TEXT, date TEXT, location TEXT,
  description TEXT, image TEXT, featured INTEGER DEFAULT 0, sort_order INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, logo TEXT, description TEXT, website TEXT, instagram TEXT, facebook TEXT,
  category TEXT, sort_order INTEGER DEFAULT 0, active INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, summary TEXT, content TEXT, date TEXT, category TEXT, image TEXT,
  published INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY, race TEXT, date TEXT, driver TEXT, category TEXT, position TEXT, time TEXT, notes TEXT
);
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY, name TEXT, email TEXT, subject TEXT, message TEXT, created_at TEXT, read INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_races_date ON races(date);
CREATE INDEX IF NOT EXISTS idx_photos_order ON photos(sort_order);
CREATE INDEX IF NOT EXISTS idx_partners_order ON partners(sort_order);
CREATE INDEX IF NOT EXISTS idx_news_date ON news(date);
