#!/usr/bin/env node
import { ErrorClassifier } from '../detectors/errorClassifier.js';
import { PortManager } from '../port/portManager.js';
import { ExecInterceptor } from '../runner/execInterceptor.js';
import { DevDaemonMcpServer } from '../mcp/server.js';

const BANNER = `
   ____             ____                                  
  |  _ \\  _____   _|  _ \\  __ _  ___ _ __ ___   ___  _ __  
  | | | |/ _ \\ \\ / / | | |/ _\` |/ _ \\ '_ \` _ \\ / _ \\| '_ \\ 
  | |_| |  __/\\ V /| |_| | (_| |  __/ | | | | | (_) | | | |
  |____/ \\___| \\_/ |____/ \\__,_|\\___|_| |_| |_|\\___/|_| |_|
                                                            
  The Open-Source Autonomous Terminal Error Interceptor & Self-Healing Daemon
  Created by Amit Sharma (@1nsharma) • 1nsharma-labs
`;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(BANNER);
    console.log(`Usage: devdaemon <command> [options]\n`);
    console.log(`Commands:`);
    console.log(`  run "<command>"         Execute a shell command with real-time error interception & fix suggestion`);
    console.log(`  kill-port <port>        Find and terminate zombie process occupying a TCP port (e.g. 3000)`);
    console.log(`  diagnose "<error_msg>"  Classify an error message and return root-cause & 1-line shell fix`);
    console.log(`  mcp                     Launch Model Context Protocol (MCP) server for Claude / Cursor`);
    console.log(`\nExamples:`);
    console.log(`  devdaemon run "npm start"`);
    console.log(`  devdaemon kill-port 3000`);
    console.log(`  devdaemon diagnose "Error: listen EADDRINUSE: address already in use :::3000"\n`);
    process.exit(0);
  }

  if (command === 'mcp') {
    const server = new DevDaemonMcpServer();
    server.start();
    return;
  }

  console.log(BANNER);

  if (command === 'kill-port') {
    const port = args[1];
    if (!port) {
      console.error(`❌ Error: Please specify a port number (e.g. devdaemon kill-port 3000)`);
      process.exit(1);
    }
    console.log(`🔍 Inspecting port ${port}...`);
    const res = PortManager.freePort(port);
    if (res.success) {
      console.log(`✅ ${res.message || `Port ${port} is now free!`}`);
    } else {
      console.error(`❌ Failed to free port ${port}: ${res.error}`);
    }
    console.log('');
  } else if (command === 'diagnose') {
    const errorText = args.slice(1).join(' ');
    if (!errorText) {
      console.error(`❌ Error: Please specify an error message to diagnose.`);
      process.exit(1);
    }
    console.log(`🧠 Diagnosing error in sub-5ms...\n`);
    const diag = ErrorClassifier.diagnose(errorText);
    console.log(`  Category:       ${diag.category}`);
    console.log(`  Confidence:     ${Math.round(diag.confidence * 100)}%`);
    console.log(`  Title:          ${diag.title}`);
    console.log(`  Explanation:    ${diag.explanation}`);
    if (diag.suggestedFix) {
      console.log(`  🔧 Suggested Fix:`);
      console.log(`     ${diag.suggestedFix}`);
    }
    console.log('');
  } else if (command === 'run') {
    const cmd = args.slice(1).join(' ');
    if (!cmd) {
      console.error(`❌ Error: Please specify command to run (e.g. devdaemon run "npm test")`);
      process.exit(1);
    }
    console.log(`🚀 Executing: "${cmd}" under DevDaemon protection...\n`);
    const interceptor = new ExecInterceptor({ verbose: true });
    const result = await interceptor.runCommand(cmd);

    if (result.success) {
      console.log(`\n✅ Command exited cleanly (code 0 in ${result.durationMs}ms)`);
    } else {
      console.log(`\n⚠️ Command failed with exit code ${result.exitCode} (${result.durationMs}ms)`);
      if (result.diagnosis) {
        console.log(`\n🧠 DevDaemon Autonomous Diagnosis:`);
        console.log(`  Problem: ${result.diagnosis.title}`);
        console.log(`  Reason:  ${result.diagnosis.explanation}`);
        if (result.diagnosis.suggestedFix) {
          console.log(`\n  👉 Recommended 1-Line Fix:`);
          console.log(`     ${result.diagnosis.suggestedFix}`);
        }
      }
    }
    console.log('');
  } else {
    console.error(`Unknown command: "${command}". Run "devdaemon help" for usage.`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
