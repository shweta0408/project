# EnergyGrid Data Aggregator Client

This project implements a Node.js client that fetches telemetry from the EnergyGrid mock API while honoring the 1 request/second rate limit, 10-device batch limit, and MD5 signature requirement.

## Prerequisites

- Node.js v18+ (for built-in `fetch`)
- The mock API server running locally

## Setup

1. Install dependencies for the mock API and start it:

   ```bash
   cd mock-api
   npm install
   npm start
   ```

2. Run the client from this repository:

   ```bash
   npm start
   ```

The client prints a JSON report with all device data to stdout.

## Approach

- **Batching**: Generates 500 serials (`SN-000` to `SN-499`) and slices them into batches of 10.
- **Rate limiting**: Sends one batch per second using a simple in-process scheduler that enforces a minimum 1000ms gap between requests.
- **Signature**: Computes `MD5(url + token + timestamp)` for every request as required by the mock server.
- **Retries**: Retries 429 or transient network failures with exponential backoff and jitter before giving up.

## Configuration

Default values are defined in `src/apiClient.js`, but you can override them in `src/index.js` if needed.
