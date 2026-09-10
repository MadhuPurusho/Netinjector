const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const dns = require('dns');
const net = require('net');
const { exec } = require('child_process');
const ping = require('ping');

// OUI dictionary for device manufacturer identification
const OUI_MAP = {
  // Apple
  '00:03:93': 'Apple', '00:05:02': 'Apple', '00:0A:27': 'Apple', '00:0A:95': 'Apple',
  '00:0D:93': 'Apple', '00:11:24': 'Apple', '00:14:51': 'Apple', '00:16:CB': 'Apple',
  '00:17:F2': 'Apple', '00:19:E3': 'Apple', '00:1B:63': 'Apple', '00:1C:B3': 'Apple',
  '00:1D:4F': 'Apple', '00:1E:52': 'Apple', '00:1E:C2': 'Apple', '00:1F:5B': 'Apple',
  '00:1F:F3': 'Apple', '00:21:E9': 'Apple', '00:22:41': 'Apple', '00:23:12': 'Apple',
  '00:23:32': 'Apple', '00:23:6C': 'Apple', '00:23:DF': 'Apple', '00:24:36': 'Apple',
  '00:25:00': 'Apple', '00:25:4B': 'Apple', '00:25:BC': 'Apple', '00:26:08': 'Apple',
  '00:26:4A': 'Apple', '00:26:B0': 'Apple', '00:26:BB': 'Apple', '00:30:65': 'Apple',
  '00:3E:E1': 'Apple', '00:50:E4': 'Apple', '00:56:CD': 'Apple', '00:61:71': 'Apple',
  '04:0C:CE': 'Apple', '04:15:52': 'Apple', '04:1E:64': 'Apple', '04:26:65': 'Apple',
  '04:52:F3': 'Apple', '04:54:53': 'Apple', '04:69:F8': 'Apple', '04:D3:CF': 'Apple',
  '04:E5:36': 'Apple', '04:F1:3E': 'Apple', '08:00:07': 'Apple', '08:66:98': 'Apple',
  '08:6D:41': 'Apple', '08:70:45': 'Apple', '08:74:02': 'Apple', '0C:15:39': 'Apple',
  '0C:1D:CF': 'Apple', '0C:30:21': 'Apple', '0C:3E:9F': 'Apple', '0C:4D:E9': 'Apple',
  '0C:51:01': 'Apple', '0C:74:C2': 'Apple', '0C:77:1A': 'Apple', '10:1C:0C': 'Apple',
  '10:40:F3': 'Apple', '10:41:7F': 'Apple', '10:9A:DD': 'Apple', '10:DD:B1': 'Apple',
  '14:10:9F': 'Apple', '14:5A:05': 'Apple', '14:8F:C6': 'Apple', '14:99:E2': 'Apple',
  '18:20:32': 'Apple', '18:34:51': 'Apple', '18:65:90': 'Apple', '18:81:0E': 'Apple',
  '18:9E:FC': 'Apple', '18:AF:61': 'Apple', '18:E7:F4': 'Apple', '1C:1A:C0': 'Apple',
  '1C:36:BB': 'Apple', '1C:5C:F2': 'Apple', '1C:E6:2B': 'Apple', '20:78:F0': 'Apple',
  '20:7D:74': 'Apple', '20:9B:CD': 'Apple', '20:A2:E4': 'Apple', '20:AB:37': 'Apple',
  '24:1E:EB': 'Apple', '24:5B:A7': 'Apple', '24:A0:74': 'Apple', '28:0B:5C': 'Apple',
  '28:37:37': 'Apple', '28:6A:B8': 'Apple', '28:A0:2B': 'Apple', '28:CF:DA': 'Apple',
  '28:CF:E9': 'Apple', '2C:1F:23': 'Apple', '2C:B4:3A': 'Apple', '2C:BE:08': 'Apple',
  '2C:F0:EE': 'Apple', '30:10:B3': 'Apple', '30:35:AD': 'Apple', '30:63:6B': 'Apple',
  '30:90:AB': 'Apple', '34:08:BC': 'Apple', '34:15:9E': 'Apple', '34:36:3B': 'Apple',
  '34:A3:95': 'Apple', '34:C0:59': 'Apple', '38:0F:4A': 'Apple', '38:48:4C': 'Apple',
  '38:53:9C': 'Apple', '38:66:F0': 'Apple', '3C:07:54': 'Apple', '3C:15:C2': 'Apple',
  '3C:2E:F9': 'Apple', '3C:D0:F8': 'Apple', '40:30:04': 'Apple', '40:33:1A': 'Apple',
  '40:3C:FC': 'Apple', '40:6C:8F': 'Apple', '40:98:AD': 'Apple', '40:A6:D9': 'Apple',
  '44:00:10': 'Apple', '44:2A:60': 'Apple', '44:4C:0C': 'Apple', '44:D8:84': 'Apple',
  '48:43:7C': 'Apple', '48:60:BC': 'Apple', '48:74:6E': 'Apple', '48:A1:95': 'Apple',
  '48:BF:6B': 'Apple', '4C:32:75': 'Apple', '4C:57:CA': 'Apple', '4C:74:BF': 'Apple',
  '4C:8D:79': 'Apple', '4C:B1:99': 'Apple', '50:82:D5': 'Apple', '50:BC:96': 'Apple',
  '50:EA:D6': 'Apple', '54:26:96': 'Apple', '54:33:CB': 'Apple', '54:4E:90': 'Apple',
  '54:72:4F': 'Apple', '54:9F:13': 'Apple', '54:AE:27': 'Apple', '54:E4:3A': 'Apple',
  '58:1F:AA': 'Apple', '58:55:CA': 'Apple', '58:7F:57': 'Apple', '58:B0:35': 'Apple',
  '5C:1D:D9': 'Apple', '5C:59:48': 'Apple', '5C:F9:38': 'Apple', '60:03:08': 'Apple',
  '60:33:4B': 'Apple', '60:69:44': 'Apple', '60:C5:47': 'Apple', '60:D9:C7': 'Apple',
  '60:F4:45': 'Apple', '60:FA:CD': 'Apple', '60:FB:42': 'Apple', '64:20:0C': 'Apple',
  '64:76:BA': 'Apple', '64:A3:CB': 'Apple', '64:B9:E8': 'Apple', '68:09:27': 'Apple',
  '68:5B:35': 'Apple', '68:64:4B': 'Apple', '68:96:7B': 'Apple', '68:A8:6D': 'Apple',
  '6C:19:8F': 'Apple', '6C:3E:6D': 'Apple', '6C:40:08': 'Apple', '6C:70:9F': 'Apple',
  '6C:94:F8': 'Apple', '6C:96:CF': 'Apple', '70:11:24': 'Apple', '70:14:A6': 'Apple',
  '70:3E:AC': 'Apple', '70:56:81': 'Apple', '70:73:CB': 'Apple', '70:CD:60': 'Apple',
  '70:DE:E2': 'Apple', '70:EC:E4': 'Apple', '74:1B:B2': 'Apple', '74:8D:08': 'Apple',
  '74:E2:F5': 'Apple', '78:31:C1': 'Apple', '78:4F:43': 'Apple', '78:67:D7': 'Apple',
  '78:6C:1C': 'Apple', '78:7B:8A': 'Apple', '78:CA:39': 'Apple', '78:D7:5F': 'Apple',
  '7C:01:91': 'Apple', '7C:04:D0': 'Apple', '7C:11:BE': 'Apple', '7C:6D:62': 'Apple',
  '7C:C3:A1': 'Apple', '7C:D1:C3': 'Apple', '80:00:6E': 'Apple', '80:49:71': 'Apple',
  '80:82:23': 'Apple', '80:92:9F': 'Apple', '80:BE:05': 'Apple', '80:E6:50': 'Apple',
  '84:29:99': 'Apple', '84:38:35': 'Apple', '84:78:AC': 'Apple', '84:85:06': 'Apple',
  '84:8E:0C': 'Apple', '84:B1:53': 'Apple', '84:FC:FE': 'Apple', '88:08:4C': 'Apple',
  '88:19:08': 'Apple', '88:1F:A1': 'Apple', '88:53:2E': 'Apple', '88:63:DF': 'Apple',
  '88:66:A5': 'Apple', '88:AE:07': 'Apple', '88:C6:63': 'Apple', '88:CB:87': 'Apple',
  '88:E9:FE': 'Apple', '8C:00:6D': 'Apple', '8C:29:37': 'Apple', '8C:2D:AA': 'Apple',
  '8C:58:77': 'Apple', '8C:7B:9D': 'Apple', '8C:7C:92': 'Apple', '8C:85:90': 'Apple',
  '8C:8D:28': 'Apple', '90:27:E4': 'Apple', '90:3C:92': 'Apple', '90:60:F1': 'Apple',
  '90:72:40': 'Apple', '90:84:0D': 'Apple', '90:8D:6C': 'Apple', '90:B0:ED': 'Apple',
  '90:B2:1F': 'Apple', '90:C1:C6': 'Apple', '94:BF:2D': 'Apple', '94:E9:6A': 'Apple',
  '94:F6:65': 'Apple', '98:00:C6': 'Apple', '98:01:A7': 'Apple', '98:03:D8': 'Apple',
  '98:46:0A': 'Apple', '98:9E:63': 'Apple', '98:B8:E3': 'Apple', '98:D6:BB': 'Apple',
  '98:E0:D9': 'Apple', '9C:04:EB': 'Apple', '9C:20:7B': 'Apple', '9C:35:EB': 'Apple',
  '9C:4F:DA': 'Apple', '9C:84:BF': 'Apple', '9C:F3:87': 'Apple', 'A0:11:FA': 'Apple',
  'A0:3B:E3': 'Apple', 'A0:4E:A7': 'Apple', 'A0:99:9B': 'Apple', 'A0:D7:95': 'Apple',
  'A4:5E:60': 'Apple', 'A4:67:06': 'Apple', 'A4:B1:97': 'Apple', 'A4:C3:61': 'Apple',
  'A4:D1:8C': 'Apple', 'A8:20:66': 'Apple', 'A8:51:AB': 'Apple', 'A8:60:B6': 'Apple',
  'A8:66:7F': 'Apple', 'A8:86:DD': 'Apple', 'A8:8E:24': 'Apple', 'A8:96:8A': 'Apple',
  'A8:BB:CF': 'Apple', 'A8:FA:D8': 'Apple', 'AC:1F:74': 'Apple', 'AC:29:3A': 'Apple',
  'AC:3C:0B': 'Apple', 'AC:61:EA': 'Apple', 'AC:7F:3E': 'Apple', 'AC:BC:32': 'Apple',
  'AC:CF:5C': 'Apple', 'AC:DE:48': 'Apple', 'AC:E4:B5': 'Apple', 'AC:FD:EC': 'Apple',
  'B0:34:95': 'Apple', 'B0:65:BD': 'Apple', 'B0:70:2D': 'Apple', 'B0:9F:BA': 'Apple',
  'B4:18:D1': 'Apple', 'B4:4B:D2': 'Apple', 'B4:F0:AB': 'Apple', 'B8:09:8A': 'Apple',
  'B8:17:C2': 'Apple', 'B8:44:D9': 'Apple', 'B8:53:AC': 'Apple', 'B8:63:4D': 'Apple',
  'B8:78:2E': 'Apple', 'B8:8D:12': 'Apple', 'B8:C1:11': 'Apple', 'B8:E8:56': 'Apple',
  'B8:F6:B1': 'Apple', 'BC:3B:AF': 'Apple', 'BC:4C:C4': 'Apple', 'BC:52:B7': 'Apple',
  'BC:67:78': 'Apple', 'BC:92:6B': 'Apple', 'BC:A9:20': 'Apple', 'BC:EC:5D': 'Apple',
  'C0:1A:DA': 'Apple', 'C0:84:7A': 'Apple', 'C0:9F:42': 'Apple', 'C0:CE:CD': 'Apple',
  'C4:2C:03': 'Apple', 'C4:61:8B': 'Apple', 'C4:B3:01': 'Apple', 'C8:1E:E7': 'Apple',
  'C8:2A:14': 'Apple', 'C8:3C:85': 'Apple', 'C8:6F:1D': 'Apple', 'C8:85:50': 'Apple',
  'C8:BC:C8': 'Apple', 'C8:D0:83': 'Apple', 'C8:E0:EB': 'Apple', 'CC:08:8D': 'Apple',
  'CC:20:E8': 'Apple', 'CC:25:EF': 'Apple', 'CC:44:63': 'Apple', 'D0:03:4B': 'Apple',
  'D0:23:DB': 'Apple', 'D0:25:98': 'Apple', 'D0:33:11': 'Apple', 'D0:4F:7E': 'Apple',
  'D0:A6:37': 'Apple', 'D4:61:9D': 'Apple', 'D4:9A:20': 'Apple', 'D4:DC:CD': 'Apple',
  'D4:F4:6F': 'Apple', 'D8:1D:72': 'Apple', 'D8:30:62': 'Apple', 'D8:96:95': 'Apple',
  'D8:A2:5E': 'Apple', 'D8:BB:2C': 'Apple', 'D8:CF:9C': 'Apple', 'DC:0C:5C': 'Apple',
  'DC:2B:2A': 'Apple', 'DC:37:14': 'Apple', 'DC:9B:9C': 'Apple', 'DC:A4:CA': 'Apple',
  'DC:F7:56': 'Apple', 'E0:5F:45': 'Apple', 'E0:66:78': 'Apple', 'E0:B5:2D': 'Apple',
  'E0:C7:67': 'Apple', 'E0:F5:C6': 'Apple', 'E4:25:E7': 'Apple', 'E4:8B:7F': 'Apple',
  'E4:9A:79': 'Apple', 'E4:C6:3D': 'Apple', 'E4:CE:8F': 'Apple', 'E4:E4:AB': 'Apple',
  'E8:04:0B': 'Apple', 'E8:06:88': 'Apple', 'E8:8D:28': 'Apple', 'EC:35:86': 'Apple',
  'EC:85:2F': 'Apple', 'EC:AD:B8': 'Apple', 'F0:18:98': 'Apple', 'F0:24:75': 'Apple',
  'F0:79:59': 'Apple', 'F0:98:9D': 'Apple', 'F0:B0:E7': 'Apple', 'F0:CB:A1': 'Apple',
  'F0:D1:A9': 'Apple', 'F0:DB:E2': 'Apple', 'F0:DC:E2': 'Apple', 'F0:F6:1C': 'Apple',
  'F4:0F:24': 'Apple', 'F4:1B:A1': 'Apple', 'F4:37:B7': 'Apple', 'F4:F1:5A': 'Apple',
  'F4:F9:51': 'Apple', 'F8:1E:DF': 'Apple', 'F8:27:93': 'Apple', 'F8:2D:7C': 'Apple',
  'F8:62:AA': 'Apple', 'F8:95:EA': 'Apple', 'F8:E9:03': 'Apple', 'FC:25:3F': 'Apple',
  'FC:E9:98': 'Apple',
  // Google / Android devices
  '00:1A:11': 'Google', '08:9E:08': 'Google', '1C:F2:9A': 'Google', '20:DF:B9': 'Google',
  '40:4E:36': 'Google', '48:D6:D5': 'Google', '54:60:09': 'Google', '6C:AD:F8': 'Google',
  '70:3A:CB': 'Google', '7C:2E:BD': 'Google', '94:EB:2C': 'Google', 'A4:77:33': 'Google',
  'AC:BC:32': 'Google', 'D4:F5:47': 'Google', 'F4:F5:D8': 'Google',
  // Samsung
  '00:00:F0': 'Samsung', '00:02:78': 'Samsung', '00:07:AB': 'Samsung', '00:09:18': 'Samsung',
  '00:12:47': 'Samsung', '00:13:77': 'Samsung', '00:15:99': 'Samsung', '00:15:B9': 'Samsung',
  '00:16:32': 'Samsung', '00:16:6B': 'Samsung', '00:16:6C': 'Samsung', '00:16:DB': 'Samsung',
  '00:17:C9': 'Samsung', '00:17:D5': 'Samsung', '00:18:AF': 'Samsung', '00:1A:8A': 'Samsung',
  '00:1B:98': 'Samsung', '00:1C:43': 'Samsung', '00:1D:25': 'Samsung', '00:1D:F6': 'Samsung',
  '00:1E:7D': 'Samsung', '00:1F:CC': 'Samsung', '00:1F:CD': 'Samsung', '00:21:D1': 'Samsung',
  '00:21:D2': 'Samsung', '00:23:39': 'Samsung', '00:23:99': 'Samsung', '00:24:54': 'Samsung',
  '00:24:90': 'Samsung', '00:24:91': 'Samsung', '00:24:E9': 'Samsung', '00:25:67': 'Samsung',
  '00:26:37': 'Samsung', '00:26:5F': 'Samsung', '08:08:C2': 'Samsung', '08:D4:2B': 'Samsung',
  '08:FC:88': 'Samsung', '0C:14:20': 'Samsung', '0C:71:5D': 'Samsung', '0C:89:10': 'Samsung',
  '10:1D:C0': 'Samsung', '10:30:47': 'Samsung', '14:32:D1': 'Samsung', '14:49:E0': 'Samsung',
  '14:89:FD': 'Samsung', '18:22:7E': 'Samsung', '18:3A:2D': 'Samsung', '18:3F:47': 'Samsung',
  '1C:5A:3E': 'Samsung', '1C:66:AA': 'Samsung', '20:13:E0': 'Samsung', '20:55:31': 'Samsung',
  '20:64:32': 'Samsung', '24:4B:03': 'Samsung', '24:C6:96': 'Samsung', '28:27:BF': 'Samsung',
  '28:BA:B5': 'Samsung', '2C:44:01': 'Samsung', '30:19:66': 'Samsung', '30:96:FB': 'Samsung',
  '34:14:5F': 'Samsung', '34:23:BA': 'Samsung', '34:AA:8B': 'Samsung', '38:0A:94': 'Samsung',
  '38:16:D1': 'Samsung', '3C:5A:37': 'Samsung', '3C:62:00': 'Samsung', '3C:8B:FE': 'Samsung',
  '40:0E:85': 'Samsung', '40:D3:AE': 'Samsung', '44:4E:1A': 'Samsung', '44:78:3E': 'Samsung',
  '48:13:7E': 'Samsung', '48:44:F7': 'Samsung', '4C:3C:16': 'Samsung', '4C:BC:98': 'Samsung',
  '50:01:BB': 'Samsung', '50:32:37': 'Samsung', '50:85:69': 'Samsung', '50:A4:C8': 'Samsung',
  '50:CC:F8': 'Samsung', '54:88:0E': 'Samsung', '54:9B:12': 'Samsung', '58:C3:8B': 'Samsung',
  '5C:A8:6A': 'Samsung', '5C:F6:DC': 'Samsung', '60:6B:BD': 'Samsung', '60:A1:0A': 'Samsung',
  '60:AF:6D': 'Samsung', '68:27:37': 'Samsung', '68:48:98': 'Samsung', '6C:2F:2C': 'Samsung',
  '6C:83:36': 'Samsung', '70:F9:27': 'Samsung', '74:45:8A': 'Samsung', '78:1F:DB': 'Samsung',
  '78:25:AD': 'Samsung', '78:40:E4': 'Samsung', '78:52:1A': 'Samsung', '7C:0B:C6': 'Samsung',
  '7C:61:66': 'Samsung', '80:65:6D': 'Samsung', '84:25:DB': 'Samsung', '84:38:38': 'Samsung',
  '88:32:9B': 'Samsung', '8C:71:F8': 'Samsung', '8C:77:12': 'Samsung', '90:18:7C': 'Samsung',
  '94:35:0A': 'Samsung', '94:63:D1': 'Samsung', '98:52:B1': 'Samsung', '9C:02:98': 'Samsung',
  '9C:3A:AF': 'Samsung', 'A0:07:98': 'Samsung', 'A0:0B:BA': 'Samsung', 'A4:EB:D3': 'Samsung',
  'A8:06:00': 'Samsung', 'A8:7C:01': 'Samsung', 'A8:9F:BA': 'Samsung', 'AC:5F:3E': 'Samsung',
  'B0:D0:9C': 'Samsung', 'B4:07:F9': 'Samsung', 'B4:3A:28': 'Samsung', 'B4:EF:FA': 'Samsung',
  'B8:5E:7B': 'Samsung', 'BC:44:86': 'Samsung', 'BC:79:AD': 'Samsung', 'BC:85:1F': 'Samsung',
  'C0:BD:D1': 'Samsung', 'C4:42:02': 'Samsung', 'C4:57:6E': 'Samsung', 'C4:73:1E': 'Samsung',
  'C8:19:F7': 'Samsung', 'C8:BA:94': 'Samsung', 'CC:07:AB': 'Samsung', 'D0:22:BE': 'Samsung',
  'D0:66:9B': 'Samsung', 'D4:87:D8': 'Samsung', 'D4:E8:B2': 'Samsung', 'D8:57:EF': 'Samsung',
  'DC:66:72': 'Samsung', 'E0:99:71': 'Samsung', 'E4:40:E2': 'Samsung', 'E8:50:8B': 'Samsung',
  'EC:1F:72': 'Samsung', 'EC:72:D7': 'Samsung', 'EC:9B:F3': 'Samsung', 'F0:25:B7': 'Samsung',
  'F4:42:8F': 'Samsung', 'F8:04:2E': 'Samsung', 'FC:00:12': 'Samsung',
  // Amazon (Echo, Fire TV, Kindle)
  '00:FC:8B': 'Amazon', '0C:47:C9': 'Amazon', '10:AE:60': 'Amazon', '34:D2:70': 'Amazon',
  '40:B4:CD': 'Amazon', '44:65:0D': 'Amazon', '50:DC:E7': 'Amazon', '68:37:E9': 'Amazon',
  '74:75:48': 'Amazon', '84:D6:D0': 'Amazon', '88:71:E5': 'Amazon', 'A0:02:DC': 'Amazon',
  'AC:63:BE': 'Amazon', 'B4:7C:9C': 'Amazon', 'F0:D2:F1': 'Amazon', 'FC:A6:67': 'Amazon',
  // Raspberry Pi
  'B8:27:EB': 'Raspberry Pi', 'DC:A6:32': 'Raspberry Pi', 'E4:5F:01': 'Raspberry Pi',
  '28:CD:C1': 'Raspberry Pi', 'D8:3A:DD': 'Raspberry Pi',
  // Microsoft
  '00:03:FF': 'Microsoft', '00:12:5A': 'Microsoft', '00:15:5D': 'Microsoft',
  '00:17:FA': 'Microsoft', '00:1D:D8': 'Microsoft', '00:22:48': 'Microsoft',
  '00:50:F2': 'Microsoft', '28:18:78': 'Microsoft', '2C:54:CF': 'Microsoft',
  '30:59:B7': 'Microsoft', '48:50:73': 'Microsoft', '50:1A:C5': 'Microsoft',
  '58:82:A8': 'Microsoft', '60:45:BD': 'Microsoft', '7C:1E:52': 'Microsoft',
  '98:5F:D3': 'Microsoft', 'A0:C9:A0': 'Microsoft', 'BC:83:85': 'Microsoft',
  'C4:9D:ED': 'Microsoft', 'DC:F7:56': 'Microsoft',
  // Cisco
  '00:00:0C': 'Cisco', '00:01:42': 'Cisco', '00:01:43': 'Cisco', '00:01:64': 'Cisco',
  '00:01:96': 'Cisco', '00:01:97': 'Cisco', '00:01:C7': 'Cisco', '00:02:16': 'Cisco',
  '00:02:17': 'Cisco', '00:03:6B': 'Cisco', '00:03:6C': 'Cisco', '00:04:9A': 'Cisco',
  '00:05:31': 'Cisco', '00:05:32': 'Cisco', '00:0A:8A': 'Cisco', '00:0B:45': 'Cisco',
  '00:0C:85': 'Cisco', '00:0D:28': 'Cisco', '00:0D:29': 'Cisco', '00:0E:08': 'Cisco',
  '00:0F:24': 'Cisco', '00:10:07': 'Cisco', '00:10:0D': 'Cisco', '00:10:11': 'Cisco',
  '00:10:14': 'Cisco', '00:10:29': 'Cisco', '00:10:7B': 'Cisco', '00:11:5C': 'Cisco',
  // TP-Link
  '00:1D:0F': 'TP-Link', '14:CC:20': 'TP-Link', '18:A6:F7': 'TP-Link', '1C:3B:F3': 'TP-Link',
  '28:D9:8A': 'TP-Link', '2C:D0:5A': 'TP-Link', '30:DE:4B': 'TP-Link', '3C:84:6A': 'TP-Link',
  '50:3E:AA': 'TP-Link', '54:AF:97': 'TP-Link', '60:32:B1': 'TP-Link', '64:70:02': 'TP-Link',
  '68:FF:7B': 'TP-Link', '6C:5A:B0': 'TP-Link', '70:4F:57': 'TP-Link', '74:DA:38': 'TP-Link',
  '78:8A:20': 'TP-Link', '90:F6:52': 'TP-Link', '98:DA:C4': 'TP-Link', 'A0:F3:C1': 'TP-Link',
  'AC:84:C6': 'TP-Link', 'B0:BE:76': 'TP-Link', 'B0:95:75': 'TP-Link', 'C4:6E:1F': 'TP-Link',
  'C8:D3:A3': 'TP-Link', 'D8:0D:17': 'TP-Link', 'E4:C3:2A': 'TP-Link', 'EC:08:6B': 'TP-Link',
  'F4:EC:38': 'TP-Link',
};

