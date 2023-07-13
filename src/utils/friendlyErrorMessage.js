const friendlyErrorMessage = (message) => (error) => {
  console.log('friendlyErrorMessage', error, message);
  // If we already have a friendly message, just rethrow the error
  if (error.friendlyMessage) { throw error; }

  // eslint-disable-next-line no-param-reassign
  error.friendlyMessage = message;
  throw error;
};

export default friendlyErrorMessage;
