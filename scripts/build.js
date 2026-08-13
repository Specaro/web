#!/usr/bin/env node
// Combines a template.html (with {{tokens}}) and a client config.json into a finished site.
// Usage: node scripts/build.js <template.html> <config.json> <output.html>

const fs = require("fs");
const path = require("path");

function getPath(data, key) {
  if (key === ".") return data["."];
  return key.split(".").reduce((v, k) => (v == null ? undefined : v[k]), data);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Supports {{key}} (escaped), {{{key}}} (raw HTML), and {{#key}}...{{/key}}
// sections that repeat over arrays or render once for a truthy object/value.
function render(template, data) {
  // Sections first (may be nested; backreference ties each close tag to its open tag).
  template = template.replace(/{{#([\w.]+)}}([\s\S]*?){{\/\1}}/g, (_, key, inner) => {
    const value = getPath(data, key);
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          const scope = typeof item === "object" && item !== null ? { ...data, ...item } : { ...data, ".": item };
          return render(inner, scope);
        })
        .join("");
    }
    if (value && typeof value === "object") {
      return render(inner, { ...data, ...value });
    }
    if (value) {
      return render(inner, data);
    }
    return "";
  });

  // Raw (unescaped) triple-brace fields — used sparingly, for content fields
  // that intentionally carry a bit of markup (e.g. an italic accent word).
  template = template.replace(/{{{([\w.]+)}}}/g, (_, key) => {
    const value = getPath(data, key);
    return value === undefined ? "" : String(value);
  });

  // Escaped double-brace fields.
  template = template.replace(/{{([\w.]+)}}/g, (_, key) => {
    const value = getPath(data, key);
    return value === undefined ? "" : escapeHtml(value);
  });

  return template;
}

function main() {
  const [, , templatePath, configPath, outputPath] = process.argv;
  if (!templatePath || !configPath || !outputPath) {
    console.error("Usage: node scripts/build.js <template.html> <config.json> <output.html>");
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf8");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const output = render(template, config);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
  console.log(`Built ${outputPath} from ${templatePath} + ${configPath}`);
}

main();
