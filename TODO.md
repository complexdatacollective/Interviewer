- Server pairing removed - how do we want to handle this ultimately?
- Not compatible with react 18
  - recompose - remove it
  - 5.8.x of @codaco/ui - upgrade
  - react-virtualized - alternatives?
  - connected-react-router - replace
- redux-form is not compatible with react-redux > 7
- remove @codaco/spellcheker
- remove fusejs-legacy
- how should protocol node workers be initialized?
  - it looks like our current implementation compiles the worker after reading the file from text. this should work if the worker is sent over the API, so file reading code can be put in the backend.
- Replace with createRoot and React.StrictMode
- Use redux-toolkit
- Update testing framework
- Review eslint rules
  - No unused vars needs to be turned back on
  - accessibility related linting needs to be enforced
- Removed namegeneratorlist and autocomplete - this requires newer protocol schema


  ---- 
  OLD TODO

  Core dependencies to update:

- Webpack (Can we use new CRA?) -> webpack 5
- Remove enzyme and replace with @testing-library/react
- replace mdns with something that works with context isolation
- replace bespoke dialogs and toasts with something from an existing UI lib
- React
- React Router
- Framer-Motion
- Sass
- Cordova -> capacitor?

Design changes

- move filesystem to backend, and all filesystem related calls into API bridge
- Use something like automerge to manage local state to global merge? <https://github.com/automerge/automerge>
- Protocol actions must be moved to a backend, which will store protocol data
- Frontend will then hydrate store/session by requesting protocol data from the backend
- Protocol assets will be requested from the backend at runtime.
- Could this also apply to roster data so that it can be pre-processed?
- replace use of react-flip-toolkit on categorical bin
- replace use of react-id-swiper on alter form interfaces
- replace use of react-transition group with framer-motion

- App bundle size
- Font sizing

- Settings menu needs to become participant facing when in the interview

- App state needs to be divided into two parts:
  - Local state, which will comprise everything needed for the current session
  - Global state, which will comprise "device" settings, user data, and persistent app data
