-- Add League of Legends widget fields to profile table
ALTER TABLE profile 
ADD COLUMN IF NOT EXISTS lol_summoner_name TEXT,
ADD COLUMN IF NOT EXISTS lol_region TEXT DEFAULT 'TR1',
ADD COLUMN IF NOT EXISTS lol_widget_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lol_widget_settings JSONB DEFAULT '{
  "showLastMatches": true,
  "matchCount": 5,
  "showRank": true,
  "showTopChampions": false,
  "showWinrate": true,
  "cardColor": "#7c3aed",
  "accentColor": "#a78bfa"
}'::jsonb;
