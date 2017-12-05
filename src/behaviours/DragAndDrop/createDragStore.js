import { createStore } from 'redux';

const createDragStore = () =>
  createStore(
    (state = [], { type, ...action }) => {
      switch (type) {
        case 'UPDATE_TARGET':
          return  [...state, action];
        default:
          return state;
      }
    },
  );

export default createDragStore;
