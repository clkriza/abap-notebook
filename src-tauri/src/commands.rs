use rusqlite::params;
use uuid::Uuid;
use chrono::Utc;
use slug::slugify;

use crate::db::{open_connection, upsert_fts};
use crate::models::*;

fn json_vec<T: serde::Serialize>(v: &[T]) -> String {
    serde_json::to_string(v).unwrap_or_else(|_| "[]".to_string())
}

fn parse_json_vec<T: serde::de::DeserializeOwned>(s: &str) -> Vec<T> {
    serde_json::from_str(s).unwrap_or_default()
}

fn ensure_unique_slug(conn: &rusqlite::Connection, base: &str, exclude_id: Option<&str>) -> String {
    let mut candidate = base.to_string();
    let mut i = 1;
    loop {
        let exists: bool = match exclude_id {
            Some(id) => conn
                .query_row(
                    "SELECT COUNT(*) FROM entries WHERE slug = ?1 AND id != ?2",
                    params![candidate, id],
                    |r| r.get::<_, i64>(0),
                )
                .unwrap_or(0)
                > 0,
            None => conn
                .query_row(
                    "SELECT COUNT(*) FROM entries WHERE slug = ?1",
                    params![candidate],
                    |r| r.get::<_, i64>(0),
                )
                .unwrap_or(0)
                > 0,
        };
        if !exists {
            return candidate;
        }
        candidate = format!("{}-{}", base, i);
        i += 1;
    }
}

fn get_tags_for_entry(conn: &rusqlite::Connection, entry_id: &str) -> Vec<Tag> {
    let mut stmt = conn
        .prepare(
            "SELECT t.id, t.name FROM tags t
             JOIN entry_tags et ON et.tag_id = t.id
             WHERE et.entry_id = ?1
             ORDER BY t.name",
        )
        .unwrap();
    stmt.query_map(params![entry_id], |r| {
        Ok(Tag {
            id: r.get(0)?,
            name: r.get(1)?,
        })
    })
    .unwrap()
    .filter_map(|r| r.ok())
    .collect()
}

fn get_code_blocks_for_entry(conn: &rusqlite::Connection, entry_id: &str) -> Vec<CodeBlock> {
    let mut stmt = conn
        .prepare(
            "SELECT id, entry_id, label, language, code, description, highlight_lines, position
             FROM code_blocks WHERE entry_id = ?1 ORDER BY position",
        )
        .unwrap();
    stmt.query_map(params![entry_id], |r| {
        let hl_str: String = r.get(6)?;
        Ok(CodeBlock {
            id: r.get(0)?,
            entry_id: r.get(1)?,
            label: r.get(2)?,
            language: r.get(3)?,
            code: r.get(4)?,
            description: r.get(5)?,
            highlight_lines: parse_json_vec(&hl_str),
            position: r.get(7)?,
        })
    })
    .unwrap()
    .filter_map(|r| r.ok())
    .collect()
}

fn get_parameters_for_entry(conn: &rusqlite::Connection, entry_id: &str) -> Vec<Parameter> {
    let mut stmt = conn
        .prepare(
            "SELECT id, entry_id, name, direction, abap_type, optional, default_value, description
             FROM parameters WHERE entry_id = ?1 ORDER BY direction, name",
        )
        .unwrap();
    stmt.query_map(params![entry_id], |r| {
        Ok(Parameter {
            id: r.get(0)?,
            entry_id: r.get(1)?,
            name: r.get(2)?,
            direction: r.get(3)?,
            abap_type: r.get(4)?,
            optional: r.get::<_, i64>(5)? != 0,
            default_value: r.get(6)?,
            description: r.get(7)?,
        })
    })
    .unwrap()
    .filter_map(|r| r.ok())
    .collect()
}

