use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CodeBlock {
    pub id: String,
    pub entry_id: String,
    pub label: String,
    pub language: String,
    pub code: String,
    pub description: Option<String>,
    pub highlight_lines: Vec<i64>,
    pub position: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Parameter {
    pub id: String,
    pub entry_id: String,
    pub name: String,
    pub direction: String,
    pub abap_type: String,
    pub optional: bool,
    pub default_value: Option<String>,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Entry {
    pub id: String,
    pub r#type: String,
    pub title: String,
    pub slug: String,
    pub program_name: Option<String>,
    pub package_name: Option<String>,
    pub transport_request: Option<String>,
    pub sap_release: Option<String>,
    pub system_id: Option<String>,
    pub module: String,
    pub layer: String,
    pub status: String,
    pub description: String,
    pub purpose: String,
    pub usage: String,
    pub related_tcodes: Vec<String>,
    pub dependencies: Vec<String>,
    pub tags: Vec<Tag>,
    pub code_blocks: Vec<CodeBlock>,
    pub parameters: Vec<Parameter>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EntryListItem {
    pub id: String,
    pub r#type: String,
    pub title: String,
    pub slug: String,
    pub module: String,
    pub status: String,
    pub program_name: Option<String>,
    pub description: String,
    pub tags: Vec<Tag>,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateEntryInput {
    pub r#type: String,
    pub title: String,
    pub program_name: Option<String>,
    pub package_name: Option<String>,
    pub transport_request: Option<String>,
    pub sap_release: Option<String>,
    pub system_id: Option<String>,
    pub module: String,
    pub layer: String,
    pub status: String,
    pub description: String,
    pub purpose: String,
    pub usage: String,
    pub related_tcodes: Vec<String>,
    pub dependencies: Vec<String>,
    pub tag_names: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateEntryInput {
    pub id: String,
    pub r#type: String,
    pub title: String,
    pub program_name: Option<String>,
    pub package_name: Option<String>,
    pub transport_request: Option<String>,
    pub sap_release: Option<String>,
    pub system_id: Option<String>,
    pub module: String,
    pub layer: String,
    pub status: String,
    pub description: String,
    pub purpose: String,
    pub usage: String,
    pub related_tcodes: Vec<String>,
    pub dependencies: Vec<String>,
    pub tag_names: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpsertCodeBlockInput {
    pub id: Option<String>,
    pub entry_id: String,
    pub label: String,
    pub language: String,
    pub code: String,
    pub description: Option<String>,
    pub highlight_lines: Vec<i64>,
    pub position: i64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpsertParameterInput {
    pub id: Option<String>,
    pub entry_id: String,
    pub name: String,
    pub direction: String,
    pub abap_type: String,
    pub optional: bool,
    pub default_value: Option<String>,
    pub description: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchFilters {
    pub query: Option<String>,
    pub types: Option<Vec<String>>,
    pub modules: Option<Vec<String>>,
    pub statuses: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
}
