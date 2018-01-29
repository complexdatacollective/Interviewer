/**
 * Simple resolver for icon naming.
 *
 * Reconcile protocol "venue" naming with Network-Canvas-UI (svg) "place"
 */
const getNodeIconName = nodeType => (
  (nodeType === 'venue') ? 'place' : nodeType
);

export default getNodeIconName;
