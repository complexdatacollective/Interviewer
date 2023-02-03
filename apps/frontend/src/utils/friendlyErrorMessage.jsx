const friendlyErrorMessage = (message) => (error) => {
  if (error.friendlyMessage) { throw error; }

  // eslint-disable-next-line no-param-reassign
  error.friendlyMessage = message;
  throw error;
};

export default friendlyErrorMessage;