fn sync_tags(conn: &rusqlite::Connection, entry_id: &str, tag_names: &[String]) {
    // Remove old tag associations
    conn.execute("DELETE FROM entry_tags WHERE entry_id = ?1", params![entry_id])
        .ok();

    for name in tag_names {
        let name = name.trim().to_lowercase();
        if name.is_empty() {
            continue;
        }
        // Upsert tag
        let tag_id: String = conn
            .query_row("SELECT id FROM tags WHERE name = ?1", params![name], |r| {
                r.get(0)
            })
            .unwrap_or_else(|_| {
                let id = Uuid::new_v4().to_string();
                conn.execute(
                    "INSERT INTO tags(id, name) VALUES(?1, ?2)",
                    params![id, name],
                )
                .ok();
                id
            });

        conn.execute(
            "INSERT OR IGNORE INTO entry_tags(entry_id, tag_id) VALUES(?1, ?2)",
            params![entry_id, tag_id],
        )
        .ok();
    }
}

// ─── Commands ────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn list_entries(filters: Option<SearchFilters>) -> Result<Vec<EntryListItem>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    let filters = filters.unwrap_or(SearchFilters {
        query: None,
        types: None,
        modules: None,
        statuses: None,
        tags: None,
    });

    // ── Build WHERE clause ────────────────────────────────────────────────
    let mut conditions: Vec<String> = Vec::new();
    let mut search_pattern: Option<String> = None;

    // Full-text search via LIKE across all relevant columns + tags subquery.
    // ?1 is the search pattern (e.g. "%stock%").
    if let Some(ref q) = filters.query {
        let q = q.trim();
        if !q.is_empty() {
            let pattern = format!("%{}%", q.to_lowercase());
            search_pattern = Some(pattern);
            conditions.push(
                "(\
                    LOWER(e.title)                         LIKE ?1 \
                 OR LOWER(COALESCE(e.program_name,''))     LIKE ?1 \
                 OR LOWER(COALESCE(e.package_name,''))     LIKE ?1 \
                 OR LOWER(e.description)                   LIKE ?1 \
                 OR LOWER(e.purpose)                       LIKE ?1 \
                 OR LOWER(e.usage)                         LIKE ?1 \
                 OR LOWER(e.related_tcodes)                LIKE ?1 \
                 OR LOWER(e.dependencies)                  LIKE ?1 \
                 OR EXISTS (\
                     SELECT 1 FROM entry_tags et2 \
                     JOIN tags t2 ON t2.id = et2.tag_id \
                     WHERE et2.entry_id = e.id AND LOWER(t2.name) LIKE ?1\
                 )\
                )"
                .to_string(),
            );
        }
    }

    if let Some(ref types) = filters.types {
        if !types.is_empty() {
            let ph: String = types.iter().map(|t| format!("'{}'", t.replace('\'', "''"))).collect::<Vec<_>>().join(", ");
            conditions.push(format!("e.type IN ({})", ph));
        }
    }
    if let Some(ref modules) = filters.modules {
        if !modules.is_empty() {
            let ph: String = modules.iter().map(|m| format!("'{}'", m.replace('\'', "''"))).collect::<Vec<_>>().join(", ");
            conditions.push(format!("e.module IN ({})", ph));
        }
    }
    if let Some(ref statuses) = filters.statuses {
        if !statuses.is_empty() {
            let ph: String = statuses.iter().map(|s| format!("'{}'", s.replace('\'', "''"))).collect::<Vec<_>>().join(", ");
            conditions.push(format!("e.status IN ({})", ph));
        }
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    // DISTINCT because the tags subquery could cause duplicate rows in edge cases.
    let sql = format!(
        "SELECT DISTINCT e.id, e.type, e.title, e.slug, e.module, e.status, \
                        e.program_name, e.description, e.updated_at
         FROM entries e
         {} ORDER BY e.updated_at DESC",
        where_clause
    );

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;

    // Helper closure to map a row tuple → EntryListItem.
    let map_row = |conn: &rusqlite::Connection,
                   (id, typ, title, slug, module, status, prog, desc, updated_at): (
                       String, String, String, String, String, String,
                       Option<String>, String, String,
                   )| {
        let tags = get_tags_for_entry(conn, &id);
        EntryListItem { id, r#type: typ, title, slug, module, status, program_name: prog, description: desc, tags, updated_at }
    };

    let rows: Vec<EntryListItem> = if let Some(ref pattern) = search_pattern {
        stmt.query_map(params![pattern], |r| {
            Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?,
                r.get(4)?, r.get(5)?, r.get(6)?, r.get(7)?, r.get(8)?))
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .map(|row| map_row(&conn, row))
        .collect()
    } else {
        stmt.query_map([], |r| {
            Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?,
                r.get(4)?, r.get(5)?, r.get(6)?, r.get(7)?, r.get(8)?))
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .map(|row| map_row(&conn, row))
        .collect()
    };

    // Additional in-memory tag filter (exact match, all tags must be present)
    if let Some(ref tag_filter) = filters.tags {
        if !tag_filter.is_empty() {
            let filtered = rows
                .into_iter()
                .filter(|item| {
                    let names: Vec<&str> = item.tags.iter().map(|t| t.name.as_str()).collect();
                    tag_filter.iter().all(|t| names.contains(&t.as_str()))
                })
                .collect();
            return Ok(filtered);
        }
    }

    Ok(rows)
}

#[tauri::command]
pub fn get_entry(id: String) -> Result<Option<Entry>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    let result = conn.query_row(
        "SELECT id, type, title, slug, program_name, package_name, transport_req, sap_release,
                system_id, module, layer, status, description, purpose, usage, related_tcodes,
                dependencies, created_at, updated_at
         FROM entries WHERE id = ?1",
        params![id],
        |r| {
            Ok((
                r.get::<_, String>(0)?, r.get::<_, String>(1)?, r.get::<_, String>(2)?,
                r.get::<_, String>(3)?, r.get::<_, Option<String>>(4)?, r.get::<_, Option<String>>(5)?,
                r.get::<_, Option<String>>(6)?, r.get::<_, Option<String>>(7)?, r.get::<_, Option<String>>(8)?,
                r.get::<_, String>(9)?, r.get::<_, String>(10)?, r.get::<_, String>(11)?,
                r.get::<_, String>(12)?, r.get::<_, String>(13)?, r.get::<_, String>(14)?,
                r.get::<_, String>(15)?, r.get::<_, String>(16)?,
                r.get::<_, String>(17)?, r.get::<_, String>(18)?,
            ))
        },
    );

    match result {
        Ok((id, typ, title, slug, prog, pkg, transport, sap_rel, sys_id, module, layer,
            status, desc, purpose, usage, tcodes_json, deps_json, created_at, updated_at)) => {
            let tags = get_tags_for_entry(&conn, &id);
            let code_blocks = get_code_blocks_for_entry(&conn, &id);
            let parameters = get_parameters_for_entry(&conn, &id);
            Ok(Some(Entry {
                id, r#type: typ, title, slug,
                program_name: prog, package_name: pkg, transport_request: transport,
                sap_release: sap_rel, system_id: sys_id,
                module, layer, status,
                description: desc, purpose, usage,
                related_tcodes: parse_json_vec(&tcodes_json),
                dependencies: parse_json_vec(&deps_json),
                tags, code_blocks, parameters, created_at, updated_at,
            }))
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn create_entry(input: CreateEntryInput) -> Result<Entry, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let base_slug = slugify(&input.title);
    let slug = ensure_unique_slug(&conn, &base_slug, None);
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO entries(id, type, title, slug, program_name, package_name, transport_req,
             sap_release, system_id, module, layer, status, description, purpose, usage,
             related_tcodes, dependencies, created_at, updated_at)
         VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?18)",
        params![
            id, input.r#type, input.title, slug,
            input.program_name, input.package_name, input.transport_request,
            input.sap_release, input.system_id, input.module, input.layer, input.status,
            input.description, input.purpose, input.usage,
            json_vec(&input.related_tcodes), json_vec(&input.dependencies), now
        ],
    )
    .map_err(|e| e.to_string())?;

    sync_tags(&conn, &id, &input.tag_names);
    upsert_fts(&conn, &id).map_err(|e| e.to_string())?;

    get_entry(id)?.ok_or_else(|| "Entry not found after insert".to_string())
}

