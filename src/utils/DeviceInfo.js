/* globals device */
import { isCordova, isElectron } from './Environment';

const versioned = name => `${name} - ${device.version || '?'}`;

const esc = string => (string || '').replace(/\W/g, ' ');

const electronDescription = () => {
  // https://nodejs.org/api/os.html#os_os_type
  const osTypeMap = {
    Darwin: 'macOS',
    Windows_NT: 'Windows',
  };

  const os = window.require('os');
  const osType = os.type();
  const osName = osTypeMap[osType] || esc(osType) || '?';
  // Strip '.local', etc. from hostname
  const host = esc((os.hostname() || '').replace(/\.\w+$/, ''));
  return `${host} (${osName})`;
};

// As of now (both ee3cb6d and v2.0.2), the cordova-plugin-device docs are wrong; device.model
// [uses](https://github.com/apache/cordova-plugin-device/blob/rel/2.0.2/src/android/Device.java#L75)
// [Build.MODEL](https://developer.android.com/reference/android/os/Build#MODEL), which is a
// user-friendly name.
const androidDescription = () => {
  if (device.isVirtual) {
    return versioned('Android emulator');
  }
  return versioned(`${esc(device.manufacturer)} ${esc(device.model)}`);
};

const iosDescription = () => {
  // Only iPads are officially supported
  // http://theiphonewiki.com/wiki/index.php?title=Models
  const model = device.model;
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

export default deviceDescription;
