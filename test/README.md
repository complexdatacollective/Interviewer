# End to end tests

Uses spectron to run app in development mode.

Because of older version of Electron, version 4.0.0 is used, which correlates to
version 4 of webdriver, docs which can be found here:

http://v4.webdriver.io/api.html (Select 'Latest')

## Run tests:

```
$ npm run start:integration # to start serving react in electron/test mode
$ npm run test:integration # to run tests
```

### Functional tests

This can test interactions with various elements of the app.

They are found in `test/functional`

```
$ npm run test:integration -- functional # to run functional tests
```

### Regression tests

Screenshots of the app in various states can be captured to help spot regressions.

These are found in `test/regression/`

```
$ npm run test:integration -- functional # to run regression tests
```

```
await app.client.pause(timing.medium); // You may need to pause to allow fonts/assets to load
await expect(app.browserWindow.capturePage()).resolves.toMatchImageSnapshot(); // Snapshot test
```

These tests create `**/__image_snapshots__/` files which should be added to version control.

If snapshots don't match, diff files are created here `**/__image_snapshots__/__diff_output__`, these
should not be added to version control, but can be used to debug the issue.

#### Updating snapshots

Update snapshots with the `-u` flag:

`npm run test:integration -- --update-snapshots`


### CI

```
$ npm run build:ci # to build app (electron)
$ npm run test:integration:ci # to run tests
```

#### Run CI locally (docker)

In order to generate new/updated snapshots for CI, these tests will need to be run locally.
This can be done using docker with the following commands.
__requires: `docker` and `docker-compose`__

This command only runs regression tests for speed. See `/docker-compose.yml` if you need
to run all tests.

```
$ npm run test:integration:docker
```

##### Wrangling docker

Rebuild image (fresh npm install)

```
docker-compose build --pull
docker-compose up --force-recreate
```
