function generateSerials(count) {
  return Array.from({ length: count }, (_, index) => {
    return `SN-${String(index).padStart(3, "0")}`;
  });
}

function chunkSerials(serials, chunkSize) {
  const batches = [];
  for (let i = 0; i < serials.length; i += chunkSize) {
    batches.push(serials.slice(i, i + chunkSize));
  }
  return batches;
}

module.exports = {
  generateSerials,
  chunkSerials,
};
