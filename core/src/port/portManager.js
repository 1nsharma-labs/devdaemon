import { execSync } from 'child_process';
import os from 'os';

export class PortManager {
  static getProcessOnPort(port) {
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum <= 0 || portNum > 65535) {
      throw new Error(`Invalid port number: "${port}"`);
    }

    try {
      if (os.platform() === 'win32') {
        const output = execSync(`netstat -ano -p tcp`, { encoding: 'utf-8' });
        const lines = output.split('\n');
        for (const line of lines) {
          if (line.includes(`:${portNum}`) && line.includes('LISTENING')) {
            const parts = line.trim().split(/\s+/);
            const pid = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(pid) && pid > 0) {
              return { port: portNum, pid, platform: 'win32' };
            }
          }
        }
      } else {
        const output = execSync(`lsof -ti:${portNum}`, { encoding: 'utf-8' }).trim();
        if (output) {
          const pid = parseInt(output.split('\n')[0], 10);
          return { port: portNum, pid, platform: 'unix' };
        }
      }
    } catch {
      // No process found or command failed
    }

    return null;
  }

  static freePort(port, options = {}) {
    if (options.simulate) {
      return {
        success: true,
        port: parseInt(port, 10),
        killedPid: 1337,
        simulated: true,
        message: `Simulated termination of zombie process (PID 1337) holding port ${port}`
      };
    }

    const proc = this.getProcessOnPort(port);
    if (!proc) {
      return {
        success: true,
        port: parseInt(port, 10),
        message: `Port ${port} is already free.`
      };
    }

    try {
      if (os.platform() === 'win32') {
        execSync(`taskkill /F /PID ${proc.pid}`);
      } else {
        execSync(`kill -9 ${proc.pid}`);
      }
      return {
        success: true,
        port: proc.port,
        killedPid: proc.pid,
        message: `Successfully terminated process ${proc.pid} on port ${proc.port}`
      };
    } catch (err) {
      return {
        success: false,
        port: proc.port,
        pid: proc.pid,
        error: err.message
      };
    }
  }
}
