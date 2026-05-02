import { readFileSync, writeFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { extname, join } from "node:path";

const roots = ["src", "scripts", "test"];
const files = ["package.json", "index.html", "README.md"];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(path);
    } else if ([".js", ".mjs", ".css", ".html", ".json", ".md"].includes(extname(entry.name))) {
      files.push(path);
    }
  }
}

for (const root of roots) walk(root);

for (const file of files) {
  const contents = readFileSync(file, "utf8");
  const formatted = `${contents.replace(/[ \t]+$/gm, "").trimEnd()}\n`;
  if (formatted !== contents) writeFileSync(file, formatted);
}
