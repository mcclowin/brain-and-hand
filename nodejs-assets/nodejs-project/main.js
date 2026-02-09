/**
 * Brain and Hand - Node.js Runtime
 * Runs OpenClaw inside nodejs-mobile on Android
 */

const bridge = require('rn-bridge');
const path = require('path');
const fs = require('fs');
const os = require('os');

// State
let gateway = null;
let config = null;

// Paths - nodejs-mobile provides a documents directory
const DATA_DIR = bridge.app.datadir();
const OPENCLAW_HOME = path.join(DATA_DIR, '.openclaw');
const CONFIG_PATH = path.join(OPENCLAW_HOME, 'openclaw.json');
const WORKSPACE_DIR = path.join(OPENCLAW_HOME, 'workspace');

// Ensure directories exist
function ensureDirs() {
  [OPENCLAW_HOME, WORKSPACE_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Send message to React Native
function send(data) {
  bridge.channel.send(JSON.stringify(data));
}

function log(msg) {
  console.log(`[Node] ${msg}`);
  send({ type: 'log', message: msg });
}

function error(msg) {
  console.error(`[Node] ${msg}`);
  send({ type: 'error', message: msg });
}

// Generate minimal OpenClaw config
function generateConfig(apiKey, provider = 'anthropic') {
  return {
    meta: {
      lastTouchedVersion: '2026.2.0',
      lastTouchedAt: new Date().toISOString(),
    },
    auth: {
      profiles: {
        [`${provider}:default`]: {
          provider: provider,
          mode: 'token',
        },
      },
    },
    agents: {
      defaults: {
        workspace: WORKSPACE_DIR,
      },
    },
    gateway: {
      port: 18789,
      mode: 'local',
      bind: 'loopback',
    },
  };
}

// Write config to disk
function saveConfig(cfg) {
  ensureDirs();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
  // Store API key in environment (OpenClaw reads from env)
  if (cfg._apiKey) {
    process.env.ANTHROPIC_API_KEY = cfg._apiKey;
    process.env.OPENAI_API_KEY = cfg._apiKey;
    delete cfg._apiKey;
  }
  log(`Config saved to ${CONFIG_PATH}`);
}

// Load existing config
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    }
  } catch (e) {
    log(`No existing config: ${e.message}`);
  }
  return null;
}

// Start OpenClaw gateway
async function startGateway() {
  if (gateway) {
    log('Gateway already running');
    send({ type: 'started', already: true });
    return;
  }

  if (!config) {
    error('Not configured');
    return;
  }

  try {
    log('Starting OpenClaw gateway...');
    
    // Set environment for OpenClaw
    process.env.OPENCLAW_HOME = OPENCLAW_HOME;
    process.env.HOME = DATA_DIR;
    
    // Try to load and start OpenClaw
    // Option 1: Direct import (if openclaw is bundled)
    try {
      const openclaw = require('openclaw');
      if (openclaw.startGateway) {
        gateway = await openclaw.startGateway({ port: 18789 });
        log('Gateway started via openclaw module');
        send({ type: 'started', port: 18789 });
        return;
      }
    } catch (e) {
      log(`Direct import failed: ${e.message}`);
    }

    // Option 2: Start a simple HTTP server as placeholder
    // (Real OpenClaw integration needs the npm package bundled)
    const http = require('http');
    
    gateway = http.createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', engine: 'brain-and-hand' }));
        return;
      }
      
      if (req.url === '/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const { message } = JSON.parse(body);
            // TODO: Call actual LLM here
            const response = { reply: `Echo: ${message}` };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
          } catch (e) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }
      
      res.writeHead(404);
      res.end('Not found');
    });
    
    gateway.listen(18789, '127.0.0.1', () => {
      log('Gateway started on port 18789 (placeholder mode)');
      send({ type: 'started', port: 18789, mode: 'placeholder' });
    });
    
  } catch (e) {
    error(`Failed to start gateway: ${e.message}`);
    send({ type: 'error', message: e.message });
  }
}

// Stop gateway
async function stopGateway() {
  if (!gateway) {
    log('Gateway not running');
    send({ type: 'stopped', already: true });
    return;
  }

  try {
    gateway.close();
    gateway = null;
    log('Gateway stopped');
    send({ type: 'stopped' });
  } catch (e) {
    error(`Failed to stop: ${e.message}`);
  }
}

// Handle commands from React Native
bridge.channel.on('message', async (msg) => {
  log(`Received: ${msg}`);
  
  let data;
  try {
    data = JSON.parse(msg);
  } catch (e) {
    error(`Parse error: ${e.message}`);
    return;
  }

  const { cmd } = data;

  switch (cmd) {
    case 'ping':
      send({ type: 'pong', node: process.version, platform: process.platform });
      break;

    case 'status':
      send({
        type: 'status',
        running: gateway !== null,
        configured: config !== null,
        node: process.version,
        dataDir: DATA_DIR,
        openclawHome: OPENCLAW_HOME,
      });
      break;

    case 'configure':
      try {
        config = generateConfig(data.apiKey, data.provider || 'anthropic');
        config._apiKey = data.apiKey; // Temporarily store for env var
        saveConfig(config);
        send({ type: 'configured', provider: data.provider || 'anthropic' });
      } catch (e) {
        error(`Configure failed: ${e.message}`);
      }
      break;

    case 'start':
      await startGateway();
      break;

    case 'stop':
      await stopGateway();
      break;

    case 'chat':
      // Direct chat (bypass gateway)
      if (!config) {
        send({ type: 'chat_response', error: 'Not configured' });
        return;
      }
      // TODO: Implement direct LLM call
      send({ type: 'chat_response', message: `Echo: ${data.text}` });
      break;

    case 'getConfig':
      send({ type: 'config', config: loadConfig(), path: CONFIG_PATH });
      break;

    default:
      error(`Unknown command: ${cmd}`);
  }
});

// Startup
ensureDirs();
config = loadConfig();

log('Node.js runtime initialized');
log(`Version: ${process.version}`);
log(`Platform: ${process.platform}`);
log(`Data dir: ${DATA_DIR}`);
log(`OpenClaw home: ${OPENCLAW_HOME}`);

send({ 
  type: 'ready', 
  node: process.version,
  configured: config !== null,
  dataDir: DATA_DIR,
});
