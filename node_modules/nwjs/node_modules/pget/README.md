# pget [![NPM version](https://img.shields.io/npm/v/pget.svg)](https://npmjs.com/package/pget) [![NPM downloads](https://img.shields.io/npm/dm/pget.svg)](https://npmjs.com/package/pget) [![Build Status](https://img.shields.io/circleci/project/egoist/pget/master.svg)](https://circleci.com/gh/egoist/pget)

> nugget but with a Promise interface.

## Install

```
$ npm install --save pget
```

## Usage

```js
const pget = require('pget')

co(function* () {
  yield pget('http://example.com/154802xtui44qt5imdzm43.png', {verbose: true})
})
/* ⬇️ yield ⬇️
Downloading 154802xtui44qt5imdzm43.png
[============================================>] 100.0% of 430.9 kB (246.23 kB/s)
*/
```

## API

### pget(url, [options])

#### options

[nugget](https://github.com/maxogden/nugget/blob/master/bin.js#L12-L22) options.

## Related

<!-- Related projects start -->
- [nugget](https://github.com/maxogden/nugget): minimalist wget clone written in node.

<!-- Related projects end -->

## License

MIT © [EGOIST](https://github.com/egoist)
