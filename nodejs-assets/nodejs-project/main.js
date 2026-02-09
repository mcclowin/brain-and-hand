/**
 * Brain and Hand - Node.js Runtime
 * Runs inside nodejs-mobile on Android/iOS
 */

const bridge = require('rn-bridge');

// State
let config = null;
let gatewayRunning = false;

function send(data) {
  bridge.channel.send(JSON.stringify(data));
}

function log(msg) {
  console.log(`[Node] ${msg}`);
}

// Handle commands from React Native
bridge.channel.on('message', (msg) => {
  log(`Received: ${msg}`);
  
  try {
    const data = JSON.parse(msg);
    handleCommand(data);
  } catch (e) {
    send({ type: 'error', message: `Parse error: ${e.message}` });
  }
});

function handleCommand(data) {
  const { cmd } = data;

  switch (cmd) {
    case 'ping':
      send({ type: 'pong', node: process.version });
      break;

    case 'status':
      send({
        type: 'status',
        running: gatewayRunning,
        configured: config !== null,
        node: process.version,
      });
      break;

    case 'configure':
      config = {
        apiKey: data.apiKey,
        provider: data.provider || 'anthropic',
      };
      log(`Configured with provider: ${config.provider}`);
      send({ type: 'configured', provider: config.provider });
      break;

    case 'start':
      if (!config) {
        send({ type: 'error', message: 'Not configured' });
        return;
      }
      gatewayRunning = true;
      log('Gateway started');
      send({ type: 'started' });
      // TODO: Actually start OpenClaw gateway here
      break;

    case 'stop':
      gatewayRunning = false;
      log('Gateway stopped');
      send({ type: 'stopped' });
      break;

    case 'chat':
      // TODO: Send to LLM
      send({
        type: 'chat_response',
        message: `Echo: ${data.text}`,
      });
      break;

    default:
      send({ type: 'error', message: `Unknown command: ${cmd}` });
  }
}

// Startup
log('Node.js runtime started');
log(`Version: ${process.version}`);
send({ type: 'ready', node: process.version });
