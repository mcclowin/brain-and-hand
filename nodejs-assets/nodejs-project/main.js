/**
 * Brain and Hand - Node.js Runtime
 * Runs OpenClaw inside nodejs-mobile on Android
 */

// Support both nodejs-mobile and local testing
let bridge;
try {
  bridge = require('rn-bridge');
} catch (e) {
  // Local testing mode - use mock bridge
  bridge = global.bridge || {
    app: { datadir: () => process.env.HOME || '/tmp' },
    channel: {
      on: () => {},
      send: (msg) => console.log('[Bridge]', msg),
    }
  };
}
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// State
let gatewayProcess = null;
let logs = [];

// Data directory from React Native
const DATA_DIR = bridge.app.datadir();
const OPENCLAW_HOME = path.join(DATA_DIR, '.openclaw');

// Ensure directories
function ensureDirs() {
  [OPENCLAW_HOME, path.join(OPENCLAW_HOME, 'workspace')].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Send to React Native
function send(data) {
  bridge.channel.send(JSON.stringify(data));
}

function log(text, type = 'info') {
  const entry = { time: new Date().toISOString(), text, type };
  logs.push(entry);
  send({ type: 'log', ...entry });
}

// Run OpenClaw command
function runOpenClaw(args, onData, onExit) {
  log(`Running: openclaw ${args.join(' ')}`, 'system');
  
  // Set environment
  const env = {
    ...process.env,
    HOME: DATA_DIR,
    OPENCLAW_HOME: OPENCLAW_HOME,
    NODE_ENV: 'production',
  };
  
  try {
    // Try to find openclaw in node_modules
    const openclawBin = path.join(__dirname, 'node_modules', '.bin', 'openclaw');
    const openclawMjs = path.join(__dirname, 'node_modules', 'openclaw', 'openclaw.mjs');
    
    let cmd, cmdArgs;
    
    if (fs.existsSync(openclawBin)) {
      cmd = openclawBin;
      cmdArgs = args;
    } else if (fs.existsSync(openclawMjs)) {
      cmd = process.execPath;
      cmdArgs = [openclawMjs, ...args];
    } else {
      log('OpenClaw not found in node_modules', 'error');
      log('Trying global openclaw...', 'info');
      cmd = 'openclaw';
      cmdArgs = args;
    }
    
    const proc = spawn(cmd, cmdArgs, {
      env,
      cwd: OPENCLAW_HOME,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    
    proc.stdout.on('data', (data) => {
      const text = data.toString().trim();
      if (text) {
        log(text, 'info');
        if (onData) onData(text);
      }
    });
    
    proc.stderr.on('data', (data) => {
      const text = data.toString().trim();
      if (text) {
        log(text, 'error');
      }
    });
    
    proc.on('error', (err) => {
      log(`Process error: ${err.message}`, 'error');
    });
    
    proc.on('exit', (code) => {
      log(`Process exited with code ${code}`, code === 0 ? 'success' : 'error');
      if (onExit) onExit(code);
    });
    
    return proc;
    
  } catch (err) {
    log(`Failed to spawn: ${err.message}`, 'error');
    return null;
  }
}

// Start gateway
function startGateway(apiKey) {
  if (gatewayProcess) {
    log('Gateway already running', 'error');
    return;
  }
  
  // Write config if API key provided
  if (apiKey) {
    process.env.ANTHROPIC_API_KEY = apiKey;
  }
  
  log('Starting OpenClaw gateway...', 'system');
  
  gatewayProcess = runOpenClaw(['gateway', '--verbose'], null, (code) => {
    gatewayProcess = null;
    send({ type: 'gateway_stopped', code });
  });
  
  if (gatewayProcess) {
    send({ type: 'gateway_started' });
  }
}

// Stop gateway
function stopGateway() {
  if (!gatewayProcess) {
    log('Gateway not running', 'info');
    return;
  }
  
  log('Stopping gateway...', 'system');
  gatewayProcess.kill('SIGTERM');
  
  setTimeout(() => {
    if (gatewayProcess) {
      gatewayProcess.kill('SIGKILL');
    }
  }, 5000);
}

// Run onboard (non-interactive with API key)
function runOnboard(apiKey) {
  if (!apiKey) {
    log('Error: API key required for onboard', 'error');
    return;
  }
  
  log('Running OpenClaw onboard (non-interactive)...', 'system');
  
  const args = [
    'onboard',
    '--non-interactive',
    '--accept-risk',
    '--anthropic-api-key', apiKey,
    '--mode', 'local',
  ];
  
  runOpenClaw(args, null, (code) => {
    if (code === 0) {
      log('OpenClaw configured successfully!', 'success');
    }
    send({ type: 'onboard_complete', code });
  });
}

// Handle messages from React Native
bridge.channel.on('message', (msg) => {
  let data;
  try {
    data = JSON.parse(msg);
  } catch (e) {
    log(`Parse error: ${e.message}`, 'error');
    return;
  }

  const { cmd } = data;

  switch (cmd) {
    case 'ping':
      send({ type: 'pong', node: process.version });
      break;

    case 'status':
      send({
        type: 'status',
        running: gatewayProcess !== null,
        node: process.version,
        openclawHome: OPENCLAW_HOME,
      });
      break;

    case 'start':
      startGateway(data.apiKey);
      break;

    case 'stop':
      stopGateway();
      break;

    case 'onboard':
      runOnboard(data.apiKey);
      break;

    case 'doctor':
      runOpenClaw(['doctor']);
      break;

    case 'version':
      runOpenClaw(['--version']);
      break;

    default:
      log(`Unknown command: ${cmd}`, 'error');
  }
});

// Startup
ensureDirs();
log('Node.js runtime initialized', 'system');
log(`Version: ${process.version}`, 'info');
log(`Data dir: ${DATA_DIR}`, 'info');

// Check if openclaw is available
const openclawPath = path.join(__dirname, 'node_modules', 'openclaw');
if (fs.existsSync(openclawPath)) {
  log('OpenClaw package found ✓', 'success');
} else {
  log('OpenClaw package not found (will try global)', 'error');
}

send({ type: 'ready', node: process.version });
