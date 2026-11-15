# Show HN: DevDaemon – Autonomous terminal error interceptor & zombie port killer

Hey Hacker News,

I’m Amit (@1nsharma), founder of 1nsharma-labs. Today I’m releasing **DevDaemon** (Apache 2.0).

### The Problem
Every developer encounters the same repetitive terminal friction daily:
1. `Error: listen EADDRINUSE: address already in use :::3000` — You have to run `netstat`, find the PID, run `taskkill /F /PID` or `kill -9`, or restart your terminal.
2. Missing dependencies (`Cannot find module`, `ModuleNotFoundError`) — You have to stop, copy the name, and run `npm install` or `pip install`.
3. Git non-fast-forward push rejections — You have to remember the exact rebase syntax.

### What DevDaemon Does
DevDaemon is a zero-runtime-dependency CLI & daemon built with pure Node 24 ESM:
- **Instant Port Killer:** `devdaemon kill-port 3000` automatically finds and terminates whatever zombie process is holding port 3000 across Windows, macOS, and Linux.
- **Sub-2ms Error Classifier:** Watches commands and immediately intercepts failures (`devdaemon run "npm test"`), providing the exact root-cause diagnosis and 1-line copy-paste fix.
- **Native Model Context Protocol (MCP) Server:** Equips Claude Desktop and Cursor with tools to diagnose terminal errors and free blocked ports.

- **GitHub:** https://github.com/1nsharma-labs/devdaemon
- **Live In-Browser Terminal Healer Demo:** https://1nsharma-labs.github.io/devdaemon/

I'd love your thoughts, feedback, and PRs!
