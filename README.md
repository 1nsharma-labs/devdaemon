<h1 align="center">🛡️ DevDaemon</h1>

<p align="center">
  <b>The Open-Source Autonomous Terminal Error Interceptor & Workspace Self-Healing Daemon</b><br>
  Catches terminal command errors, frees blocked ports in 1-click, and auto-diagnoses stack traces with native Model Context Protocol (MCP) support.
</p>

<p align="center">
  <a href="https://github.com/1nsharma-labs/devdaemon/actions"><img src="https://img.shields.io/badge/build-passing-brightgreen.svg" alt="Build Status"></a>
  <a href="https://www.npmjs.com/package/devdaemon"><img src="https://img.shields.io/badge/npm-v1.0.0-blue.svg" alt="npm version"></a>
  <a href="https://github.com/1nsharma-labs/devdaemon/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-green.svg" alt="License"></a>
  <a href="https://1nsharma-labs.github.io/devdaemon/"><img src="https://img.shields.io/badge/Live_Demo-Terminal_Healer-orange.svg" alt="Live Demo"></a>
  <a href="https://polar.sh/1nsharma-labs"><img src="https://img.shields.io/badge/Sponsor-Polar.sh-purple.svg" alt="Sponsor"></a>
</p>

---

## 🌟 Why DevDaemon?

Every developer wastes hours every week copying terminal stack traces into browser tabs, debugging why port 3000 is occupied, or trying to remember the right git rebase flag.

**DevDaemon** is a lightweight, zero-dependency background daemon and CLI that watches commands, intercepts errors in `< 2ms`, and suggests (or auto-executes) the exact verified fix right in your terminal.

* ⚡ **Zero External Dependencies:** Built with pure native Node 24 ESM, `child_process`, and OS sockets.
* 🛑 **Instant Zombie Port Killer:** Run `devdaemon kill-port 3000` to find and terminate whichever rogue process is occupying your dev port across Windows, macOS, and Linux.
* 🧠 **Sub-2ms Error Classifier:** Instantly diagnoses `EADDRINUSE`, missing Node/Python packages, Git push rejections, Docker daemon disconnects, and permission errors.
* 🔮 **Native Model Context Protocol (MCP) Server:** Equips **Claude Desktop** and **Cursor** to diagnose terminal errors and free blocked ports automatically.
* 👥 **Enterprise Team Knowledge Mesh (BSL 1.1):** When one engineer resolves an obscure build error, DevDaemon automatically shares the fix with the entire engineering team.

---

## 🚀 Quick Start

### Installation

```bash
# Run on-demand without installing
npx -y devdaemon help

# Or install globally
npm install -g devdaemon
```

---

## 💻 CLI Commands

### 1. Free Occupied TCP Ports Instantly
Finds and kills whichever process is holding port 3000, 8080, 5432, etc.:
```bash
devdaemon kill-port 3000
```

### 2. Run Commands with Error Interception & Auto-Diagnosis
```bash
devdaemon run "npm start"
devdaemon run "pytest"
```
If the command fails, DevDaemon intercepts stderr and outputs the root cause and a 1-line copy-paste fix!

### 3. Diagnose Any Error String
```bash
devdaemon diagnose "Error: listen EADDRINUSE: address already in use :::3000"
devdaemon diagnose "ModuleNotFoundError: No module named 'fastapi'"
```

---

## 🔮 Model Context Protocol (MCP) Integration

DevDaemon includes a native MCP stdio server. Add it to your `claude_desktop_config.json` or Cursor MCP settings:

```json
{
  "mcpServers": {
    "devdaemon": {
      "command": "npx",
      "args": ["-y", "devdaemon", "mcp"]
    }
  }
}
```

Now Claude Desktop and Cursor can directly execute:
* `devdaemon_diagnose_error`: Analyzes terminal build failures and returns fixes.
* `devdaemon_free_port`: Kills zombie dev servers holding ports.
* `devdaemon_run_safe`: Runs shell commands with self-healing analysis.

---

## 💼 Commercial & Enterprise Support

DevDaemon follows an **Open-Core** model:
* **Community Core (Apache 2.0):** 100% Free for developers, port killer, error classifier, CLI commands, and full MCP server.
* **Enterprise Edition (BSL 1.1):** Includes the **Team Knowledge Mesh** (`ee/knowledge/teamMesh.js`) for syncing team-verified build fixes across engineering organizations and CI pipelines.

### Direct Contact & Payment
* **Lead Architect:** **Amit Sharma** ([@1nsharma](https://github.com/1nsharma))
* **Enterprise Inquiries & Bounties:** [polar.sh/1nsharma-labs](https://polar.sh/1nsharma-labs)
* **Official Contact:** [tech@mowglai.com](mailto:tech@mowglai.com)
* **Global Sponsorship & Cards:** [polar.sh/1nsharma-labs](https://polar.sh/1nsharma-labs) &bull; [github.com/sponsors/1nsharma](https://github.com/sponsors/1nsharma)

---

## 🌐 The 1nsharma Ecosystem

* [**DroidArmor**](https://github.com/1nsharma-labs/droidarmor) — Autonomous AI Mobile Agent & Fast ADB Automation for Android.
* [**SlashGraph**](https://github.com/1nsharma-labs/slashgraph) — Universal Codebase & System Architecture Intelligence Graph.
* [**OmniMCP**](https://github.com/1nsharma-labs/omnimcp) — Universal Model Context Protocol Hub for Mobile, Desktop, Workspace & Memory.
* [**PromptArmor**](https://github.com/1nsharma-labs/promptarmor) — Sub-2ms Local Prompt Injection & Jailbreak Firewall.
* [**TokenArmor**](https://github.com/1nsharma-labs/tokenarmor) — Open-Source AI Gateway & Token FinOps Firewall.
* [**1nsharma/SLASH**](https://github.com/1nsharma/SLASH) — Unified System & Digital Network Intelligence Graph.
* [**1nsharma/Urlmind**](https://github.com/1nsharma/Urlmind) — Understand Anything on the Internet from a Single URL.

---

<p align="center">
  Crafted with ❤️ by <a href="https://github.com/1nsharma"><b>Amit Sharma</b></a> (@1nsharma-labs)
</p>
