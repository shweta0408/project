const crypto = require("crypto");

const DEFAULT_BASE_URL = "http://localhost:3000";
const DEFAULT_TOKEN = "interview_token_123";
const DEFAULT_ENDPOINT = "/device/real/query";

function buildSignature(urlPath, token, timestamp) {
  return crypto
    .createHash("md5")
    .update(urlPath + token + timestamp)
    .digest("hex");
}

async function postBatch({ baseUrl, token, endpoint, serials }) {
  const timestamp = Date.now().toString();
  const signature = buildSignature(endpoint, token, timestamp);
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      timestamp,
      signature,
    },
    body: JSON.stringify({ sn_list: serials }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const error = new Error(
      `Request failed with status ${response.status}: ${errorBody}`,
    );
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function retryablePostBatch(options, retryConfig) {
  const { maxRetries, baseDelayMs } = retryConfig;
  let attempt = 0;

  while (true) {
    try {
      return await postBatch(options);
    } catch (error) {
      attempt += 1;
      const status = error.status;
      const isRetryable = status === 429 || status === undefined;

      if (!isRetryable || attempt > maxRetries) {
        throw error;
      }

      const backoff = baseDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 100);
      await new Promise((resolve) => setTimeout(resolve, backoff + jitter));
    }
  }
}

module.exports = {
  DEFAULT_BASE_URL,
  DEFAULT_TOKEN,
  DEFAULT_ENDPOINT,
  retryablePostBatch,
};
