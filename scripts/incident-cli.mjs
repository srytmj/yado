#!/usr/bin/env node

/**
 * Yado Incident & Maintenance CLI Tool
 * Usable by humans and AI coding assistants (Claude Code, Gemini CLI, Antigravity).
 *
 * Usage:
 *   node scripts/incident-cli.mjs list
 *   node scripts/incident-cli.mjs create --title="..." --service="sso|malas|libs|pore|gateway" --severity="minor|major|maintenance" --message="..." [--duration="30m"]
 *   node scripts/incident-cli.mjs update --id="inc-01" --status="Monitoring" --message="..."
 *   node scripts/incident-cli.mjs resolve --id="inc-01" --message="All services restored."
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INCIDENTS_FILE = path.resolve(__dirname, "../src/data/incidents.json");

const SERVICE_NAMES = {
  sso: "SSO Identity Provider",
  malas: "Malas Library & Reader",
  libs: "libs Tunnel & Broker",
  pore: "Pore.js Reader Engine",
  gateway: "Edge Gateway & Ingress",
};

function readIncidents() {
  if (!fs.existsSync(INCIDENTS_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(INCIDENTS_FILE, "utf-8");
  return JSON.parse(raw);
}

function saveIncidents(data) {
  fs.writeFileSync(INCIDENTS_FILE, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function parseArgs(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const eqIndex = arg.indexOf("=");
      if (eqIndex !== -1) {
        const key = arg.slice(2, eqIndex);
        const val = arg.slice(eqIndex + 1);
        flags[key] = val;
      } else {
        const key = arg.slice(2);
        const next = args[i + 1];
        if (next && !next.startsWith("--")) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      }
    }
  }
  return flags;
}

function getUtcTime() {
  const now = new Date();
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const mins = String(now.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${mins} UTC`;
}

function getTodayString() {
  const d = new Date();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function handleList() {
  const incidents = readIncidents();
  console.log(`\n=== Yado Incidents & Maintenance (${incidents.length} total) ===\n`);
  if (!incidents.length) {
    console.log("No incidents found in registry.");
    return;
  }

  for (const inc of incidents) {
    const latestStatus = inc.updates?.[0]?.status || "Unknown";
    console.log(`[${inc.id}] ${inc.title}`);
    console.log(`  Service:  ${inc.serviceName} (${inc.serviceId})`);
    console.log(`  Severity: ${inc.severity.toUpperCase()} | Status: ${latestStatus}`);
    console.log(`  Date:     ${inc.date} | Duration: ${inc.duration}`);
    console.log(`  Latest:   "${inc.updates?.[0]?.message || 'No update'}"`);
    console.log("------------------------------------------------------------");
  }
}

function handleCreate(flags) {
  const title = flags.title;
  const serviceId = flags.service;
  const severity = flags.severity || "minor";
  const duration = flags.duration || "In progress";
  const message = flags.message || "Incident under investigation.";
  const status = flags.status || (severity === "maintenance" ? "Investigating" : "Investigating");

  if (!title || !serviceId) {
    console.error("Error: --title and --service are required.");
    console.log('Example: node scripts/incident-cli.mjs create --title="Memory Leak" --service=malas --severity=minor --message="Investigating memory spike."');
    process.exit(1);
  }

  const serviceName = SERVICE_NAMES[serviceId] || `${serviceId.toUpperCase()} Service`;
  const incidents = readIncidents();
  const id = `inc-${Date.now().toString().slice(-6)}`;

  const newIncident = {
    id,
    title,
    date: `Today (${getTodayString()})`,
    severity,
    serviceId,
    serviceName,
    duration,
    updates: [
      {
        timestamp: getUtcTime(),
        status,
        message,
      },
    ],
  };

  incidents.unshift(newIncident);
  saveIncidents(incidents);

  console.log(`\n✔ Incident created successfully:`);
  console.log(`  ID:       ${id}`);
  console.log(`  Title:    ${title}`);
  console.log(`  Service:  ${serviceName}`);
  console.log(`  Severity: ${severity}`);
  console.log(`  Status:   ${status}\n`);
}

function handleUpdate(flags) {
  const id = flags.id;
  const status = flags.status || "Monitoring";
  const message = flags.message;

  if (!id || !message) {
    console.error("Error: --id and --message are required.");
    console.log('Example: node scripts/incident-cli.mjs update --id=inc-01 --status=Monitoring --message="Patch deployed, observing latency."');
    process.exit(1);
  }

  const incidents = readIncidents();
  const target = incidents.find((i) => i.id === id);

  if (!target) {
    console.error(`Error: Incident with ID "${id}" not found.`);
    process.exit(1);
  }

  target.updates.unshift({
    timestamp: getUtcTime(),
    status,
    message,
  });

  saveIncidents(incidents);
  console.log(`\n✔ Incident ${id} updated with status: ${status}\n`);
}

function handleResolve(flags) {
  const id = flags.id;
  const message = flags.message || "Root cause identified and resolved. Service operating normally.";
  const duration = flags.duration;

  if (!id) {
    console.error("Error: --id is required.");
    console.log('Example: node scripts/incident-cli.mjs resolve --id=inc-01 --message="All services restored."');
    process.exit(1);
  }

  const incidents = readIncidents();
  const target = incidents.find((i) => i.id === id);

  if (!target) {
    console.error(`Error: Incident with ID "${id}" not found.`);
    process.exit(1);
  }

  target.updates.unshift({
    timestamp: getUtcTime(),
    status: target.severity === "maintenance" ? "Completed" : "Resolved",
    message,
  });

  if (duration) {
    target.duration = duration;
  }

  saveIncidents(incidents);
  console.log(`\n✔ Incident ${id} resolved successfully.\n`);
}

// Main execution router
const command = process.argv[2];
const flags = parseArgs(process.argv.slice(3));

switch (command) {
  case "list":
    handleList();
    break;
  case "create":
  case "add":
  case "new":
    handleCreate(flags);
    break;
  case "update":
    handleUpdate(flags);
    break;
  case "resolve":
  case "close":
    handleResolve(flags);
    break;
  default:
    console.log(`
Yado Incident & Maintenance CLI

Available commands:
  list                      List all past and active incidents
  create                    Create a new incident or maintenance announcement
  update                    Add a progress update to an incident
  resolve                   Mark an incident as resolved or maintenance completed

Flags for 'create':
  --title="..."             Incident title (e.g. "PostgreSQL Connection Pool Exhaustion")
  --service="..."           Service ID: sso | malas | libs | pore | gateway
  --severity="..."          Severity: minor | major | maintenance (default: minor)
  --message="..."           Initial status description
  --duration="..."          Estimated or elapsed duration (e.g. "25 minutes")

Flags for 'update':
  --id="..."                Incident ID (e.g. inc-01)
  --status="..."            Status: Investigating | Identified | Monitoring | Resolved | Completed
  --message="..."           Update log description

Flags for 'resolve':
  --id="..."                Incident ID
  --message="..."           Resolution summary
  --duration="..."          Final total duration
`);
    break;
}
