// SVG icons keyed by deviceType — all inline, monochrome stroke icons
const DEVICE_ICONS = {
  phone: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  tablet: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  laptop: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M0 21h24"/></svg>`,
  desktop: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
  tv: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 20h8M12 18v2"/></svg>`,
  speaker: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><circle cx="12" cy="15" r="2.5"/><line x1="12" y1="6" x2="12" y2="7"/></svg>`,
  router: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="10" width="20" height="8" rx="2"/><path d="M6 10V7M12 10V5M18 10V7"/><circle cx="6" cy="14" r="1" fill="currentColor"/></svg>`,
  printer: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><rect x="2" y="9" width="20" height="10" rx="1"/><polyline points="6 18 6 22 18 22 18 18"/><line x1="6" y1="13" x2="8" y2="13"/></svg>`,
  nas: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="5" rx="1"/><rect x="2" y="10" width="20" height="5" rx="1"/><rect x="2" y="17" width="20" height="5" rx="1"/><circle cx="18" cy="5.5" r="1" fill="currentColor"/><circle cx="18" cy="12.5" r="1" fill="currentColor"/></svg>`,
  pi: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="8" y="8" width="8" height="8" rx="1"/><line x1="8" y1="2" x2="8" y2="4"/><line x1="16" y1="2" x2="16" y2="4"/><line x1="8" y1="20" x2="8" y2="22"/><line x1="16" y1="20" x2="16" y2="22"/></svg>`,
  camera: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
  game: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="16" cy="11" r="1" fill="currentColor"/><circle cx="18" cy="13" r="1" fill="currentColor"/><path d="M20.84 5.5H3.16A2 2 0 0 0 1.19 7.7l1.55 9.3A3 3 0 0 0 5.7 19.5h12.6a3 3 0 0 0 2.96-2.5l1.55-9.3a2 2 0 0 0-1.97-2.2z"/></svg>`,
  unknown: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M0 21h24"/></svg>`,
};

function getDeviceIcon(deviceType) {
  return DEVICE_ICONS[deviceType] || DEVICE_ICONS.unknown;
}

let devices = [];
let sortMode = 'ip';
let scanning = false;
let manualMode = false;
let detectedSubnet = '';
let selectedPorts = new Set(['22', '80', '443', '8080']);

// ── DOM refs ──────────────────────────────────────────────────────────────
const ssidDisplay      = document.getElementById('ssid-display');
const localIpEl        = document.getElementById('local-ip');
const subnetDisplayEl  = document.getElementById('subnet-display');
const interfaceEl      = document.getElementById('interface-display');
const netmaskEl        = document.getElementById('netmask-display');
const subnetInput      = document.getElementById('subnet-input');
const manualToggle     = document.getElementById('manual-toggle');
const btnScan          = document.getElementById('btn-scan');
const btnScanLabel     = document.getElementById('btn-scan-label');
const statTotal        = document.getElementById('stat-total');
const statOpen         = document.getElementById('stat-open');
const statProgress     = document.getElementById('stat-progress');
const progressBar      = document.getElementById('progress-bar');
const scanStatusText   = document.getElementById('scan-status-text');
const scanIndicator    = document.getElementById('scan-indicator');
const emptyState       = document.getElementById('empty-state');
const deviceTable      = document.getElementById('device-table');
const deviceTbody      = document.getElementById('device-tbody');
const searchInput      = document.getElementById('search-input');
const sortIpBtn        = document.getElementById('sort-ip');
const sortNameBtn      = document.getElementById('sort-name');
const portChipsEl      = document.getElementById('port-chips');
const customPortInput  = document.getElementById('custom-port');

// ── Network info ──────────────────────────────────────────────────────────
async function loadNetworkInfo() {
  try {
    const info = await window.netscanner.getNetworkInfo();
    ssidDisplay.textContent     = info.ssid || 'Unknown';
    localIpEl.textContent       = info.ip || '—';
    subnetDisplayEl.textContent = info.subnet ? `${info.subnet}.0/24` : '—';
    interfaceEl.textContent     = info.interface || '—';
    netmaskEl.textContent       = info.netmask || '—';

    if (info.subnet) {
      detectedSubnet = info.subnet;
      if (!manualMode) subnetInput.value = detectedSubnet;
    }
  } catch {
    ssidDisplay.textContent = 'Error';
  }
}

// ── Port chip toggles ─────────────────────────────────────────────────────
portChipsEl.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  const port = chip.dataset.port;
  if (selectedPorts.has(port)) {
    selectedPorts.delete(port);
    chip.classList.remove('selected');
  } else {
    selectedPorts.add(port);
    chip.classList.add('selected');
  }
});

customPortInput.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const val = customPortInput.value.trim();
  const num = parseInt(val, 10);
  if (!val || isNaN(num) || num < 1 || num > 65535) return;
  const portStr = String(num);
  if (selectedPorts.has(portStr)) return;
  selectedPorts.add(portStr);
  const chip = document.createElement('div');
  chip.className = 'chip selected';
  chip.dataset.port = portStr;
  chip.textContent = portStr;
  portChipsEl.appendChild(chip);
  customPortInput.value = '';
});