// Device type hints: manufacturer + hostname keywords -> phone/laptop/router/tv/speaker/tablet/server/pi
const DEVICE_TYPE_MAP = {
  // Apple product lines by OUI range (rough heuristic — refined by hostname)
  phone: ['iphone', 'android', 'pixel', 'galaxy', 'sm-', 'oneplus', 'redmi', 'poco', 'moto'],
  tablet: ['ipad', 'tablet', 'kindle', 'fire hd', 'surface'],
  laptop: ['macbook', 'laptop', 'thinkpad', 'xps', 'ideapad', 'inspiron', 'zenbook', 'vivobook', 'pavilion'],
  desktop: ['imac', 'mac mini', 'mac pro', 'desktop', 'tower', 'pc', 'workstation'],
  tv: ['appletv', 'apple-tv', 'fire-tv', 'firetv', 'chromecast', 'roku', 'shield', 'smarttv', 'smart-tv', 'bravia', 'vizio', 'tizen'],
  speaker: ['homepod', 'echo', 'alexa', 'nest-audio', 'nest-mini', 'nest-hub', 'sonos', 'bose', 'airplay'],
  router: ['router', 'gateway', 'linksys', 'netgear', 'orbi', 'eero', 'asus', 'dlink', 'd-link', 'ubiquiti', 'unifi', 'airport', 'extreme', 'time-capsule', 'tplink', 'tp-link'],
  printer: ['printer', 'officejet', 'laserjet', 'pixma', 'epson', 'brother', 'hp-', 'canon'],
  nas: ['nas', 'synology', 'qnap', 'diskstation', 'readynas', 'drobo'],
  pi: ['raspberry', 'raspberrypi', 'raspberrypi.local'],
  camera: ['camera', 'cam', 'ipcam', 'doorbell', 'ring', 'arlo', 'wyze', 'blink', 'nest-cam'],
  game: ['playstation', 'ps4', 'ps5', 'xbox', 'nintendo', 'switch'],
};

