import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'audits.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db;

export function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDB(db);
  }
  return db;
}

export function setDB(customDb) {
  db = customDb;
  if (db) {
    initializeDB(db);
  }
}

function addColumnIfNotExists(db, tableName, columnName, columnDef) {
  try {
    const pragma = db.pragma(`table_info(${tableName})`);
    const exists = pragma.some((col) => col.name === columnName);
    if (!exists) {
      db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
    }
  } catch (e) {
    console.error(`Failed to add column ${columnName} to ${tableName}:`, e.message);
  }
}

/**
 * Sweeps the database for orphaned audits stuck in 'running' state after a crash or restart.
 * @param {import('better-sqlite3').Database} db 
 * @param {number} maxAgeMinutes 
 * @returns {number} Number of recovered audits
 */
export function cleanupStaleAudits(db, maxAgeMinutes = 15) {
  try {
    const stmt = db.prepare(`
      UPDATE audits
      SET status = 'failed', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'running'
        AND datetime(updated_at, '+' || ? || ' minutes') < datetime('now')
    `);
    const result = stmt.run(maxAgeMinutes);
    if (result.changes > 0) {
      console.log(`[Crash Sweeper] Marked ${result.changes} stale/orphaned audit(s) as failed.`);
    }
    return result.changes;
  } catch (err) {
    console.error('[Crash Sweeper] Error during cleanup:', err.message);
    return 0;
  }
}

export function initializeDB(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      keywords TEXT,
      status TEXT DEFAULT 'pending',
      current_stage TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      seo_score INTEGER,
      schema_score INTEGER,
      content_score INTEGER,
      citation_score INTEGER,
      technical_score INTEGER,
      visibility_score INTEGER,
      overall_score INTEGER,
      llms_txt TEXT,
      completed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      url TEXT NOT NULL,
      title TEXT,
      status_code INTEGER,
      type TEXT,
      is_spa INTEGER DEFAULT 0,
      spa_warning TEXT,
      content_rewrite TEXT,
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS seo_issues (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      type TEXT,
      severity TEXT,
      message TEXT,
      page_url TEXT,
      fix_suggestion TEXT,
      generated_fix TEXT,
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS schema_gaps (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      type TEXT,
      importance TEXT,
      message TEXT,
      expected INTEGER,
      actual INTEGER,
      page_url TEXT,
      generated_fix TEXT,
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS citations (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      target_query TEXT,
      source_url TEXT,
      snippet TEXT,
      ai_engine TEXT,
      citation_type TEXT DEFAULT 'not_cited',
      sentiment TEXT DEFAULT 'neutral',
      competitors TEXT,
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS content_scores (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      page_url TEXT NOT NULL,
      first_sentence_answerability INTEGER,
      definition_clarity INTEGER,
      fact_specificity INTEGER,
      scannable_structure INTEGER,
      faq_presence INTEGER,
      citation_readiness INTEGER,
      overall_page_score INTEGER,
      feedback TEXT,
      suggested_improvements TEXT,
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
    );
  `);

  // Ensure backward compatibility if tables already existed
  addColumnIfNotExists(db, 'audits', 'current_stage', "TEXT DEFAULT 'pending'");
  addColumnIfNotExists(db, 'audits', 'technical_score', 'INTEGER');
  addColumnIfNotExists(db, 'audits', 'visibility_score', 'INTEGER');
  addColumnIfNotExists(db, 'pages', 'is_spa', 'INTEGER DEFAULT 0');
  addColumnIfNotExists(db, 'pages', 'spa_warning', 'TEXT');
  addColumnIfNotExists(db, 'pages', 'content_rewrite', 'TEXT');
  addColumnIfNotExists(db, 'schema_gaps', 'page_url', 'TEXT');
  addColumnIfNotExists(db, 'schema_gaps', 'generated_fix', 'TEXT');
  addColumnIfNotExists(db, 'seo_issues', 'fix_suggestion', 'TEXT');
  addColumnIfNotExists(db, 'seo_issues', 'generated_fix', 'TEXT');
  addColumnIfNotExists(db, 'citations', 'citation_type', "TEXT DEFAULT 'not_cited'");
  addColumnIfNotExists(db, 'citations', 'sentiment', "TEXT DEFAULT 'neutral'");
  addColumnIfNotExists(db, 'citations', 'competitors', 'TEXT');

  // Run startup crash recovery sweeper
  cleanupStaleAudits(db);
}

// CRUD operations:
// All are SYNCHRONOUS (no async/await)

export function createAudit(url, keywords) {
  const db = getDB();
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO audits (id, url, keywords, status, current_stage)
    VALUES (@id, @url, @keywords, 'pending', 'pending')
  `);
  
  stmt.run({
    id,
    url,
    keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords
  });
  
  return getAudit(id);
}

export function updateAudit(id, data) {
  const db = getDB();
  const updates = [];
  const params = { id };
  
  for (const [key, value] of Object.entries(data)) {
    updates.push(`${key} = @${key}`);
    params[key] = value;
  }
  
  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  
  if (updates.length > 1) { // >1 because updated_at is always pushed
    const stmt = db.prepare(`
      UPDATE audits
      SET ${updates.join(', ')}
      WHERE id = @id
    `);
    stmt.run(params);
  }
  
  return getAudit(id);
}

export function updateAuditStage(id, stage) {
  return updateAudit(id, { current_stage: stage });
}

export function getAudit(id) {
  const db = getDB();
  const audit = db.prepare('SELECT * FROM audits WHERE id = ?').get(id);
  
  if (!audit) return null;
  
  return {
    ...audit,
    pages: getAuditPages(id),
    seo_issues: getAuditIssues(id),
    schema_gaps: getAuditSchemaGaps(id),
    citations: getAuditCitations(id),
    content_scores: getAuditContentScores(id)
  };
}

export function listAudits(limit = 20) {
  const db = getDB();
  return db.prepare('SELECT * FROM audits ORDER BY created_at DESC LIMIT ?').all(limit);
}

export function addPages(auditId, pages) {
  if (!pages || pages.length === 0) return;
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO pages (id, audit_id, url, title, status_code, type, is_spa, spa_warning)
    VALUES (@id, @audit_id, @url, @title, @status_code, @type, @is_spa, @spa_warning)
  `);
  
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run({
        id: uuidv4(),
        audit_id: auditId,
        url: item.url,
        title: item.title || null,
        status_code: item.statusCode || item.status_code || null,
        type: item.type || null,
        is_spa: item.isSpa ? 1 : 0,
        spa_warning: item.spaWarning || null
      });
    }
  });
  
  insertMany(pages);
}

export function addSEOIssues(auditId, issues) {
  if (!issues || issues.length === 0) return;
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO seo_issues (id, audit_id, type, severity, message, page_url, fix_suggestion, generated_fix)
    VALUES (@id, @audit_id, @type, @severity, @message, @page_url, @fix_suggestion, @generated_fix)
  `);
  
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run({
        id: uuidv4(),
        audit_id: auditId,
        type: item.category || item.type || 'general',
        severity: item.severity || 'info',
        message: item.issue || item.message || '',
        page_url: item.url || item.page_url || null,
        fix_suggestion: item.fixSuggestion || item.fix_suggestion || null,
        generated_fix: item.generatedFix ? (typeof item.generatedFix === 'string' ? item.generatedFix : JSON.stringify(item.generatedFix, null, 2)) : (item.generated_fix || null)
      });
    }
  });
  
  insertMany(issues);
}

