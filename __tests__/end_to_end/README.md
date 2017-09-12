# End to end tests 

## App

Currently OSX only, but could be setup to test Android.

### Setup

Install deps:

```sh
$ brew install carthage  # Cocoa dependency management (OSX only)
$ npm install
```

Ensure you have the following environment variables:

```sh
# Emulator testing
export END_TO_END_REMOTE=APPIUM
export END_TO_END_PLATFORM=IOS
```

### Run the tests

Run the web-driver server (automation layer for app):

```
$ npm run appium-server
```

Build the project (each time you want to test in-app changes):

```sh
$ npm run build
$ cordova build ios
```

Run the tests:
```sh
$ npm run test:end-to-end
```

# Browser

### Setup

Install deps:

```sh
$ npm install
$ npm run selenium-install.  # Install the requisite web drivers
```

Ensure you have the following environment variables:

```sh
export END_TO_END_REMOTE=BROWSER
export END_TO_END_PLATFORM=SAFARI
# or
export END_TO_END_PLATFORM=CHROME
```

## Run the tests

Run the web-driver server (automation layer for browsers):

```
$ npm run selenium-server
```

Run the dev server:

```sh
$ npm run start
```

Run the tests!:
```sh
$ npm run test:end-to-end
```

