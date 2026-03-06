#!/usr/bin/env node
/**
 * Figma sync: check and diff against the design repo.
 * Uses FIGMA_REPO_URL (default: design repo for this project).
 * Files to preserve: integration layer (api.ts, types, utils, auth, admin, this script).
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const FIGMA_REPO_URL =
  process.env.FIGMA_REPO_URL || "https://github.com/BlackCollar27/Futurescopelabs.git";
const FRONTEND_ROOT = path.resolve(__dirname, "..");
const DESIGN_CLONE_DIR = path.join(FRONTEND_ROOT, ".figma-design-repo");
const STATE_FILE = path.join(FRONTEND_ROOT, ".figma-sync-state.json");

const FILES_TO_PRESERVE = [
  "src/services/api.ts",
  "src/types/index.ts",
  "src/utils",
  "scripts/figma-sync.js",
  "src/app/pages/AdminLogin.tsx",
  "src/app/pages/AdminDashboard.tsx",
  "src/app/pages/AuthCallback.tsx",
  "src/app/components/AdminGuard.tsx",
];

const BRANDING_ASSETS = [
  "src/assets/80d38ff6cf060e57b95afff5b0b5615786e44b78.png",
  "src/assets/2d59fb06e80a41b9c9b829d1b7b08db93633bb92.png",
  "public/favicon.svg",
];

function shouldPreserve(filePath) {
  const rel = path.relative(FRONTEND_ROOT, filePath).replace(/\\/g, "/");
  return FILES_TO_PRESERVE.some((p) => rel === p || rel.startsWith(p + "/"));
}

function cloneOrPull() {
  if (fs.existsSync(path.join(DESIGN_CLONE_DIR, ".git"))) {
    execSync("git pull", { cwd: DESIGN_CLONE_DIR, stdio: "pipe" });
  } else {
    fs.mkdirSync(path.dirname(DESIGN_CLONE_DIR), { recursive: true });
    execSync(`git clone ${FIGMA_REPO_URL} "${DESIGN_CLONE_DIR}"`, { stdio: "pipe" });
  }
}

function walkDir(dir, base = dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(base, full).replace(/\\/g, "/");
    if (e.isDirectory()) {
      if (e.name !== "node_modules" && e.name !== ".git") {
        results.push(...walkDir(full, base));
      }
    } else {
      results.push(rel);
    }
  }
  return results;
}

const cmd = process.argv[2] || "check";

if (cmd === "check") {
  console.log("Cloning/pulling design repo...");
  cloneOrPull();
  const designFiles = walkDir(path.join(DESIGN_CLONE_DIR, "src"));
  const state = {
    designRepoUrl: FIGMA_REPO_URL,
    designFileCount: designFiles.length,
    lastCheck: new Date().toISOString(),
  };
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log(`Design repo: ${designFiles.length} files in src/`);
  console.log(`State saved to ${STATE_FILE}`);
} else if (cmd === "diff") {
  if (!fs.existsSync(DESIGN_CLONE_DIR)) {
    console.log("Run figma:check first.");
    process.exit(1);
  }
  const designSrc = path.join(DESIGN_CLONE_DIR, "src");
  const frontendSrc = path.join(FRONTEND_ROOT, "src");
  const designFiles = new Set(walkDir(designSrc));
  const frontendFiles = new Set(walkDir(frontendSrc));

  console.log("\n--- Files to preserve (integration) ---");
  FILES_TO_PRESERVE.forEach((p) => console.log("  " + p));

  console.log("\n--- Branding assets to preserve ---");
  BRANDING_ASSETS.forEach((p) => console.log("  " + p));

  console.log("\n--- In design but not in frontend ---");
  for (const f of designFiles) {
    const frontPath = path.join(frontendSrc, f);
    if (!fs.existsSync(path.join(DESIGN_CLONE_DIR, "src", f))) continue;
    const inFront = fs.existsSync(frontPath);
    if (!inFront) console.log("  + " + f);
  }

  console.log("\n--- In frontend but not in design (may be integration) ---");
  for (const f of frontendFiles) {
    const designPath = path.join(designSrc, f);
    if (!fs.existsSync(designPath)) {
      const preserve = shouldPreserve(path.join(frontendSrc, f));
      console.log("  " + (preserve ? "[preserve] " : "") + f);
    }
  }
} else {
  console.log("Usage: node figma-sync.js [check|diff]");
  process.exit(1);
}
