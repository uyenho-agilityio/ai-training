import { chmodSync, readFileSync, writeFileSync } from "node:fs"

const entry = "dist/index.js"
const shebang = "#!/usr/bin/env node\n"
let code = readFileSync(entry, "utf8")
if (!code.startsWith("#!")) {
  code = shebang + code
}
writeFileSync(entry, code)
chmodSync(entry, 0o755)
