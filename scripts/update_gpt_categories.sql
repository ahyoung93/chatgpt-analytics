-- Update GPT Categories to match OpenAI's actual categories
-- Run this migration to update the category enum

-- First, add the new categories as valid values
ALTER TYPE app_category ADD VALUE IF NOT EXISTS 'writing';
ALTER TYPE app_category ADD VALUE IF NOT EXISTS 'research_analysis';
ALTER TYPE app_category ADD VALUE IF NOT EXISTS 'lifestyle';
ALTER TYPE app_category ADD VALUE IF NOT EXISTS 'dalle';
ALTER TYPE app_category ADD VALUE IF NOT EXISTS 'programming';

-- Note: We're keeping the existing categories for backward compatibility
-- The full list now includes:
-- - writing (NEW - OpenAI category)
-- - productivity (EXISTING - matches OpenAI)
-- - research_analysis (NEW - OpenAI's "Research & Analysis")
-- - education (EXISTING - matches OpenAI)
-- - lifestyle (NEW - OpenAI category)
-- - dalle (NEW - OpenAI's "DALL·E")
-- - programming (NEW - OpenAI category)
-- - travel (EXISTING - legacy)
-- - dev_tools (EXISTING - can map to programming)
-- - shopping (EXISTING - legacy)
-- - entertainment (EXISTING - can map to lifestyle)
-- - customer_support (EXISTING - legacy)
-- - content_generation (EXISTING - can map to writing)
-- - data_analysis (EXISTING - can map to research_analysis)
-- - other (EXISTING - fallback)

COMMENT ON TYPE app_category IS 'GPT categories - includes OpenAI official categories plus legacy categories';
