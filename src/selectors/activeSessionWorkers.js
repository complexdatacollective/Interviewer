import { createSelector } from 'reselect';
import { NodeLabelWorkerName } from '../utils/WorkerAgent';

const getActiveSessionWorkers = (state) => state.activeSessionWorkers;

export const getNodeLabelWorkerUrl = createSelector(
  getActiveSessionWorkers,
  // null if URLs haven't yet loaded; false if worker does not exist
  (activeSessionWorkers) => activeSessionWorkers && (activeSessionWorkers[NodeLabelWorkerName] || false),
);

export default getNodeLabelWorkerUrl;