// ── Manual toggle ─────────────────────────────────────────────────────────
manualToggle.addEventListener('click', () => {
  manualMode = !manualMode;
  manualToggle.classList.toggle('on', manualMode);
  subnetInput.readOnly = !manualMode;
  subnetInput.style.opacity = manualMode ? '1' : '0.5';
  if (!manualMode && detectedSubnet) subnetInput.value = detectedSubnet;
});

subnetInput.readOnly = true;
subnetInput.style.opacity = '0.5';

// ── Scan controls ─────────────────────────────────────────────────────────
btnScan.addEventListener('click', () => {
  if (scanning) stopScan(); else startScan();
});

function startScan() {
  const subnet = subnetInput.value.trim();
  if (!subnet) { subnetInput.focus(); return; }

  const ports = Array.from(selectedPorts).map(Number).filter(Boolean);

  devices = [];
  renderTable();
  setScanning(true);

  window.netscanner.onScanStarted(() => {});
  window.netscanner.onDeviceFound((device) => {
    devices.push(device);
    renderTable();
    updateStats();
  });
  window.netscanner.onProgress((data) => {
    progressBar.style.width = `${data.percent}%`;
    statProgress.textContent = `${data.percent}%`;
    scanStatusText.textContent = `Scanning ${data.scanned}/${data.total}`;
  });
  window.netscanner.onScanComplete(() => {
    setScanning(false);
    scanStatusText.textContent = `Done — ${devices.length} device${devices.length !== 1 ? 's' : ''} found`;
    progressBar.style.width = '100%';
    setTimeout(() => { progressBar.style.width = '0%'; }, 1500);
  });

  window.netscanner.startScan(subnet, ports);
}

function stopScan() {
  window.netscanner.stopScan();
  setScanning(false);
  scanStatusText.textContent = 'Stopped';
}

function setScanning(state) {
  scanning = state;
  btnScan.classList.toggle('scanning', state);
  btnScanLabel.textContent = state ? 'Stop Scan' : 'Start Scan';
  if (state) {
    scanIndicator.innerHTML = '<span class="pulse"></span>';
    scanStatusText.textContent = 'Scanning…';
  } else {
    scanIndicator.innerHTML = '';
  }
}

// ── Sorting ───────────────────────────────────────────────────────────────
sortIpBtn.addEventListener('click', () => {
  sortMode = 'ip';
  sortIpBtn.classList.add('active');
  sortNameBtn.classList.remove('active');
  renderTable();
});
sortNameBtn.addEventListener('click', () => {
  sortMode = 'name';
  sortNameBtn.classList.add('active');
  sortIpBtn.classList.remove('active');
  renderTable();
});

// ── Search ────────────────────────────────────────────────────────────────
searchInput.addEventListener('input', () => renderTable());

// ── Render ────────────────────────────────────────────────────────────────
function sortedDevices() {
  const query = searchInput.value.toLowerCase();
  let list = devices.filter((d) =>
    d.ip.includes(query) ||
    d.hostname.toLowerCase().includes(query) ||
    d.mac.toLowerCase().includes(query) ||
    d.manufacturer.toLowerCase().includes(query)
  );

  if (sortMode === 'ip') {
    list.sort((a, b) => {
      const pa = a.ip.split('.').map(Number);
      const pb = b.ip.split('.').map(Number);
      for (let i = 0; i < 4; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
      return 0;
    });
  } else {
    list.sort((a, b) => a.hostname.localeCompare(b.hostname));
  }
  return list;
}

function renderTable() {
  const list = sortedDevices();
  if (list.length === 0) {
    emptyState.style.display = 'flex';
    deviceTable.style.display = 'none';
    return;
  }
  emptyState.style.display = 'none';
  deviceTable.style.display = 'table';
  deviceTbody.innerHTML = '';
  for (const device of list) deviceTbody.appendChild(buildRow(device));
}

function buildRow(device) {
  const tr = document.createElement('tr');
  const icon = getDeviceIcon(device.deviceType || 'unknown');
  const typeLbl = (device.deviceType || 'unknown').charAt(0).toUpperCase() + (device.deviceType || 'unknown').slice(1);

  const openPortsHtml = device.openPorts && device.openPorts.length > 0
    ? device.openPorts.map((p) => `<span class="port-tag">${p}</span>`).join('')
    : '<span class="port-none">—</span>';

  tr.innerHTML = `
    <td>
      <div class="device-cell">
        <div class="device-icon">${icon}</div>
        <div>
          <div class="device-name" title="${device.hostname}">${device.hostname}</div>
          <div class="device-sub">${typeLbl} · ${device.manufacturer}</div>
        </div>
      </div>
    </td>
    <td class="ip-cell">${device.ip}</td>
    <td class="mac-cell">${device.mac}</td>
    <td><span class="mfg-badge">${device.manufacturer}</span></td>
    <td><div class="ports-cell">${openPortsHtml}</div></td>
  `;
  return tr;
}

function updateStats() {
  statTotal.textContent = devices.length;
  const openCount = devices.reduce((acc, d) => acc + (d.openPorts ? d.openPorts.length : 0), 0);
  statOpen.textContent = openCount;
}

// ── Init ──────────────────────────────────────────────────────────────────
loadNetworkInfo();
