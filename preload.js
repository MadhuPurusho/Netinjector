const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('netscanner', {
  getNetworkInfo: () => ipcRenderer.invoke('network:get-info'),

  startScan: (subnet, ports) => ipcRenderer.send('scan:start', { subnet, ports }),

  stopScan: () => ipcRenderer.send('scan:stop'),

  checkPort: (ip, port) => ipcRenderer.invoke('host:check-port', { ip, port }),

  onScanStarted: (cb) => {
    ipcRenderer.on('scan:started', () => cb());
    return () => ipcRenderer.removeAllListeners('scan:started');
  },

  onDeviceFound: (cb) => {
    ipcRenderer.on('scan:device-found', (_, device) => cb(device));
    return () => ipcRenderer.removeAllListeners('scan:device-found');
  },

  onProgress: (cb) => {
    ipcRenderer.on('scan:progress', (_, data) => cb(data));
    return () => ipcRenderer.removeAllListeners('scan:progress');
  },

  onScanComplete: (cb) => {
    ipcRenderer.on('scan:complete', () => cb());
    return () => ipcRenderer.removeAllListeners('scan:complete');
  },
});
