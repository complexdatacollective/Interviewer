# End to end tests

Uses spectron to run app in development mode.

Because of older version of Electron, version 4.0.0 is used, which correlates to
version 4 of webdriver, docs which can be found here:

http://v4.webdriver.io/api.html (Select 'Latest')

## Run tests:

```
$ npm run start:test # to start serving react in electron/test mode
$ npm run test:e2e # to run tests
```

### Functional tests

This can test interactions with various elements of the app.

They are found in `test/functional`

### Regression tests

Screenshots of the app in various states can be captured to help spot regressions.

These are found in `test/regression/`

```
await app.client.pause(timing.medium); // You may need to pause to allow fonts/assets to load
await expect(app.browserWindow.capturePage()).resolves.toMatchImageSnapshot(); // Snapshot test
```

These tests create `**/__image_snapshots__/` files which should be added to version control.

If snapshots don't match, diff files are created here `**/__image_snapshots__/__diff_output__`, these
should not be added to version control, but can be used to debug the issue.

#### Updating snapshots

Update snapshots with the `-u` flag:

`npm run test:e2e -- -u`