#[tauri::command]
pub fn update_entry(input: UpdateEntryInput) -> Result<Entry, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    let base_slug = slugify(&input.title);
    let slug = ensure_unique_slug(&conn, &base_slug, Some(&input.id));
    let now = Utc::now().to_rfc3339();

    let rows = conn.execute(
        "UPDATE entries SET type=?2, title=?3, slug=?4, program_name=?5, package_name=?6,
             transport_req=?7, sap_release=?8, system_id=?9, module=?10, layer=?11, status=?12,
             description=?13, purpose=?14, usage=?15, related_tcodes=?16, dependencies=?17,
             updated_at=?18
         WHERE id=?1",
        params![
            input.id, input.r#type, input.title, slug,
            input.program_name, input.package_name, input.transport_request,
            input.sap_release, input.system_id, input.module, input.layer, input.status,
            input.description, input.purpose, input.usage,
            json_vec(&input.related_tcodes), json_vec(&input.dependencies), now
        ],
    )
    .map_err(|e| e.to_string())?;

    if rows == 0 {
        return Err("Entry not found".to_string());
    }

    sync_tags(&conn, &input.id, &input.tag_names);
    upsert_fts(&conn, &input.id).map_err(|e| e.to_string())?;

    get_entry(input.id)?.ok_or_else(|| "Entry not found after update".to_string())
}

