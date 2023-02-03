const formatDatestamp = (datestamp) => {
  if (!datestamp) { return datestamp; }
  return new Date(datestamp).toISOString();
};

export default formatDatestamp;
