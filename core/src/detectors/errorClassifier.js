export class ErrorClassifier {
  static diagnose(errorText, context = {}) {
    if (!errorText || typeof errorText !== 'string') {
      return { category: 'UNKNOWN', confidence: 0, explanation: 'No error output provided' };
    }

    const text = errorText;

    // 1. Port In Use
    const portMatch = text.match(/(?:EADDRINUSE.*?:(\d+)|address already in use.*?(\d+)|port\s+(\d+)\s+is already in use)/i);
    if (portMatch) {
      const port = portMatch[1] || portMatch[2] || portMatch[3] || '3000';
      return {
        category: 'PORT_IN_USE',
        confidence: 0.98,
        title: `Port ${port} is already occupied by another process`,
        explanation: `Another service (dev server, docker, or zombie node process) is holding port ${port}.`,
        suggestedFix: `devdaemon kill-port ${port}`,
        autoExecutable: true,
        data: { port: parseInt(port, 10) }
      };
    }

    // 2. Node.js Missing Module
    const nodeModMatch = text.match(/(?:Cannot find module\s+['"]([^'"]+)['"]|ERR_MODULE_NOT_FOUND.*?['"]([^'"]+)['"])/i);
    if (nodeModMatch) {
      const pkg = nodeModMatch[1] || nodeModMatch[2];
      const isRelative = pkg.startsWith('.') || pkg.startsWith('/');
      return {
        category: 'MISSING_DEPENDENCY_NODE',
        confidence: 0.95,
        title: `Missing Node.js module: ${pkg}`,
        explanation: isRelative
          ? `Local file path "${pkg}" was not found. Check file naming or path casing.`
          : `Package "${pkg}" is not installed in node_modules.`,
        suggestedFix: isRelative ? null : `npm install ${pkg}`,
        autoExecutable: !isRelative,
        data: { package: pkg, isRelative }
      };
    }

    // 3. Python Missing Module
    const pyModMatch = text.match(/ModuleNotFoundError:\s+No module named\s+['"]([^'"]+)['"]/i);
    if (pyModMatch) {
      const pkg = pyModMatch[1];
      return {
        category: 'MISSING_DEPENDENCY_PYTHON',
        confidence: 0.95,
        title: `Missing Python dependency: ${pkg}`,
        explanation: `Python package "${pkg}" is missing in the active virtual environment.`,
        suggestedFix: `pip install ${pkg}`,
        autoExecutable: true,
        data: { package: pkg }
      };
    }

    // 4. Command Not Found
    const cmdMatch = text.match(/(?:(?:command not found|is not recognized as an internal or external command):\s*([a-zA-Z0-9_-]+)|([a-zA-Z0-9_-]+):\s*command not found)/i);
    if (cmdMatch) {
      const cmd = cmdMatch[1] || cmdMatch[2];
      return {
        category: 'COMMAND_NOT_FOUND',
        confidence: 0.90,
        title: `CLI command "${cmd}" not found in PATH`,
        explanation: `The executable "${cmd}" is not installed or not added to your system environment PATH.`,
        suggestedFix: this.getInstallSuggestionForCli(cmd),
        autoExecutable: false,
        data: { command: cmd }
      };
    }

    // 5. Git Non-Fast-Forward / Push Rejected
    if (text.includes('Updates were rejected because the remote contains work') || text.includes('fetch first') || text.includes('[rejected]')) {
      return {
        category: 'GIT_PUSH_REJECTED',
        confidence: 0.96,
        title: 'Git push rejected (remote has newer commits)',
        explanation: 'Your local branch is behind the remote repository.',
        suggestedFix: 'git pull --rebase origin $(git branch --show-current)',
        autoExecutable: true
      };
    }

    // 6. Docker Daemon Inactive
    if (text.includes('Cannot connect to the Docker daemon') || text.includes('Is the docker daemon running?')) {
      return {
        category: 'DOCKER_DAEMON_OFFLINE',
        confidence: 0.95,
        title: 'Docker engine / daemon is not running',
        explanation: 'Docker CLI cannot reach the Docker socket daemon service.',
        suggestedFix: process.platform === 'win32' ? 'Start-Process "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"' : 'sudo systemctl start docker',
        autoExecutable: false
      };
    }

    // 7. General Permission Denied (EACCES)
    if (text.includes('EACCES: permission denied') || text.includes('Permission denied')) {
      return {
        category: 'PERMISSION_DENIED',
        confidence: 0.85,
        title: 'File or socket permission denied',
        explanation: 'The current process lacks read/write permissions for the target file or port (<1024).',
        suggestedFix: 'Run terminal with elevated privileges or fix file ownership',
        autoExecutable: false
      };
    }

    return {
      category: 'UNRECOGNIZED_ERROR',
      confidence: 0.30,
      title: 'Unclassified execution error',
      explanation: text.split('\n')[0].substring(0, 150),
      suggestedFix: null,
      autoExecutable: false
    };
  }

  static getInstallSuggestionForCli(cli) {
    const map = {
      pnpm: 'npm install -g pnpm',
      yarn: 'npm install -g yarn',
      gh: 'winget install --id GitHub.cli (or brew install gh)',
      docker: 'Install Docker Desktop from https://www.docker.com/products/docker-desktop',
      poetry: 'pip install poetry',
      cargo: 'Install Rust from https://rustup.rs'
    };
    return map[cli] || `Install "${cli}" via your system package manager`;
  }
}
