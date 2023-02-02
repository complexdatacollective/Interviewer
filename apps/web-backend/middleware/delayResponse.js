const delayResponse = async (req, res, next) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  next();
}

export default delayResponse;
