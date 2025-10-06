-- QSM Database Schema for Document Organization Features
-- Features: Summarization, Smart Grouping, Deduplication

-- ==================================================
-- DOCUMENT SUMMARIES
-- ==================================================
CREATE TABLE IF NOT EXISTS document_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_path TEXT,
  file_hash TEXT, -- SHA256 for deduplication
  file_size INTEGER,
  
  -- Summary data
  short_summary TEXT, -- 2-3 sentences (LLM generated)
  full_summary TEXT, -- Detailed summary
  keywords TEXT, -- JSON array of extracted keywords
  topics TEXT, -- JSON array of detected topics
  language TEXT, -- Detected language (en, vi, etc.)
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX idx_summaries_document ON document_summaries(document_id);
CREATE INDEX idx_summaries_hash ON document_summaries(file_hash);
CREATE INDEX idx_summaries_topics ON document_summaries(topics);

-- ==================================================
-- DOCUMENT CLUSTERS (Smart Grouping)
-- ==================================================
CREATE TABLE IF NOT EXISTS document_clusters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cluster_name TEXT NOT NULL,
  cluster_type TEXT DEFAULT 'content', -- content, date, type, custom
  
  -- Cluster metadata
  description TEXT, -- Auto-generated description
  suggested_folder TEXT, -- Suggested folder structure
  document_count INTEGER DEFAULT 0,
  
  -- Analysis data
  centroid_vector TEXT, -- JSON array of centroid embedding
  avg_similarity REAL, -- Average intra-cluster similarity
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clusters_type ON document_clusters(cluster_type);
CREATE INDEX idx_clusters_name ON document_clusters(cluster_name);

-- ==================================================
-- DOCUMENT-CLUSTER MAPPING
-- ==================================================
CREATE TABLE IF NOT EXISTS document_cluster_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id TEXT NOT NULL,
  cluster_id INTEGER NOT NULL,
  similarity_score REAL, -- How well document fits cluster
  position INTEGER, -- Position in cluster (for ordering)
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (cluster_id) REFERENCES document_clusters(id) ON DELETE CASCADE,
  UNIQUE(document_id, cluster_id)
);

CREATE INDEX idx_cluster_members_doc ON document_cluster_members(document_id);
CREATE INDEX idx_cluster_members_cluster ON document_cluster_members(cluster_id);
CREATE INDEX idx_cluster_members_score ON document_cluster_members(similarity_score DESC);

-- ==================================================
-- DUPLICATE DOCUMENTS
-- ==================================================
CREATE TABLE IF NOT EXISTS document_duplicates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_id TEXT NOT NULL,
  duplicate_id TEXT NOT NULL,
  
  -- Duplicate detection type
  detection_type TEXT DEFAULT 'hash', -- hash, content, fuzzy
  similarity_score REAL, -- 0-1 (1 = exact duplicate)
  
  -- Duplicate details
  hash_match BOOLEAN DEFAULT 0, -- Exact file hash match
  content_match BOOLEAN DEFAULT 0, -- High content similarity
  size_diff INTEGER, -- Size difference in bytes
  
  -- User actions
  status TEXT DEFAULT 'pending', -- pending, keep_original, keep_duplicate, keep_both, deleted
  reviewed BOOLEAN DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  
  FOREIGN KEY (original_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (duplicate_id) REFERENCES documents(id) ON DELETE CASCADE,
  UNIQUE(original_id, duplicate_id)
);

CREATE INDEX idx_duplicates_original ON document_duplicates(original_id);
CREATE INDEX idx_duplicates_duplicate ON document_duplicates(duplicate_id);
CREATE INDEX idx_duplicates_status ON document_duplicates(status);
CREATE INDEX idx_duplicates_score ON document_duplicates(similarity_score DESC);

-- ==================================================
-- FOLDER SUGGESTIONS (Smart Organization)
-- ==================================================
CREATE TABLE IF NOT EXISTS folder_suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Suggestion data
  folder_path TEXT NOT NULL,
  folder_name TEXT NOT NULL,
  parent_folder TEXT,
  
  -- Metadata
  description TEXT, -- AI-generated description
  document_count INTEGER DEFAULT 0,
  confidence_score REAL, -- How confident the AI is (0-1)
  
  -- Category classification
  category TEXT, -- project, archive, reference, work, personal
  tags TEXT, -- JSON array of tags
  
  -- User interaction
  status TEXT DEFAULT 'suggested', -- suggested, accepted, rejected, modified
  applied BOOLEAN DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  applied_at DATETIME
);

