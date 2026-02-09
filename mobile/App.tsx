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
} from 'react-native';

type LogEntry = {
  time: string;
  text: string;
  type: 'info' | 'error' | 'success' | 'system';
};

// Pre-configured API key (set via GitHub Secrets or local config)
const PRECONFIGURED_KEY = '%%ANTHROPIC_API_KEY%%'; // Replaced at build time

function App(): React.JSX.Element {
  const hasPreconfig = PRECONFIGURED_KEY && !PRECONFIGURED_KEY.includes('%%');
  const [apiKey, setApiKey] = useState<string>(hasPreconfig ? PRECONFIGURED_KEY : '');
  const [saved, setSaved] = useState<boolean>(hasPreconfig);
  const [running, setRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    {time: getTime(), text: 'Brain & Hand v0.1.0', type: 'system'},
    {time: getTime(), text: hasPreconfig ? 'API key pre-configured ✓' : 'Enter API key to continue', type: hasPreconfig ? 'success' : 'info'},
  ]);
  const scrollRef = useRef<ScrollView>(null);

  function getTime(): string {
    return new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit', second: '2-digit'});
  }

  function addLog(text: string, type: LogEntry['type'] = 'info') {
    setLogs(prev => [...prev.slice(-100), {time: getTime(), text, type}]);
    setTimeout(() => scrollRef.current?.scrollToEnd({animated: true}), 100);
  }

  function handleSave() {
    if (!apiKey.trim()) {
      addLog('Error: API key required', 'error');
      return;
    }
    setSaved(true);
    addLog(`API key saved (${apiKey.slice(0, 8)}...)`, 'success');
    addLog('Ready to start gateway', 'info');
  }

  function handleStart() {
    if (!saved) {
      addLog('Error: Configure API key first', 'error');
      return;
    }
    setRunning(true);
    addLog('Starting OpenClaw gateway...', 'system');
    
    // Simulate startup sequence (will be real with nodejs-mobile)
    setTimeout(() => addLog('Initializing Node.js runtime...', 'info'), 300);
    setTimeout(() => addLog('Loading configuration...', 'info'), 600);
    setTimeout(() => addLog('Gateway binding to 127.0.0.1:18789', 'info'), 900);
    setTimeout(() => addLog('OpenClaw gateway started ✓', 'success'), 1200);
    setTimeout(() => addLog('Waiting for messages...', 'info'), 1500);
  }

  function handleStop() {
    setRunning(false);
    addLog('Stopping gateway...', 'system');
    setTimeout(() => addLog('Gateway stopped', 'info'), 300);
  }

  function handleStatus() {
    addLog('─── Status ───', 'system');
    addLog(`Gateway: ${running ? 'RUNNING' : 'STOPPED'}`, running ? 'success' : 'info');
    addLog(`API Key: ${saved ? 'configured' : 'not set'}`, saved ? 'success' : 'error');
    addLog(`Platform: Android (nodejs-mobile)`, 'info');
    addLog('──────────────', 'system');
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
          <Text style={styles.statusText}>{running ? '● RUNNING' : '○ STOPPED'}</Text>
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
        <TouchableOpacity style={[styles.btn, styles.statusBtn]} onPress={handleStatus}>
          <Text style={styles.btnText}>Status</Text>
        </TouchableOpacity>
      </View>

      {/* Log Viewer */}
      <View style={styles.logContainer}>
        <Text style={styles.logHeader}>─── OpenClaw Logs ───</Text>
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

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Phase 1: UI Only • nodejs-mobile coming soon</Text>
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
  footer: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  footerText: {
    color: '#444',
    fontSize: 12,
  },
});

export default App;
