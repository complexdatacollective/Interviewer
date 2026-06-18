import { createDeepEqualSelector } from './utils';

export const getExternalData = createDeepEqualSelector(
  (state) => state.externalData,
  (protocolData) => protocolData,
);