function classifyDeviceType(hostname, manufacturer) {
  const h = (hostname || '').toLowerCase().replace(/\s+/g, '-');
  const m = (manufacturer || '').toLowerCase();

  for (const [type, keywords] of Object.entries(DEVICE_TYPE_MAP)) {
    for (const kw of keywords) {
      if (h.includes(kw) || m.includes(kw)) return type;
    }
  }

  // Fallback by manufacturer category
  if (m === 'cisco' || m === 'tp-link') return 'router';
  if (m === 'raspberry pi') return 'pi';
  if (m === 'amazon') return 'speaker';
  if (m === 'microsoft') return 'laptop';
  if (m === 'apple') return 'laptop'; // generic Apple defaults to laptop; hostname will override
  if (m === 'samsung' || m === 'google') return 'phone';

  return 'unknown';
}

function lookupManufacturer(mac) {
  if (!mac || mac === 'unknown') return 'Unknown';
  const upper = mac.toUpperCase();
  const prefix3 = upper.substring(0, 8);
  return OUI_MAP[prefix3] || 'Unknown';
}

function getLocalNetworkInfo() {
  const interfaces = os.networkInterfaces();
  for (const [name, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) {
        const parts = addr.address.split('.');
        const subnet = parts.slice(0, 3).join('.');
        return { ip: addr.address, subnet, interface: name, netmask: addr.netmask };
      }
    }
  }
  return null;
}

