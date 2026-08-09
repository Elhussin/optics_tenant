// scripts/fix-zod-schemas.js
const fs = require("fs");
const path = require("path");

const schemaFile = path.resolve(__dirname, "../src/shared/api/schemas.ts");
if (!fs.existsSync(schemaFile)) {
  console.error("❌ schemas.ts file not found at:", schemaFile);
  process.exit(1);
}

let content = fs.readFileSync(schemaFile, "utf-8");

// 1. Fix any typos or missing exports for endpoints
content = content.replace(/(?:export\s+)?(?:onst|const)\s+endpoints\s*=/g, "export const endpoints =");

// 2. Cast endpoints as any in the Zodios constructor to prevent deep type instantiation compiler errors (TS2589)
content = content.replace(
  /new Zodios\(endpoints\)/g,
  "new Zodios(endpoints as any)"
);
content = content.replace(
  /new Zodios\(baseUrl,\s*endpoints,\s*options\)/g,
  "new Zodios(baseUrl, endpoints as any, options)"
);

// 3. Make sure z.instanceof(File) is replaced with custom file validator for React Hook Form compatibility
content = content.replace(
  /z\.instanceof\(File\)/g,
  `z.custom().refine(f => f instanceof File, { message: "Must be a File" })`
);

fs.writeFileSync(schemaFile, content);
console.log("✅ src/shared/api/schemas.ts has been patched successfully with Zodios depth-limit workarounds and endpoint exports!");