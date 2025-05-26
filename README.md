# Calculator API Tester

A test application for the Calculator API that verifies all endpoints are working correctly.

## Features

- Tests health check endpoint
- Tests sum API endpoint
- Tests multiply API endpoint
- Provides detailed test results
- Configurable API URL through environment variable

## Running the Tests

### Using Docker

1. Build the Docker image:

   ```bash
   docker build -t calculator-api-tester .
   ```

2. Run the tests:
   ```bash
   docker run --rm -e CALCULATOR_API_URL=http://your-api-url:3000 calculator-api-tester
   ```

### Without Docker

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the tests:
   ```bash
   CALCULATOR_API_URL=http://your-api-url:3000 npm start
   ```

## Environment Variables

- `CALCULATOR_API_URL`: The base URL of the Calculator API (default: http://localhost:3000)

## Test Results

The application will output the results of each test and an overall pass/fail status. The process will exit with:

- 0 if all tests pass
- 1 if any test fails

## Docker Hub

The image is automatically built and pushed to Docker Hub on every push to the main branch. You can pull the latest version using:

```bash
docker pull your-username/calculator-api-tester:latest
```
