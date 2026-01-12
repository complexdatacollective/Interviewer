/**
 * Device information with secure API support.
 */
/* globals device */
import { isCordova, isElectron } from './Environment';

const versioned = (name) => `${name} - ${device.version || '?'}`;

const esc = (string) => (string || '').replace(/\W/g, ' ');

const electronDescription = () => {
  // Get platform from secure API
  const platform = window.electronAPI?.env?.platform || 'unknown';

  const osTypeMap = {
    darwin: 'macOS',
    win32: 'Windows',
    linux: 'Linux',
  };

  const osName = osTypeMap[platform] || platform;
  // We can't get hostname without Node access, use a generic description
  return `Desktop (${osName})`;
};

const androidDescription = () => {
  if (device.isVirtual) {
    return versioned('Android emulator');
  }
  return versioned(`${esc(device.manufacturer)} ${esc(device.model)}`);
};

const iosDescription = () => {
  const { model } = device;
  switch (true) {
    case (device.isVirtual): return versioned('iOS Simulator');
    case (/iPad2,(1|2|3|4)/.test(model)): return versioned('iPad 2');
    case (/iPad2,(5|6|7)/.test(model)): return versioned('iPad mini');
    case (/iPad3,(1|2|3)/.test(model)): return versioned('iPad (3rd gen)');
    case (/iPad3,/.test(model)): return versioned('iPad (4th gen)');
    case (/iPad4,(4|5|6)/.test(model)): return versioned('iPad mini 2');
    case (/iPad4,(7|8|9)/.test(model)): return versioned('iPad mini 3');
    case (/iPad4,/.test(model)): return versioned('iPad Air');
    case (/iPad5,(1|2)/.test(model)): return versioned('iPad mini 4');
    case (/iPad5,/.test(model)): return versioned('iPad Air 2');
    case (/iPad6,(3|4)/.test(model)): return versioned('iPad Pro (9.7")');
    case (/iPad6,(7|8)/.test(model)): return versioned('iPad Pro (12.9")');
    case (/iPad6,(11|12)/.test(model)): return versioned('iPad (5th gen)');
    case (/iPad7,(1|2)/.test(model)): return versioned('iPad Pro (12.9", 2nd gen)');
    case (/iPad7,(3|4)/.test(model)): return versioned('iPad Pro (10.5")');
    case (/iPad7,(7|5)/.test(model)): return versioned('iPad Pro (6th gen)');
    case (/iPad8,(1|2|3|4)/.test(model)): return versioned('iPad Pro (11")');
    case (/iPad8,(5|6|7|8)/.test(model)): return versioned('iPad Pro (12.9", 3rd gen)');
    case (/iPad11,(3|4)/.test(model)): return versioned('iPad Air (3rd gen)');
    case (/iPad/.test(model)): return versioned('iPad');
    case (/iPhone/.test(model)): return versioned('iPhone');
    default: return versioned('iOS device');
  }
};

const deviceDescription = () => {
  if (isCordova() && device.platform === 'iOS') {
    return iosDescription();
  }
  if (isCordova() && device.platform === 'Android') {
    return androidDescription();
  }
  if (isElectron()) {
    return electronDescription();
  }
  return 'Unknown device';
};

const shouldUseDynamicScaling = () => !isCordova();

const shouldUseFullScreenForm = () => isCordova();

export default deviceDescription;

export {
  deviceDescription,
  shouldUseDynamicScaling,
  shouldUseFullScreenForm,
};
