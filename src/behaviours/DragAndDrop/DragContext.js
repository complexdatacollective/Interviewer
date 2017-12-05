import PropTypes from 'prop-types';
import { withContext, getContext } from 'recompose';
import createDragStore from './createDragStore';

const provideDragContext = () => withContext(
  { DragStore: PropTypes.object },
  () => ({ DragStore: createDragStore }),
);

const getDragContext = () => getContext(
  { DragStore: PropTypes.object },
);

export {
  provideDragContext,
  getDragContext,
};
