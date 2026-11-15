import { spawn } from 'child_process';
import { ErrorClassifier } from '../detectors/errorClassifier.js';
import { PortManager } from '../port/portManager.js';

export class ExecInterceptor {
  constructor(options = {}) {
    this.autoHeal = options.autoHeal || false;
    this.verbose = options.verbose || false;
  }

  async runCommand(commandString) {
    const startTime = Date.now();
    let stdoutData = '';
    let stderrData = '';

    return new Promise((resolve) => {
      const child = spawn(commandString, {
        shell: true,
        stdio: ['inherit', 'pipe', 'pipe']
      });

      child.stdout.on('data', chunk => {
        stdoutData += chunk;
        if (this.verbose) process.stdout.write(chunk);
      });

      child.stderr.on('data', chunk => {
        stderrData += chunk;
        if (this.verbose) process.stderr.write(chunk);
      });

      child.on('close', async (exitCode) => {
        const durationMs = Date.now() - startTime;

        if (exitCode === 0) {
          resolve({
            command: commandString,
            exitCode: 0,
            success: true,
            stdout: stdoutData,
            durationMs,
            diagnosis: null
          });
          return;
        }

        // Failure intercepted! Run autonomous diagnosis
        const diagnosis = ErrorClassifier.diagnose(stderrData || stdoutData);

        let healed = false;
        let healAction = null;

        if (this.autoHeal && diagnosis.autoExecutable) {
          if (diagnosis.category === 'PORT_IN_USE' && diagnosis.data?.port) {
            const freeRes = PortManager.freePort(diagnosis.data.port);
            healed = freeRes.success;
            healAction = `Freed port ${diagnosis.data.port} (PID: ${freeRes.killedPid || 'n/a'})`;
          }
        }

        resolve({
          command: commandString,
          exitCode,
          success: false,
          stdout: stdoutData,
          stderr: stderrData,
          durationMs,
          diagnosis,
          healed,
          healAction
        });
      });

      child.on('error', (err) => {
        const diagnosis = ErrorClassifier.diagnose(err.message);
        resolve({
          command: commandString,
          exitCode: -1,
          success: false,
          error: err.message,
          durationMs: Date.now() - startTime,
          diagnosis
        });
      });
    });
  }
}
