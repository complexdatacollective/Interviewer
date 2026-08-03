const friendlyErrorMessage = (message) => (error) => {
  // If we already have a friendly message, just rethrow the error
  if (error.friendlyMessage) {
    throw error;
  }

  error.friendlyMessage = message;
  throw error;
};

export default friendlyErrorMessage;
