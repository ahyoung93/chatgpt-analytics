-- Update categories to match ChatGPT's official categories (excluding Picks)
-- Run this in Supabase SQL Editor

-- Add new ChatGPT categories
ALTER TYPE app_category ADD VALUE IF NOT EXISTS 'writing';
ALTER TYPE app_category ADD VALUE IF NOT EXISTS 'research_analysis';
ALTER TYPE app_category ADD VALUE IF NOT EXISTS 'lifestyle';
ALTER TYPE app_category ADD VALUE IF NOT EXISTS 'dalle';
ALTER TYPE app_category ADD VALUE IF NOT EXISTS 'programming';

-- Note: We cannot remove old enum values in PostgreSQL without recreating the type
-- Old values (travel, dev_tools, shopping, etc.) will remain in the database but won't be used in the app
-- New apps will only use: writing, productivity, research_analysis, education, lifestyle, dalle, programming

COMMENT ON TYPE app_category IS 'ChatGPT official categories: writing, productivity, research_analysis, education, lifestyle, dalle, programming';