#[tauri::command]
pub fn delete_entry(id: String) -> Result<(), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM entries_fts WHERE entry_id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM entries WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn upsert_code_block(input: UpsertCodeBlockInput) -> Result<CodeBlock, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    let id = input.id.unwrap_or_else(|| Uuid::new_v4().to_string());
    let hl_json = json_vec(&input.highlight_lines);

    conn.execute(
        "INSERT INTO code_blocks(id, entry_id, label, language, code, description, highlight_lines, position)
         VALUES(?1,?2,?3,?4,?5,?6,?7,?8)
         ON CONFLICT(id) DO UPDATE SET
             label=excluded.label, language=excluded.language, code=excluded.code,
             description=excluded.description, highlight_lines=excluded.highlight_lines,
             position=excluded.position",
        params![id, input.entry_id, input.label, input.language, input.code,
                input.description, hl_json, input.position],
    )
    .map_err(|e| e.to_string())?;

    // Update entry updated_at
    let now = Utc::now().to_rfc3339();
    conn.execute("UPDATE entries SET updated_at=?1 WHERE id=?2", params![now, input.entry_id]).ok();

    Ok(CodeBlock {
        id,
        entry_id: input.entry_id,
        label: input.label,
        language: input.language,
        code: input.code,
        description: input.description,
        highlight_lines: input.highlight_lines,
        position: input.position,
    })
}

#[tauri::command]
pub fn delete_code_block(id: String) -> Result<(), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM code_blocks WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn upsert_parameter(input: UpsertParameterInput) -> Result<Parameter, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    let id = input.id.unwrap_or_else(|| Uuid::new_v4().to_string());

    conn.execute(
        "INSERT INTO parameters(id, entry_id, name, direction, abap_type, optional, default_value, description)
         VALUES(?1,?2,?3,?4,?5,?6,?7,?8)
         ON CONFLICT(id) DO UPDATE SET
             name=excluded.name, direction=excluded.direction, abap_type=excluded.abap_type,
             optional=excluded.optional, default_value=excluded.default_value,
             description=excluded.description",
        params![id, input.entry_id, input.name, input.direction, input.abap_type,
                input.optional as i64, input.default_value, input.description],
    )
    .map_err(|e| e.to_string())?;

    Ok(Parameter {
        id,
        entry_id: input.entry_id,
        name: input.name,
        direction: input.direction,
        abap_type: input.abap_type,
        optional: input.optional,
        default_value: input.default_value,
        description: input.description,
    })
}

#[tauri::command]
pub fn delete_parameter(id: String) -> Result<(), String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM parameters WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_tags() -> Result<Vec<Tag>, String> {
    let conn = open_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name FROM tags ORDER BY name")
        .map_err(|e| e.to_string())?;
    let tags: Vec<Tag> = stmt
        .query_map([], |r| Ok(Tag { id: r.get(0)?, name: r.get(1)? }))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(tags)
}
