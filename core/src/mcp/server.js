import readline from 'readline';
import { ErrorClassifier } from '../detectors/errorClassifier.js';
import { PortManager } from '../port/portManager.js';
import { ExecInterceptor } from '../runner/execInterceptor.js';

export class DevDaemonMcpServer {
  constructor(options = {}) {
    this.interceptor = new ExecInterceptor(options);
  }

  start() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on('line', async (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      try {
        const request = JSON.parse(trimmed);
        const response = await this.handleMessage(request);
        if (response) {
          process.stdout.write(JSON.stringify(response) + '\n');
        }
      } catch (err) {
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: `Parse error: ${err.message}` }
        }) + '\n');
      }
    });

    process.stderr.write('🛡️ DevDaemon MCP Server running on stdio\n');
  }

  async handleMessage(req) {
    const { id, method, params } = req;

    if (method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: 'devdaemon-mcp',
            version: '1.0.0'
          }
        }
      };
    }

    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'devdaemon_diagnose_error',
              description: 'Classifies any terminal command error, stack trace, or compiler failure and provides an instant root-cause analysis and 1-line shell fix.',
              inputSchema: {
                type: 'object',
                properties: {
                  error_text: { type: 'string', description: 'The raw error text or stack trace' }
                },
                required: ['error_text']
              }
            },
            {
              name: 'devdaemon_free_port',
              description: 'Frees an occupied TCP port (e.g. 3000, 8080) by finding and terminating the zombie process holding it.',
              inputSchema: {
                type: 'object',
                properties: {
                  port: { type: 'number', description: 'Port number to free (e.g. 3000)' }
                },
                required: ['port']
              }
            },
            {
              name: 'devdaemon_run_safe',
              description: 'Executes a shell command with real-time error interception and self-healing fix recommendation.',
              inputSchema: {
                type: 'object',
                properties: {
                  command: { type: 'string', description: 'Command to execute' },
                  auto_heal: { type: 'boolean', description: 'Attempt automatic healing if port is blocked' }
                },
                required: ['command']
              }
            }
          ]
        }
      };
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const args = params?.arguments || {};

      try {
        let content = '';

        if (toolName === 'devdaemon_diagnose_error') {
          const diag = ErrorClassifier.diagnose(args.error_text);
          content = JSON.stringify(diag, null, 2);
        } else if (toolName === 'devdaemon_free_port') {
          const res = PortManager.freePort(args.port);
          content = JSON.stringify(res, null, 2);
        } else if (toolName === 'devdaemon_run_safe') {
          const runner = new ExecInterceptor({ autoHeal: !!args.auto_heal });
          const res = await runner.runCommand(args.command);
          content = JSON.stringify(res, null, 2);
        } else {
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Tool "${toolName}" not found.` }
          };
        }

        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: content }]
          }
        };
      } catch (err) {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            isError: true,
            content: [{ type: 'text', text: `Error: ${err.message}` }]
          }
        };
      }
    }

    return {
      jsonrpc: '2.0',
      id,
      result: {}
    };
  }
}