function getWifiSSID() {
  return new Promise((resolve) => {
    const platform = process.platform;
    if (platform === 'darwin') {
      const interfaces = os.networkInterfaces();
      const wifiIface = Object.keys(interfaces).find((n) =>
        n.startsWith('en') && interfaces[n].some((a) => a.family === 'IPv4' && !a.internal)
      ) || 'en0';

      exec(`ipconfig getsummary ${wifiIface} 2>/dev/null`, (err, stdout) => {
        if (!err) {
          const m = stdout.match(/SSID\s*:\s*(.+)/);
          if (m && m[1].trim()) { resolve(m[1].trim()); return; }
        }
        exec('networksetup -listallhardwareports 2>/dev/null', (e2, out2) => {
          const wifiMatch = out2 && out2.match(/Hardware Port: Wi-Fi\nDevice: (\w+)/);
          const dev = wifiMatch ? wifiMatch[1] : 'en0';
          exec(`ipconfig getsummary ${dev} 2>/dev/null`, (e3, out3) => {
            if (!e3) {
              const m2 = out3.match(/SSID\s*:\s*(.+)/);
              if (m2 && m2[1].trim()) { resolve(m2[1].trim()); return; }
            }
            exec('system_profiler SPAirPortDataType 2>/dev/null', (e4, out4) => {
              if (!e4) {
                const lines = out4.split('\n');
                for (let i = 0; i < lines.length; i++) {
                  if (lines[i].includes('Current Network Information')) {
                    const ssidLine = lines[i + 1];
                    if (ssidLine) {
                      const name = ssidLine.replace(/:$/, '').trim();
                      if (name) { resolve(name); return; }
                    }
                  }
                }
              }
              resolve('Unknown');
            });
          });
        });
      });
    } else if (platform === 'win32') {
      exec('netsh wlan show interfaces', (err, stdout) => {
        if (err) { resolve('Unknown'); return; }
        const match = stdout.match(/\s+SSID\s+:\s+(.+)/);
        resolve(match ? match[1].trim() : 'Unknown');
      });
    } else {
      exec('iwgetid -r', (err, stdout) => {
        if (!err && stdout.trim()) { resolve(stdout.trim()); return; }
        exec('nmcli -t -f active,ssid dev wifi', (e2, out2) => {
          if (!e2) {
            const line = (out2 || '').split('\n').find((l) => l.startsWith('yes:'));
            if (line) { resolve(line.slice(4).trim()); return; }
          }
          resolve('Unknown');
        });
      });
    }
  });
}

