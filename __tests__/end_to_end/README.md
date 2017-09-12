# End to end tests

## Setup

Install deps:

```sh
$ brew install carthage  # Cocoa dependency managment
$ npm install
```

Ensure you have the following environment variables:

```sh
# Emulator testing
export END_TO_END_REMOTE=APPIUM
export END_TO_END_PLATFORM=IOS

# Browser testing
export END_TO_END_REMOTE=BROWSER
export END_TO_END_PLATFORM=SAFARI
```

## Run the tests

Run the web driver server:

```
$ npm run appium-server  # Emulator testing
or
$ npm run selenium-server  # Browser testing
```

Build the project:

```sh
# Emulator testing (Each time you want to refresh changes)
$ npm run build
$ cordova build ios

# Browser testing (Run dev server)
$ npm run start
```

Run the tests!:
```sh
$ npm run test:end-to-end
```
