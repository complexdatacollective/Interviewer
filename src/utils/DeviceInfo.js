import { Device } from '@capacitor/device';

import { isCapacitor, isElectron, isIOS } from './Environment';

const esc = (string) => (string || '').replace(/\W/g, ' ');

const electronDescription = () => {
  const platform = window.electronAPI?.env?.platform || 'unknown';

  const osTypeMap = {
    darwin: 'macOS',
    win32: 'Windows',
    linux: 'Linux',
  };

  const osName = osTypeMap[platform] || platform;
  return `Desktop (${osName})`;
};

const deviceDescription = async () => {
  if (isCapacitor()) {
    const info = await Device.getInfo();
    const label = info.isVirtual
      ? isIOS()
        ? 'iOS Simulator'
        : 'Android emulator'
      : `${esc(info.manufacturer)} ${esc(info.model)}`.trim();
    return `${label} - ${info.osVersion || '?'}`;
  }
  if (isElectron()) {
    return electronDescription();
  }
  return 'Unknown device';
};

const shouldUseDynamicScaling = () => !isCapacitor();

const shouldUseFullScreenForm = () => isCapacitor();

export { deviceDescription, shouldUseDynamicScaling, shouldUseFullScreenForm };