function reverseDns(ip) {
  return new Promise((resolve) => {
    dns.reverse(ip, (err, hostnames) => {
      if (!err && hostnames && hostnames.length > 0) {
        resolve(hostnames[0]);
      } else {
        resolve(null);
      }
    });
  });
}

function getMacFromArp(ip) {
  return new Promise((resolve) => {
    const platform = process.platform;
    if (platform === 'win32') {
      exec(`arp -a ${ip}`, (err, stdout) => {
        if (err) { resolve(null); return; }
        const match = stdout.match(/([0-9a-f]{2}[:-]){5}[0-9a-f]{2}/i);
        resolve(match ? match[0].replace(/-/g, ':').toUpperCase() : null);
      });
    } else {
      exec(`arp -n ${ip} 2>/dev/null || arp ${ip} 2>/dev/null`, (err, stdout) => {
        if (err) { resolve(null); return; }
        const match = stdout.match(/([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}/);
        resolve(match ? match[0].toUpperCase() : null);
      });
    }
  });
}

function checkPort(ip, port, timeout = 600) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => { socket.destroy(); resolve(false); });
    socket.connect(port, ip);
  });
}

async function scanHost(ip, ports) {
  try {
    const res = await ping.promise.probe(ip, { timeout: 1, min_reply: 1 });
    if (!res.alive) return null;

    const [hostname, mac, ...portResults] = await Promise.all([
      reverseDns(ip),
      getMacFromArp(ip),
      ...ports.map((p) => checkPort(ip, p)),
    ]);

    const manufacturer = lookupManufacturer(mac);
    const openPorts = ports.filter((_, idx) => portResults[idx]);
    const deviceType = classifyDeviceType(hostname, manufacturer);

    return {
      ip,
      hostname: hostname || ip,
      mac: mac || 'unknown',
      manufacturer,
      deviceType,
      openPorts,
      alive: true,
    };
  } catch {
    return null;
  }
}

