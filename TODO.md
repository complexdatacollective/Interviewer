Core dependencies to update:

- Webpack (Can we use new CRA?) -> webpack 5
- replace bespoke dialogs and toasts with something from an existing UI lib
- React
- React Router
- Framer-Motion
- Sass
- Cordova -> capacitor?

Design changes
- Protocol actions must be moved to a backend, which will store protocol data
- Frontend will then hydrate store/session by requesting protocol data from the backend
- Protocol assets will be requested from the backend at runtime.
- Could this also apply to roster data so that it can be pre-processed?

- App bundle size
- Font sizing

- Settings menu needs to become participant facing when in the interview

- App state needs to be divided into two parts:
  - Local state, which will comprise everything needed for the current session
  - Global state, which will comprise "device" settings, user data, and persistent app data
