/** Document ready */
exports.domReady = (
  condition,
) => {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

exports.normalizeEol = (str) => str.replace(/\r\n|\r|\n/g, '\r\n');

exports.isMacOS = () => process.platform === 'darwin';
