import PropTypes from 'prop-types';
import { withContext, getContext } from 'recompose';
import createDragStore from './createDragStore';

const dragStore = createDragStore();

const provideDragContext = () => withContext(
  { DragContext: PropTypes.object },
  () => ({ DragContext: dragStore }),
);

const getDragContext = () => getContext(
  { DragContext: PropTypes.object },
);

export {
  provideDragContext,
  getDragContext,
};
