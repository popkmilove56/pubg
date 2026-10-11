import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const publicDirectory = path.resolve(scriptDirectory, "../public");
const assetDirectory = path.join(publicDirectory, "admin-assets");
const managerDirectory = path.join(publicDirectory, "admin");

await mkdir(assetDirectory, { recursive: true });
await mkdir(managerDirectory, { recursive: true });

const sourceFiles = await readdir(repositoryRoot, { withFileTypes: true });
const assets = sourceFiles
  .filter((entry) => entry.isFile() && (entry.name === "app.js" || entry.name.endsWith(".css")))
  .map((entry) => entry.name);

if (!assets.includes("app.js") || !assets.includes("styles.css")) {
  throw new Error("Tournament manager source files were not found at the repository root.");
}

await Promise.all(assets.map((file) =>
  copyFile(path.join(repositoryRoot, file), path.join(assetDirectory, file)),
));

const sourceHtml = await readFile(path.join(repositoryRoot, "index.html"), "utf8");
if (!sourceHtml.includes('id="app"') || !sourceHtml.includes('src="app.js"')) {
  throw new Error("Tournament manager HTML is missing its application mount or script.");
}

const managerHtml = sourceHtml
  .replace(/<title>[^<]*<\/title>/, "<title>Tournament Manager | PUBG Tournaments</title>")
  .replace(/href="([^"]+\.css(?:\?[^"]*)?)"/g, (_match, href) => {
    const [file, query = ""] = href.split("?");
    return `href="/admin-assets/${path.basename(file)}${query ? `?${query}` : ""}"`;
  })
  .replace('src="app.js"', 'src="/admin-assets/app.js"')
  .replace("</head>", '    <link rel="stylesheet" href="/admin-assets/main-site-theme.css" />\n  </head>');

await writeFile(path.join(managerDirectory, "index.html"), managerHtml);
