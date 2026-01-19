import * as views from "@/lib/views/index.js";

/**
 * Formats a parameter type for documentation display.
 * Handles special array types and converts to readable format.
 *
 * @function formatType
 * @param {Object} param - Parameter definition object
 * @param {string} param.type - Type of the parameter
 * @param {string} [param.of] - Element type for arrays
 * @returns {string} Formatted type string (e.g., "array<string>", "number")
 *
 * @example
 * ```typescript
 * formatType({ type: "array", of: "string" }); // "array<string>"
 * formatType({ type: "number" }); // "number"
 * ```
 */
function formatType(param: any): string {
  if (param.type === "array") {
    return `array<${param.of}>`;
  }
  return param.type;
}

/**
 * Generates Markdown documentation for all database view queries.
 * Creates a formatted table of all available queries, their SQL, and parameters.
 *
 * @function generateDocs
 * @returns {string} Markdown-formatted documentation string containing:
 *   - Organized sections for each view
 *   - SQL query templates
 *   - Parameter tables with types and examples
 *
 * @example
 * ```typescript
 * const docs = generateDocs();
 * console.log(docs); // Prints formatted Markdown documentation
 * ```
 */
function generateDocs() {
  let md = "# Database View Queries\n\n";

  for (const [viewName, queries] of Object.entries(views)) {
    md += `## ${viewName}\n\n`;

    for (const [queryName, query] of Object.entries(queries as Record<string, any>)) {
      md += `### ${queryName}\n\n`;
      md += `${query.description || "No description"}\n\n`;

      md += "**SQL**\n";
      md += "```sql\n" + query.sql.trim() + "\n```\n\n";

      if (query.params && Object.keys(query.params).length > 0) {
        md += "**Parameters**\n\n";
        md += "| Name | Type | Required | Default | Description | Example |\n";
        md += "|------|------|----------|---------|-------------|---------|\n";

        for (const [name, p] of Object.entries(query.params) as [string, any][]) {
          md += `| ${name} | ${formatType(p)} | ${p.required ? "yes" : "no"} | ${
            p.default ?? "-"
          } | ${p.description ?? "-"} | ${
            p.example ? JSON.stringify(p.example) : "-"
          } |\n`;
        }

        md += "\n";
      } else {
        md += "_No parameters_\n\n";
      }
    }
  }

  return md;
}

export = generateDocs;