CREATE INDEX idx_folder_suggestions_status ON folder_suggestions(status);
CREATE INDEX idx_folder_suggestions_confidence ON folder_suggestions(confidence_score DESC);

-- ==================================================
-- ORGANIZATION TASKS (Auto-move queue)
-- ==================================================
CREATE TABLE IF NOT EXISTS organization_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Task details
  task_type TEXT NOT NULL, -- move, rename, delete, deduplicate
  document_id TEXT NOT NULL,
  
  -- Action details
  source_path TEXT,
  target_path TEXT,
  action_data TEXT, -- JSON with additional action data
  
  -- Task status
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
  priority INTEGER DEFAULT 5, -- 1-10 (10 = highest)
  
  -- Results
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME,
  
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX idx_org_tasks_status ON organization_tasks(status);
CREATE INDEX idx_org_tasks_priority ON organization_tasks(priority DESC, created_at);
CREATE INDEX idx_org_tasks_document ON organization_tasks(document_id);

-- ==================================================
-- VIEWS FOR EASY QUERYING
-- ==================================================

-- View: Documents with summaries
CREATE VIEW IF NOT EXISTS v_documents_with_summaries AS
SELECT 
  d.*,
  s.short_summary,
  s.keywords,
  s.topics,
  s.language
FROM documents d
LEFT JOIN document_summaries s ON d.id = s.document_id;

-- View: Duplicate groups
CREATE VIEW IF NOT EXISTS v_duplicate_groups AS
SELECT 
  dd.original_id,
  COUNT(*) as duplicate_count,
  SUM(CASE WHEN dd.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
  AVG(dd.similarity_score) as avg_similarity
FROM document_duplicates dd
GROUP BY dd.original_id
HAVING duplicate_count > 0;

-- View: Cluster summaries
CREATE VIEW IF NOT EXISTS v_cluster_summaries AS
SELECT 
  c.*,
  COUNT(DISTINCT dcm.document_id) as actual_document_count,
  AVG(dcm.similarity_score) as avg_member_similarity
FROM document_clusters c
LEFT JOIN document_cluster_members dcm ON c.id = dcm.cluster_id
GROUP BY c.id;

-- ==================================================
-- TRIGGERS FOR DATA INTEGRITY
-- ==================================================

-- Update document_count in clusters when members added/removed
CREATE TRIGGER IF NOT EXISTS update_cluster_count_insert
AFTER INSERT ON document_cluster_members
BEGIN
  UPDATE document_clusters
  SET document_count = (
    SELECT COUNT(*) 
    FROM document_cluster_members 
    WHERE cluster_id = NEW.cluster_id
  ),
  updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.cluster_id;
END;

CREATE TRIGGER IF NOT EXISTS update_cluster_count_delete
AFTER DELETE ON document_cluster_members
BEGIN
  UPDATE document_clusters
  SET document_count = (
    SELECT COUNT(*) 
    FROM document_cluster_members 
    WHERE cluster_id = OLD.cluster_id
  ),
  updated_at = CURRENT_TIMESTAMP
  WHERE id = OLD.cluster_id;
END;

-- Update updated_at timestamp on summary changes
CREATE TRIGGER IF NOT EXISTS update_summary_timestamp
AFTER UPDATE ON document_summaries
BEGIN
  UPDATE document_summaries
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- ==================================================
-- SAMPLE QUERIES
-- ==================================================

/*
-- Find all duplicates for a document
SELECT * FROM document_duplicates
WHERE original_id = 'doc_123' AND status = 'pending'
ORDER BY similarity_score DESC;

-- Get documents without summaries
SELECT d.* FROM documents d
LEFT JOIN document_summaries s ON d.id = s.document_id
WHERE s.id IS NULL;

-- Find largest clusters
SELECT * FROM v_cluster_summaries
ORDER BY actual_document_count DESC
LIMIT 10;

-- Get pending organization tasks by priority
SELECT * FROM organization_tasks
WHERE status = 'pending'
ORDER BY priority DESC, created_at ASC;

-- Find exact duplicate files (same hash)
SELECT dd.*, d1.name as original_name, d2.name as duplicate_name
FROM document_duplicates dd
JOIN documents d1 ON dd.original_id = d1.id
JOIN documents d2 ON dd.duplicate_id = d2.id
WHERE dd.hash_match = 1 AND dd.status = 'pending';
*/
