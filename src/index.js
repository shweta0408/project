const { generateSerials, chunkSerials } = require("./serials");
const { fetchAllBatches } = require("./aggregator");

async function run() {
  const serials = generateSerials(500);
  const batches = chunkSerials(serials, 10);

  console.log(`Generated ${serials.length} serial numbers.`);
  console.log(`Sending ${batches.length} batches (max 10 devices per batch).`);

  const results = await fetchAllBatches(batches, {
    rateLimitMs: 1000,
    maxRetries: 5,
    baseDelayMs: 1000,
  });

  const report = {
    total_devices: serials.length,
    total_records: results.length,
    fetched_at: new Date().toISOString(),
    data: results,
  };

  console.log("Aggregation complete.");
  console.log(JSON.stringify(report, null, 2));
}

run().catch((error) => {
  console.error("Aggregation failed:", error.message);
  process.exit(1);
});
