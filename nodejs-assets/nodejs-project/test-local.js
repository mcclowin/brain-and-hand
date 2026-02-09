// Mock bridge for local testing
global.bridge = {
  app: { datadir: () => '/tmp/brain-and-hand-test' },
  channel: {
    listeners: {},
    on: function(event, cb) { this.listeners[event] = cb; },
    send: (msg) => console.log('[TO RN]', msg),
    emit: function(event, data) { if (this.listeners[event]) this.listeners[event](data); }
  }
};

require('./main.js');

// Simulate commands
setTimeout(() => {
  console.log('\n--- Ping ---');
  global.bridge.channel.emit('message', JSON.stringify({ cmd: 'ping' }));
}, 500);

setTimeout(() => {
  console.log('\n--- Status ---');
  global.bridge.channel.emit('message', JSON.stringify({ cmd: 'status' }));
}, 1500);

setTimeout(() => {
  console.log('\n--- Version ---');
  global.bridge.channel.emit('message', JSON.stringify({ cmd: 'version' }));
}, 2500);

setTimeout(() => process.exit(0), 8000);
