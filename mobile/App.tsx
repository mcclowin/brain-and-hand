import React, {useEffect, useState} from 'react';
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

// nodejs-mobile bridge
import nodejs from 'nodejs-mobile-react-native';

type LogEntry = {
  time: string;
  msg: string;
  type: 'sent' | 'received' | 'system';
};

function App(): React.JSX.Element {
  const [status, setStatus] = useState<string>('Initializing...');
  const [nodeReady, setNodeReady] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  const [configured, setConfigured] = useState<boolean>(false);

  const addLog = (msg: string, type: LogEntry['type'] = 'system') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-50), {time, msg, type}]);
  };

  useEffect(() => {
    // Listen for messages from Node.js
    nodejs.channel.addListener('message', (msg: string) => {
      addLog(msg, 'received');
      
      try {
        const data = JSON.parse(msg);
        if (data.type === 'pong') {
          setStatus('Node.js running ✓');
          setNodeReady(true);
        } else if (data.type === 'status') {
          setStatus(data.running ? 'Gateway running ✓' : 'Gateway stopped');
        } else if (data.type === 'configured') {
          setConfigured(true);
          setStatus('Configured ✓');
        } else if (data.type === 'started') {
          setStatus('Gateway running ✓');
        } else if (data.type === 'error') {
          setStatus(`Error: ${data.message}`);
        }
      } catch (e) {
        // Not JSON, just display
        setStatus(msg);
      }
    });

    // Start Node.js
    addLog('Starting Node.js...', 'system');
    nodejs.start('main.js');

    // Send initial ping after a short delay
    setTimeout(() => {
      sendCommand('ping');
    }, 1000);

    return () => {
      nodejs.channel.removeAllListeners('message');
    };
  }, []);

  const sendCommand = (cmd: string, payload: any = {}) => {
    const msg = JSON.stringify({cmd, ...payload});
    addLog(`→ ${cmd}`, 'sent');
    nodejs.channel.send(msg);
  };

  const handleConfigure = () => {
    if (!apiKey.trim()) {
      addLog('Please enter an API key', 'system');
      return;
    }
    sendCommand('configure', {
      apiKey: apiKey.trim(),
      provider: 'anthropic',
    });
  };

  const handleStart = () => {
    sendCommand('start');
  };

  const handleStop = () => {
    sendCommand('stop');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🧠 Brain & Hand</Text>
        <Text style={styles.status}>{status}</Text>
      </View>

      {!nodeReady ? (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Starting Node.js runtime...</Text>
        </View>
      ) : !configured ? (
        <View style={styles.setup}>
          <Text style={styles.sectionTitle}>Setup</Text>
          <TextInput
            style={styles.input}
            placeholder="Anthropic API Key"
            placeholderTextColor="#666"
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={handleConfigure}>
            <Text style={styles.buttonText}>Configure</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.controls}>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={handleStart}>
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={handleStop}>
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => sendCommand('status')}>
            <Text style={styles.secondaryButtonText}>Check Status</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.logSection}>
        <Text style={styles.sectionTitle}>Log</Text>
        <ScrollView style={styles.logScroll}>
          {logs.map((log, i) => (
            <Text
              key={i}
              style={[
                styles.logEntry,
                log.type === 'sent' && styles.logSent,
                log.type === 'received' && styles.logReceived,
              ]}>
              [{log.time}] {log.msg}
            </Text>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  status: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  setup: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#2a2a4e',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  controls: {
    padding: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#6c5ce7',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#6c5ce7',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6c5ce7',
    fontSize: 16,
  },
  logSection: {
    flex: 1,
    padding: 20,
  },
  logScroll: {
    flex: 1,
    backgroundColor: '#0d0d1a',
    borderRadius: 8,
    padding: 12,
  },
  logEntry: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  logSent: {
    color: '#6c5ce7',
  },
  logReceived: {
    color: '#2ecc71',
  },
});

export default App;
