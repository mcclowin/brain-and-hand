import React, {useEffect, useState, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';

// nodejs-mobile bridge (will be undefined if not available)
let nodejs: any = null;
try {
  nodejs = require('nodejs-mobile-react-native');
} catch (e) {
  console.log('nodejs-mobile not available');
}

// Pre-configured API key (set via GitHub Secrets or local config)
const PRECONFIGURED_KEY = '%%ANTHROPIC_API_KEY%%';

type LogEntry = {
  time: string;
  text: string;
  type: 'info' | 'error' | 'success' | 'system';
};

function App(): React.JSX.Element {
  const hasPreconfig = PRECONFIGURED_KEY && !PRECONFIGURED_KEY.includes('%%');
  const [apiKey, setApiKey] = useState<string>(hasPreconfig ? PRECONFIGURED_KEY : '');
  const [saved, setSaved] = useState<boolean>(hasPreconfig);
  const [running, setRunning] = useState<boolean>(false);
  const [nodeReady, setNodeReady] = useState<boolean>(false);
  const [wizardMode, setWizardMode] = useState<boolean>(false);
  const [wizardInput, setWizardInput] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  function getTime(): string {
    return new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit', second: '2-digit'});
  }

  function addLog(text: string, type: LogEntry['type'] = 'info') {
    setLogs(prev => [...prev.slice(-200), {time: getTime(), text, type}]);
    setTimeout(() => scrollRef.current?.scrollToEnd({animated: true}), 100);
  }

  useEffect(() => {
    addLog('Brain & Hand v0.1.0', 'system');
    
    if (!nodejs) {
      addLog('nodejs-mobile not available', 'error');
      addLog('Running in UI-only mode', 'info');
      return;
    }

    addLog('Initializing Node.js runtime...', 'info');

    // Listen for messages from Node.js
    nodejs.channel.addListener('message', (msg: string) => {
      try {
        const data = JSON.parse(msg);
        
        switch (data.type) {
          case 'ready':
            setNodeReady(true);
            addLog(`Node.js ${data.node} ready ✓`, 'success');
            break;
          case 'pong':
            addLog(`Pong: Node.js ${data.node}`, 'success');
            break;
          case 'log':
            addLog(data.text, data.type || 'info');
            break;
          case 'gateway_started':
            setRunning(true);
            addLog('Gateway started ✓', 'success');
            break;
          case 'gateway_stopped':
            setRunning(false);
            addLog(`Gateway stopped (code: ${data.code})`, 'info');
            break;
          case 'status':
            addLog(`─── Status ───`, 'system');
            addLog(`Node: ${data.node}`, 'info');
            addLog(`Gateway: ${data.running ? 'RUNNING' : 'STOPPED'}`, data.running ? 'success' : 'info');
            addLog(`Home: ${data.openclawHome}`, 'info');
            break;
          case 'wizard_started':
            setWizardMode(true);
            addLog('─── OpenClaw Setup Wizard ───', 'system');
            break;
          case 'wizard_output':
            addLog(data.text, data.isError ? 'error' : 'info');
            break;
          case 'wizard_exit':
            setWizardMode(false);
            addLog(`Wizard exited (code: ${data.code})`, data.code === 0 ? 'success' : 'error');
            break;
          case 'error':
            addLog(data.message, 'error');
            break;
          default:
            addLog(JSON.stringify(data), 'info');
        }
      } catch (e) {
        addLog(msg, 'info');
      }
    });

    // Start Node.js
    nodejs.start('main.js');

    return () => {
      if (nodejs) {
        nodejs.channel.removeAllListeners('message');
      }
    };
  }, []);

  function sendCommand(cmd: string, payload: any = {}) {
    if (!nodejs) {
      addLog('Node.js not available', 'error');
      return;
    }
    nodejs.channel.send(JSON.stringify({ cmd, ...payload }));
  }

  function handleSave() {
    if (!apiKey.trim()) {
      addLog('Error: API key required', 'error');
      return;
    }
    setSaved(true);
    addLog(`API key saved (${apiKey.slice(0, 12)}...)`, 'success');
  }

  function handleStart() {
    if (!saved && !hasPreconfig) {
      addLog('Error: Configure API key first', 'error');
      return;
    }
    addLog('Starting OpenClaw gateway...', 'system');
    sendCommand('start', { apiKey });
    
    // Fallback for UI-only mode
    if (!nodejs) {
      setRunning(true);
      setTimeout(() => addLog('(Simulated) Gateway started', 'success'), 500);
    }
  }

  function handleStop() {
    addLog('Stopping gateway...', 'system');
    sendCommand('stop');
    
    if (!nodejs) {
      setRunning(false);
      setTimeout(() => addLog('(Simulated) Gateway stopped', 'info'), 300);
    }
  }

  function handleStatus() {
    sendCommand('status');
    
    if (!nodejs) {
      addLog('─── Status ───', 'system');
      addLog(`Gateway: ${running ? 'RUNNING' : 'STOPPED'}`, running ? 'success' : 'info');
      addLog(`Mode: UI-only (no Node.js)`, 'error');
    }
  }

  function handleDoctor() {
    addLog('Running openclaw doctor...', 'system');
    sendCommand('doctor');
  }

  function handleOnboard() {
    addLog('Starting OpenClaw setup wizard...', 'system');
    sendCommand('onboard');
  }

  function handleWizardSubmit() {
    if (!wizardInput.trim()) return;
    addLog(`> ${wizardInput}`, 'system');
    sendCommand('wizard_input', { text: wizardInput });
    setWizardInput('');
  }

  function getLogColor(type: LogEntry['type']): string {
    switch (type) {
      case 'error': return '#ef4444';
      case 'success': return '#22c55e';
      case 'system': return '#8b5cf6';
      default: return '#888';
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🧠 Brain & Hand</Text>
        <View style={[styles.statusBadge, running && styles.statusRunning]}>
          <Text style={styles.statusText}>
            {running ? '● RUNNING' : '○ STOPPED'}
          </Text>
        </View>
      </View>

      {/* Config */}
      <View style={styles.config}>
        <TextInput
          style={styles.input}
          placeholder="Anthropic API Key (sk-ant-...)"
          placeholderTextColor="#555"
          value={apiKey}
          onChangeText={setApiKey}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!saved}
        />
        {!saved ? (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.savedBtn} onPress={() => setSaved(false)}>
            <Text style={styles.savedBtnText}>✓</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.btn, styles.onboardBtn]} 
          onPress={handleOnboard}
        >
          <Text style={styles.btnText}>⚙ Setup</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.btn, styles.startBtn, running && styles.btnDisabled]} 
          onPress={handleStart}
          disabled={running}
        >
          <Text style={styles.btnText}>▶ Start</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.btn, styles.stopBtn, !running && styles.btnDisabled]} 
          onPress={handleStop}
          disabled={!running}
        >
          <Text style={styles.btnText}>⏹ Stop</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={[styles.btn, styles.statusBtn]} onPress={handleStatus}>
          <Text style={styles.btnText}>Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.statusBtn]} onPress={handleDoctor}>
          <Text style={styles.btnText}>Doctor</Text>
        </TouchableOpacity>
      </View>

      {/* Log Viewer */}
      <View style={styles.logContainer}>
        <Text style={styles.logHeader}>
          ─── OpenClaw Logs ─── {nodeReady ? '🟢' : nodejs ? '🟡' : '🔴'}
        </Text>
        <ScrollView 
          ref={scrollRef}
          style={styles.logScroll}
          contentContainerStyle={styles.logContent}
        >
          {logs.map((log, i) => (
            <Text key={i} style={[styles.logLine, {color: getLogColor(log.type)}]}>
              <Text style={styles.logTime}>[{log.time}]</Text> {log.text}
            </Text>
          ))}
          <Text style={styles.cursor}>▌</Text>
        </ScrollView>
      </View>

      {/* Wizard Input (shown when wizard is running) */}
      {wizardMode && (
        <View style={styles.wizardInput}>
          <TextInput
            style={styles.wizardTextInput}
            placeholder="Type your answer..."
            placeholderTextColor="#555"
            value={wizardInput}
            onChangeText={setWizardInput}
            onSubmitEditing={handleWizardSubmit}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.wizardSendBtn} onPress={handleWizardSubmit}>
            <Text style={styles.wizardSendText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {wizardMode ? '🟣 Wizard Running' : nodejs ? (nodeReady ? '🟢 Node.js Ready' : '🟡 Loading...') : '🔴 UI Only'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  statusRunning: {
    backgroundColor: '#052e16',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  config: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  input: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  saveBtn: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  savedBtn: {
    backgroundColor: '#052e16',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  savedBtnText: {
    color: '#22c55e',
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  onboardBtn: {
    backgroundColor: '#7c3aed',
  },
  startBtn: {
    backgroundColor: '#166534',
  },
  stopBtn: {
    backgroundColor: '#991b1b',
  },
  statusBtn: {
    backgroundColor: '#1e3a5f',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  logContainer: {
    flex: 1,
    margin: 12,
    backgroundColor: '#050508',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
  },
  logHeader: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: '#0a0a0f',
    fontFamily: 'monospace',
  },
  logScroll: {
    flex: 1,
  },
  logContent: {
    padding: 12,
  },
  logLine: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  logTime: {
    color: '#444',
  },
  cursor: {
    color: '#8b5cf6',
    fontFamily: 'monospace',
  },
  wizardInput: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#7c3aed',
    backgroundColor: '#1a1a2e',
  },
  wizardTextInput: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  wizardSendBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  wizardSendText: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  footerText: {
    color: '#444',
    fontSize: 12,
  },
  footerLink: {
    color: '#8b5cf6',
    fontSize: 12,
  },
});

export default App;