export function addSchemaGaps(auditId, gaps) {
  if (!gaps || gaps.length === 0) return;
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO schema_gaps (id, audit_id, type, importance, message, expected, actual, page_url, generated_fix)
    VALUES (@id, @audit_id, @type, @importance, @message, @expected, @actual, @page_url, @generated_fix)
  `);
  
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run({
        id: uuidv4(),
        audit_id: auditId,
        type: item.schemaType || item.type || 'Unknown',
        importance: item.importance || item.status || 'recommended',
        message: item.details || item.message || '',
        expected: item.expected || 0,
        actual: item.actual || 0,
        page_url: item.pageUrl || item.page_url || null,
        generated_fix: item.generatedFix ? (typeof item.generatedFix === 'string' ? item.generatedFix : JSON.stringify(item.generatedFix, null, 2)) : (item.generated_fix || null)
      });
    }
  });
  
  insertMany(gaps);
}

export function addCitations(auditId, citations) {
  if (!citations || citations.length === 0) return;
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO citations (id, audit_id, target_query, source_url, snippet, ai_engine, citation_type, sentiment, competitors)
    VALUES (@id, @audit_id, @target_query, @source_url, @snippet, @ai_engine, @citation_type, @sentiment, @competitors)
  `);
  
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      const compStr = Array.isArray(item.competitors) 
        ? JSON.stringify(item.competitors) 
        : (item.competitorsCited || item.competitors || null);

      stmt.run({
        id: uuidv4(),
        audit_id: auditId,
        target_query: item.keyword || item.target_query || '',
        source_url: item.source_url || item.sourceUrl || null,
        snippet: item.citationContext || item.snippet || null,
        ai_engine: item.engine || item.ai_engine || null,
        citation_type: item.citationType || (item.isCited ? 'grounded_citation' : 'not_cited'),
        sentiment: item.sentiment || 'neutral',
        competitors: compStr
      });
    }
  });
  
  insertMany(citations);
}

