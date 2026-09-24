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

function initializeDB(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      keywords TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      seo_score INTEGER,
      schema_score INTEGER,
      content_score INTEGER,
      citation_score INTEGER,
      overall_score INTEGER,
      llms_txt TEXT
    );

    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      url TEXT NOT NULL,
      title TEXT,
      status_code INTEGER,
      type TEXT,
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS seo_issues (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      type TEXT,
      severity TEXT,
      message TEXT,
      page_url TEXT,
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
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS citations (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      target_query TEXT,
      source_url TEXT,
      snippet TEXT,
      ai_engine TEXT,
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
    );
  `);
}

// CRUD operations:
// All are SYNCHRONOUS (no async/await)

export function createAudit(url, keywords) {
  const db = getDB();
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO audits (id, url, keywords)
    VALUES (@id, @url, @keywords)
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

export function getAudit(id) {
  const db = getDB();
  const audit = db.prepare('SELECT * FROM audits WHERE id = ?').get(id);
  
  if (!audit) return null;
  
  return {
    ...audit,
    pages: getAuditPages(id),
    seo_issues: getAuditIssues(id),
    schema_gaps: getAuditSchemaGaps(id),
    citations: getAuditCitations(id)
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
    INSERT INTO pages (id, audit_id, url, title, status_code, type)
    VALUES (@id, @audit_id, @url, @title, @status_code, @type)
  `);
  
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run({
        id: uuidv4(),
        audit_id: auditId,
        url: item.url,
        title: item.title || null,
        status_code: item.status_code || null,
        type: item.type || null
      });
    }
  });
  
  insertMany(pages);
}

export function addSEOIssues(auditId, issues) {
  if (!issues || issues.length === 0) return;
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO seo_issues (id, audit_id, type, severity, message, page_url)
    VALUES (@id, @audit_id, @type, @severity, @message, @page_url)
  `);
  
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run({
        id: uuidv4(),
        audit_id: auditId,
        type: item.type,
        severity: item.severity,
        message: item.message,
        page_url: item.page_url || null
      });
    }
  });
  
  insertMany(issues);
}

export function addSchemaGaps(auditId, gaps) {
  if (!gaps || gaps.length === 0) return;
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO schema_gaps (id, audit_id, type, importance, message, expected, actual)
    VALUES (@id, @audit_id, @type, @importance, @message, @expected, @actual)
  `);
  
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run({
        id: uuidv4(),
        audit_id: auditId,
        type: item.type,
        importance: item.importance,
        message: item.message,
        expected: item.expected || 0,
        actual: item.actual || 0
      });
    }
  });
  
  insertMany(gaps);
}

export function addCitations(auditId, citations) {
  if (!citations || citations.length === 0) return;
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO citations (id, audit_id, target_query, source_url, snippet, ai_engine)
    VALUES (@id, @audit_id, @target_query, @source_url, @snippet, @ai_engine)
  `);
  
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run({
        id: uuidv4(),
        audit_id: auditId,
        target_query: item.target_query,
        source_url: item.source_url,
        snippet: item.snippet || null,
        ai_engine: item.ai_engine || null
      });
    }
  });
  
  insertMany(citations);
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
