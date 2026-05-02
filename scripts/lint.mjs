import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { spawnSync } from "node:child_process";

const roots = ["src", "scripts", "test"];
const jsFiles = [];
const textFiles = ["package.json", "index.html", "README.md"];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(path);
    } else if ([".js", ".mjs"].includes(extname(entry.name))) {
      jsFiles.push(path);
      textFiles.push(path);
    } else if ([".css", ".html", ".json", ".md"].includes(extname(entry.name))) {
      textFiles.push(path);
    }
  }
}

for (const root of roots) walk(root);

for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status);
}

const failures = [];
for (const file of textFiles) {
  const contents = readFileSync(file, "utf8");
  if (/[ \t]$/m.test(contents)) failures.push(`${file}: trailing whitespace`);
  if (!contents.endsWith("\n")) failures.push(`${file}: missing final newline`);
}

const appSource = readFileSync("src/app.js", "utf8");
const styleSource = readFileSync("src/styles.css", "utf8");
if (styleSource.includes("images.unsplash.com")) failures.push("src/styles.css: remote hero image is not allowed");
if (appSource.includes("hiddenMarketplaceTemplates")) failures.push("src/app.js: hiddenMarketplaceTemplates dead code returned");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
