import { useDispatch, useSelector } from 'react-redux';
import { actionCreators, selectors } from '../ducks/modules/dismissedUpdates';

const useDismissedUpdatesState = () => {
  const currentDismissedUpdates = useSelector(selectors.getDismissedUpdates());
  const dispatch = useDispatch();

  const dismissUpdate = (version) => {
    dispatch(actionCreators.dismissUpdate(version));
  };

  return [currentDismissedUpdates, dismissUpdate];
};

export default useDismissedUpdatesState;
