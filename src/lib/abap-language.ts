import { StreamLanguage } from "@codemirror/language";

// ABAP keywords grouped by category
const KEYWORDS = new Set([
  // Control flow
  "if", "else", "elseif", "endif", "case", "when", "endcase",
  "do", "enddo", "while", "endwhile", "loop", "endloop",
  "at", "endat", "exit", "continue", "check",
  // Procedures
  "form", "endform", "perform", "function", "endfunction",
  "method", "endmethod", "class", "endclass", "interface", "endinterface",
  "module", "endmodule",
  // Data
  "data", "types", "constants", "field-symbols", "statics", "class-data",
  "parameters", "select-options", "tables", "ranges",
  // OOP
  "create", "object", "instance", "new", "ref", "to",
  "call", "method", "raise", "exception",
  "importing", "exporting", "changing", "returning", "raising", "tables",
  // Database
  "select", "from", "where", "into", "order", "by", "group",
  "having", "up", "client", "specified",
  "insert", "update", "delete", "modify", "commit", "work", "rollback",
  "open", "cursor", "fetch", "close", "endselect",
  // Strings & conversion
  "concatenate", "split", "condense", "translate", "replace", "search",
  "find", "shift", "convert", "write", "move", "assign",
  "describe", "field", "clear", "free", "refresh", "initialize",
  // Internal tables
  "append", "collect", "sort", "read", "table", "with", "key",
  "delete", "insert", "modify", "loop", "at", "endat",
  // Misc
  "report", "program", "include", "type-pools", "load-of-program",
  "and", "or", "not", "in", "between", "like", "is", "initial",
  "eq", "ne", "lt", "gt", "le", "ge",
  "true", "false", "null", "initial",
  "using", "changing", "value", "structure", "reference",
  "abap", "standard", "sorted", "hashed",
  "message", "raising", "no-gap", "separated",
  "sy", "syst", "return", "subrc",
]);

const TYPES = new Set([
  "c", "n", "d", "t", "i", "f", "p", "x", "string", "xstring",
  "char", "numc", "dats", "tims", "int1", "int2", "int4", "int8",
  "fltp", "decfloat16", "decfloat34", "packed", "hex",
  "any", "clike", "numeric", "simple",
]);

export const abapLanguage = StreamLanguage.define({
  name: "abap",
  startState() {
    return { inString: false, inComment: false };
  },
  token(stream, _state) {
    // Line comment (*)
    if (stream.sol() && stream.peek() === "*") {
      stream.skipToEnd();
      return "comment";
    }

    // Inline comment ("")
    if (stream.match('"')) {
      stream.skipToEnd();
      return "comment";
    }

    // String literal (single quotes)
    if (stream.match("'")) {
      while (!stream.eol()) {
        if (stream.next() === "'") break;
      }
      return "string";
    }

    // Backtick string (ABAP 7.4+)
    if (stream.match("`")) {
      while (!stream.eol()) {
        if (stream.next() === "`") break;
      }
      return "string";
    }

    // Numbers
    if (stream.match(/^[0-9]+(\.[0-9]+)?/)) {
      return "number";
    }

    // Identifiers / keywords
    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_\-]*/)) {
      const word = stream.current().toLowerCase();
      if (KEYWORDS.has(word)) return "keyword";
      if (TYPES.has(word)) return "typeName";
      // SAP system variables
      if (word.startsWith("sy-") || word.startsWith("syst-")) return "variableName.special";
      // Class/interface names (heuristic: starts with Z or Y, or uppercase)
      if (/^[zy]/i.test(word) && word.length > 2) return "variableName";
      return null;
    }

    // Operators & punctuation
    if (stream.match(/^[+\-*/<>=!&|.,;:()\[\]{}]/)) {
      return "operator";
    }

    stream.next();
    return null;
  },
});