export function addContentScores(auditId, scores) {
  if (!scores || scores.length === 0) return;
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO content_scores (
      id, audit_id, page_url, first_sentence_answerability, definition_clarity,
      fact_specificity, scannable_structure, faq_presence, citation_readiness,
      overall_page_score, feedback, suggested_improvements
    ) VALUES (
      @id, @audit_id, @page_url, @first_sentence_answerability, @definition_clarity,
      @fact_specificity, @scannable_structure, @faq_presence, @citation_readiness,
      @overall_page_score, @feedback, @suggested_improvements
    )
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      if (item.error && !item.overallPageScore && !item.scores) continue;
      const feedbackStr = typeof item.feedback === 'object' && item.feedback !== null
        ? JSON.stringify(item.feedback)
        : (item.feedback || '');
      const improvementsStr = Array.isArray(item.suggestedImprovements)
        ? JSON.stringify(item.suggestedImprovements)
        : (typeof item.suggested_improvements === 'string' ? item.suggested_improvements : JSON.stringify(item.suggested_improvements || []));

      stmt.run({
        id: uuidv4(),
        audit_id: auditId,
        page_url: item.url || item.page_url || '',
        first_sentence_answerability: item.scores?.firstSentenceAnswerability ?? item.first_sentence_answerability ?? 0,
        definition_clarity: item.scores?.definitionClarity ?? item.definition_clarity ?? 0,
        fact_specificity: item.scores?.factSpecificity ?? item.fact_specificity ?? 0,
        scannable_structure: item.scores?.scannableStructure ?? item.scannable_structure ?? 0,
        faq_presence: item.scores?.faqPresence ?? item.faq_presence ?? 0,
        citation_readiness: item.scores?.citationReadiness ?? item.citation_readiness ?? 0,
        overall_page_score: item.overallPageScore ?? item.overall_page_score ?? 0,
        feedback: feedbackStr,
        suggested_improvements: improvementsStr
      });
    }
  });

  insertMany(scores);
}

export function addFixes(auditId, fixes) {
  if (!fixes || fixes.length === 0) return;
  const db = getDB();

  const updateSchema = db.prepare(`
    UPDATE schema_gaps
    SET generated_fix = @generated_fix
    WHERE audit_id = @audit_id
      AND (page_url = @page_url OR page_url IS NULL)
      AND (type = @schema_type OR @schema_type IS NULL)
  `);

  const updateSEO = db.prepare(`
    UPDATE seo_issues
    SET generated_fix = @generated_fix
    WHERE audit_id = @audit_id
      AND (page_url = @page_url OR page_url IS NULL)
      AND (type = 'metadata' OR type = 'social' OR @meta_type IS NULL)
  `);

  const updatePage = db.prepare(`
    UPDATE pages
    SET content_rewrite = @content_rewrite
    WHERE audit_id = @audit_id AND url = @page_url
  `);

  const applyFixes = db.transaction((items) => {
    for (const item of items) {
      if (item.type === 'schema') {
        const schemaType = item.fix?.schemaType || null;
        const fixContent = item.fix?.jsonLd || (typeof item.fix === 'string' ? item.fix : JSON.stringify(item.fix, null, 2));
        updateSchema.run({
          generated_fix: fixContent,
          audit_id: auditId,
          page_url: item.pageUrl || null,
          schema_type: schemaType
        });
      } else if (item.type === 'meta') {
        const fixContent = typeof item.fix === 'string' ? item.fix : JSON.stringify(item.fix, null, 2);
        updateSEO.run({
          generated_fix: fixContent,
          audit_id: auditId,
          page_url: item.pageUrl || null,
          meta_type: 'metadata'
        });
      } else if (item.type === 'content_rewrite') {
        const rewriteContent = typeof item.fix === 'string' ? item.fix : JSON.stringify(item.fix, null, 2);
        updatePage.run({
          content_rewrite: rewriteContent,
          audit_id: auditId,
          page_url: item.pageUrl
        });
      }
    }
  });

  applyFixes(fixes);
}

export function getAuditPages(auditId) {
  const db = getDB();
  return db.prepare('SELECT * FROM pages WHERE audit_id = ?').all(auditId);
}

export function getAuditIssues(auditId) {
  const db = getDB();
  return db.prepare('SELECT * FROM seo_issues WHERE audit_id = ?').all(auditId);
}

export function getAuditSchemaGaps(auditId) {
  const db = getDB();
  return db.prepare('SELECT * FROM schema_gaps WHERE audit_id = ?').all(auditId);
}

export function getAuditCitations(auditId) {
  const db = getDB();
  return db.prepare('SELECT * FROM citations WHERE audit_id = ?').all(auditId);
}

export function getAuditContentScores(auditId) {
  const db = getDB();
  return db.prepare('SELECT * FROM content_scores WHERE audit_id = ?').all(auditId);
}
