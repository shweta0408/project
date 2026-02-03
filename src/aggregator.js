const {
  DEFAULT_BASE_URL,
  DEFAULT_TOKEN,
  DEFAULT_ENDPOINT,
  retryablePostBatch,
} = require("./apiClient");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAllBatches(batches, options = {}) {
  const baseUrl = options.baseUrl || DEFAULT_BASE_URL;
  const token = options.token || DEFAULT_TOKEN;
  const endpoint = options.endpoint || DEFAULT_ENDPOINT;
  const rateLimitMs = options.rateLimitMs ?? 1000;
  const retryConfig = {
    maxRetries: options.maxRetries ?? 3,
    baseDelayMs: options.baseDelayMs ?? 1000,
  };

  const aggregated = [];
  let lastRequestAt = 0;

  for (const serials of batches) {
    const now = Date.now();
    const elapsed = now - lastRequestAt;
    if (elapsed < rateLimitMs) {
      await sleep(rateLimitMs - elapsed);
    }

    const payload = await retryablePostBatch(
      {
        baseUrl,
        token,
        endpoint,
        serials,
      },
      retryConfig,
    );

    if (Array.isArray(payload.data)) {
      aggregated.push(...payload.data);
    }

    lastRequestAt = Date.now();
  }

  return aggregated;
}

module.exports = { fetchAllBatches };
