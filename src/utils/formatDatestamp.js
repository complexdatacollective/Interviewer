const formatDatestamp = (datestamp) => {
  if (!datestamp) { return null; }
  return new Date(datestamp).toISOString();
};

export default formatDatestamp;
