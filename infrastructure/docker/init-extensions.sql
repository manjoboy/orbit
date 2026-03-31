-- ============================================================================
-- PostgreSQL Extension Initialization
-- ============================================================================
-- Runs on first container start to enable required extensions.
-- ============================================================================

-- Vector similarity search (for embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- Trigram similarity (for fuzzy name matching in entity resolution)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Full-text search (for BM25-style keyword search)
-- Built into PostgreSQL, but we create the config
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS english_unaccent (COPY = english);

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TimescaleDB (for time-series hypertables)
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Row-Level Security helper function
-- Sets the current org context for RLS policies
CREATE OR REPLACE FUNCTION set_current_org(org_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_org_id', org_id::text, false);
END;
$$ LANGUAGE plpgsql;

-- Helper to get current org (used in RLS policies)
CREATE OR REPLACE FUNCTION current_org_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_org_id', true)::UUID;
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Row-Level Security Policies (applied after Prisma migration)
-- ============================================================================
-- These are CREATE'd by a post-migration script since Prisma creates the tables.
-- Template:
--
-- ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE {table_name} FORCE ROW LEVEL SECURITY;
-- CREATE POLICY {table_name}_org_isolation ON {table_name}
--   USING (org_id = current_org_id());
-- ============================================================================
