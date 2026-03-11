use rusqlite::{Connection, Result, params};
use std::path::PathBuf;

pub fn get_db_path() -> PathBuf {
    let base = dirs::data_dir().unwrap_or_else(|| PathBuf::from("."));
    let dir = base.join("abap-notebook");
    std::fs::create_dir_all(&dir).ok();
    dir.join("notebook.db")
}

pub fn open_connection() -> Result<Connection> {
    let path = get_db_path();
    let conn = Connection::open(path)?;
    conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
    Ok(conn)
}

pub fn run_migrations(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS entries (
            id              TEXT PRIMARY KEY,
            type            TEXT NOT NULL,
            title           TEXT NOT NULL,
            slug            TEXT NOT NULL UNIQUE,
            program_name    TEXT,
            package_name    TEXT,
            transport_req   TEXT,
            sap_release     TEXT,
            system_id       TEXT,
            module          TEXT NOT NULL DEFAULT 'OTHER',
            layer           TEXT NOT NULL DEFAULT 'Application',
            status          TEXT NOT NULL DEFAULT 'Draft',
            description     TEXT NOT NULL DEFAULT '',
            purpose         TEXT NOT NULL DEFAULT '',
            usage           TEXT NOT NULL DEFAULT '',
            related_tcodes  TEXT NOT NULL DEFAULT '[]',
            dependencies    TEXT NOT NULL DEFAULT '[]',
            created_at      TEXT NOT NULL,
            updated_at      TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_entries_type   ON entries(type);
        CREATE INDEX IF NOT EXISTS idx_entries_module ON entries(module);
        CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);

        CREATE TABLE IF NOT EXISTS code_blocks (
            id              TEXT PRIMARY KEY,
            entry_id        TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
            label           TEXT NOT NULL DEFAULT '',
            language        TEXT NOT NULL DEFAULT 'abap',
            code            TEXT NOT NULL DEFAULT '',
            description     TEXT,
            highlight_lines TEXT NOT NULL DEFAULT '[]',
            position        INTEGER NOT NULL DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_code_blocks_entry ON code_blocks(entry_id);

        CREATE TABLE IF NOT EXISTS parameters (
            id              TEXT PRIMARY KEY,
            entry_id        TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
            name            TEXT NOT NULL,
            direction       TEXT NOT NULL,
            abap_type       TEXT NOT NULL DEFAULT '',
            optional        INTEGER NOT NULL DEFAULT 0,
            default_value   TEXT,
            description     TEXT NOT NULL DEFAULT ''
        );

        CREATE INDEX IF NOT EXISTS idx_parameters_entry ON parameters(entry_id);

        CREATE TABLE IF NOT EXISTS tags (
            id   TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS entry_tags (
            entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
            tag_id   TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
            PRIMARY KEY (entry_id, tag_id)
        );

        CREATE VIRTUAL TABLE IF NOT EXISTS entries_fts USING fts5(
            entry_id UNINDEXED,
            title,
            description,
            purpose,
            usage,
            program_name,
            tags_text,
            content='',
            contentless_delete=1
        );
        ",
    )?;
    Ok(())
}

pub fn upsert_fts(conn: &Connection, entry_id: &str) -> Result<()> {
    // Remove old entry from FTS
    conn.execute(
        "DELETE FROM entries_fts WHERE entry_id = ?1",
        params![entry_id],
    )?;

    // Get fresh data and re-insert
    let row: Option<(String, String, String, String, String, Option<String>)> = conn
        .query_row(
            "SELECT id, title, description, purpose, usage, program_name FROM entries WHERE id = ?1",
            params![entry_id],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?, r.get(5)?)),
        )
        .ok();

    if let Some((id, title, desc, purpose, usage, prog)) = row {
        let tags_text: String = {
            let mut stmt = conn.prepare(
                "SELECT t.name FROM tags t JOIN entry_tags et ON et.tag_id = t.id WHERE et.entry_id = ?1",
            )?;
            let names: Vec<String> = stmt
                .query_map(params![&id], |r| r.get(0))?
                .filter_map(|r| r.ok())
                .collect();
            names.join(" ")
        };

        conn.execute(
            "INSERT INTO entries_fts(entry_id, title, description, purpose, usage, program_name, tags_text)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![id, title, desc, purpose, usage, prog.unwrap_or_default(), tags_text],
        )?;
    }

    Ok(())
}
