# End to end tests

## Setup

Install deps:

```sh
$ brew install carthage  # Cocoa dependency managment
$ npm install
```

Run the Appium server:

```
$ npm run appium
```

Build the project:

```sh
$ npm run build
$ cordova build ios
```

Run the tests!:
```sh
$ npm run test
```