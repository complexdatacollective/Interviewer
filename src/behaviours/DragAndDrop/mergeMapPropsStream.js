import { mapPropsStream } from 'recompose';
import Rx from 'rxjs/Rx';
import { compose } from 'redux';
import { pick } from 'lodash/fp';
import { store } from './dragState';

const store$ = Rx.Observable.from(store);

const mergeMapPropsStream = (mapState, types) => {
  const pickTypes = pick(types);

  return mapPropsStream(
    props$ =>
      store$
        .combineLatest(props$, (state, props) => ({
          ...pickTypes(mapState(state, props)),
          ...props,
        })),
  );
};

export default mergeMapPropsStream;