async function scanNetwork(subnet, ports, event) {
  const hosts = [];
  const BATCH_SIZE = 50;
  const total = 254;
  let scanned = 0;

  for (let batch = 0; batch < total; batch += BATCH_SIZE) {
    if (!activeScan) break;
    const promises = [];
    for (let i = batch + 1; i <= Math.min(batch + BATCH_SIZE, total); i++) {
      const ip = `${subnet}.${i}`;
      promises.push(scanHost(ip, ports));
    }

    const results = await Promise.all(promises);
    scanned += promises.length;

    for (const result of results) {
      if (result) {
        hosts.push(result);
        event.sender.send('scan:device-found', result);
      }
    }

    event.sender.send('scan:progress', {
      scanned,
      total,
      percent: Math.round((scanned / total) * 100),
    });
  }

  return hosts;
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0f1117',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('network:get-info', async () => {
  const info = getLocalNetworkInfo();
  const ssid = await getWifiSSID();
  return { ...info, ssid };
});

let activeScan = false;

ipcMain.on('scan:start', async (event, { subnet, ports }) => {
  if (activeScan) return;
  activeScan = true;
  event.sender.send('scan:started');
  try {
    await scanNetwork(subnet, ports, event);
  } finally {
    activeScan = false;
    event.sender.send('scan:complete');
  }
});

ipcMain.on('scan:stop', () => {
  activeScan = false;
});

ipcMain.handle('host:check-port', async (_, { ip, port }) => {
  return checkPort(ip, port, 2000);
});
