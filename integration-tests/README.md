# End to end tests

Uses spectron to run app in development mode.

To match version 5.x of Electron, version 7.0.0 is used, which correlates to
version 4.13 of webdriver, docs which can be found here:

http://v4.webdriver.io/api.html (Select 'Latest')

## Run tests:

```
$ npm run start:integration # to start serving react in electron/test mode
$ npm run test:integration # to run tests
```

Screenshots of the app in various states can be captured to help spot regressions:

```
await app.client.pause(timing.medium); // You may need to pause to allow fonts/assets to load
await matchImageSnapshot(app) // Use helper to run image snapshot test
```

#### Creating/updating snapshots

__requires: `docker` and `docker-compose`__

New/changed snapshots need to be created and verified locally, before they
can be run on the CI service.

Snapshots are created in `**/__image_snapshots__/` and should be added to version control.

If snapshots don't match, diff files are created here `**/__image_snapshots__/__diff_output__`, these should not be added to version control, but can be used to debug the issue.

You can run an update in docker using the following command:

`npm run test:integration:update-snapshots`

## CI

Can be run locally, but intended to be run on travis or other CI service.

```
$ npm run build:ci # to build app (electron)
$ npm run test:integration:ci # to run tests
```

### Run CI-like environment locally (docker)

__requires: `docker` and `docker-compose`__

```
$ npm run test:integration:docker
```

#### Wrangling docker

Rebuild image (fresh npm install)

```
docker-compose build --pull
```

#### Debugging docker

This will spin up a machine for running tests from the local build (/www).

```
$ docker-compose run debug
// in the container shell you can now run:
# xvfb-run -a npm run test:integration:ci
```
