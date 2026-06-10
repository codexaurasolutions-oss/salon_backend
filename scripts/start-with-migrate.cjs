const { spawnSync, spawn } = require("child_process");

const failedMigrationNames = [
  "20260604162000_patch_existing_mysql_schema",
  "20260605102000_fix_notification_and_profile_schema",
];

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });
}

function resolveFailedMigrations() {
  for (const migrationName of failedMigrationNames) {
    const result = run("npx", [
      "prisma",
      "migrate",
      "resolve",
      "--rolled-back",
      migrationName,
    ]);

    if (result.status === 0) {
      continue;
    }

    // If the migration is not failed anymore, continue and let migrate deploy handle the rest.
    console.log(
      `[startup] Skipping resolve for ${migrationName}; continuing with migrate deploy.`
    );
  }
}

function deployMigrations() {
  const result = run("npx", ["prisma", "migrate", "deploy"]);
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function bootstrapDemoData() {
  const result = run("node", ["scripts/bootstrap-demo-data.cjs"]);
  if (result.status !== 0) {
    console.log("[startup] Demo data bootstrap skipped after non-fatal error.");
  }
}

function startServer() {
  const child = spawn("node", ["dist/server.js"], {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });

  child.on("exit", (code) => {
    process.exit(code || 0);
  });
}

resolveFailedMigrations();
deployMigrations();
bootstrapDemoData();
startServer();
