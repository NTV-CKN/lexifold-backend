const formatTimestamp = (timestamp) => {
  return (timestamp && typeof timestamp.toDate === "function") 
    ? timestamp.toDate().toISOString() 
    : null;
};

module.exports = {
    formatTimestamp
}