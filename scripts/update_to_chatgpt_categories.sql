-- Add new ChatGPT categories to app_category enum
ALTER TYPE app_category ADD VALUE IF NOT EXISTS 'writing';
ALTER TYPE app_category ADD VALUE IF NOT EXISTS 'research_analysis';
ALTER TYPE app_category ADD VALUE IF NOT EXISTS 'lifestyle';
ALTER TYPE app_category ADD VALUE IF NOT EXISTS 'dalle';
ALTER TYPE app_category ADD VALUE IF NOT EXISTS 'programming';
