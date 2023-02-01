# Turborepo + Electron + React

This is an example [Electron](electronjs.org/) +
[React](https://reactjs.org/) application that uses
[Turborepo](https://turborepo.org/) to build and run its tasks.


# Quickstart

You just need to run two commands:
```
# to install dependencies, just required the first time
yarn

# to run the app
yarn start
```

This will start the Electron application, wait until the dev server
for the React UI is ready and then load it.

# Package the app

Currently the app packaging is in progress and has room for improvement.
It works for some platforms and with not much work can be functional for other platforms too.

```
# to install dependencies, just required the first time
yarn

# to package the app
yarn package
```


# Notes

* `apps/ui/` is pretty much the same as the default React app created
  by [create-react-app](https://create-react-app.dev/)
* `apps/desktop/` minimal Electron app, with support for TypeScript and
  dependency bundling using [Webpack](https://webpack.js.org/). This app was
  started from [Electron quickstart
  repo](https://github.com/electron/electron-quick-start-typescript.git) (the
  TypeScript flavor).
* `apps/packager/` configurations and scripts to package the app using
  [Electron Builder](https://www.electron.build/)
* `packages/wait-for-server-up/` is a small node package that could
  very much live on apps/desktop/ but I decided to put it outside to
  showcase how you can use packages
