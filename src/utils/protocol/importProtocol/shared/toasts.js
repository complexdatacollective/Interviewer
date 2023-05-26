import { ProgressBar, Spinner } from "@codaco/ui";
import { store } from "~/ducks/store";
import { actionCreators as toastActions } from "~/ducks/modules/toasts";

const dispatch = store.dispatch;

export const showStartImportToast = (toastUUID, dismissHandler) => dispatch(toastActions.addToast({
  id: toastUUID,
  type: 'info',
  title: 'Importing Protocol...',
  CustomIcon: (<Spinner small />),
  autoDismiss: false,
  dismissHandler,
  content: (<ProgressBar orientation="horizontal" percentProgress={10} />),
}));

export const showCancellationToast = () => {
  dispatch(toastActions.addToast({
    type: 'warning',
    title: 'Import cancelled',
    content: (
      <React.Fragment>
        <p>You cancelled the import of this protocol.</p>
      </React.Fragment>
    ),
  }));
}

