import { createEpicMiddleware } from 'redux-observable';
import rootEpic from '../modules/rootEpic';

export default createEpicMiddleware(rootEpic);
