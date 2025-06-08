# Regression Test Runner

This repository contains a regression test runner that can be executed via GitHub Actions to run automated tests for your project.

## Prerequisites

- A GitHub repository
- Access to the DrCode and Project Id.

## Environment Variables

The following environment variables need to be set in your GitHub repository:

| Variable     | Description                                       | Required | Default     |
| ------------ | ------------------------------------------------- | -------- | ----------- |
| `NODE_ENV`   | Environment (development/production)              | No       | development |
| `PROJECT_ID` | Your DrCode project ID                            | Yes      | -           |
| `EMAILS`     | Comma-separated list of email addresses to notify | Yes      | -           |
| `PORT`       | Port number for the local tunnel                  | Yes      | 3000        |
| `LOCAL_HOST` | Host name for the local tunnel                    | Yes      | localhost   |
| `PREFIX`     | URL path prefix for the API endpoints             | No       | ""          |

## Tunnel Configuration

The test runner supports creating a local tunnel for development environments. This is useful when you need to expose your local server to the internet.

### Using the Tunnel

When the tunnel is created, it will:

1. Create a secure tunnel to your local development server
2. Provide a public URL that can be accessed from anywhere
3. Keep the connection alive for the duration of the test run
4. Automatically append the PREFIX to the tunnel URL if specified

The tunnel URL will be automatically used as the base URL for API calls in development mode.

### URL Prefix Handling

The `PREFIX` environment variable allows you to specify a path prefix for your API endpoints. For example:

- If `PREFIX` is set to `/api/v1`, the final URL will be: `https://your-tunnel-url/api/v1`
- If `PREFIX` is set to `api/v1/`, the final URL will be: `https://your-tunnel-url/api/v1`
- If `PREFIX` is not set, the tunnel URL will be used as is

The prefix is automatically cleaned (removing leading and trailing slashes) to ensure proper URL formatting.

## GitHub Actions Setup

1. Create a `.github/workflows` directory in your repository if it doesn't exist:

   ```bash
   mkdir -p .github/workflows
   ```

2. Create a new workflow file (e.g., `ci.yml`) in the `.github/workflows` directory with the following content:

   ```yaml
   name: CI/CD Pipeline

   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]

   env:
     REGISTRY: ghcr.io
     IMAGE_NAME: ${{ github.repository }}
     NODE_ENV: development
     PROJECT_ID: 905 # Replace with your project ID
     EMAILS: "your-email@example.com" # Replace with your email
     TEST_IMAGE: mokshitjain18/drcode-regression-test-runner:latest

   jobs:
     regression-test:
       runs-on: ubuntu-latest
       steps:
         - name: Run regression tests
           run: |
             docker run \
               -e NODE_ENV=${{ env.NODE_ENV }} \
               -e PROJECT_ID=${{ env.PROJECT_ID }} \
               -e EMAILS=${{ env.EMAILS }} \
               --name drcode-regression-test-runner \
               ${{ env.TEST_IMAGE }}
           continue-on-error: true

         - name: Check container logs
           if: always()
           run: |
             docker logs drcode-regression-test-runner

         - name: Cleanup container
           if: always()
           run: |
             docker rm -f drcode-regression-test-runner || true
   ```

3. Configure GitHub Secrets (Optional):

   - Go to your repository settings
   - Navigate to "Secrets and variables" → "Actions"
   - Add the following secrets if you want to keep them private:
     - `PROJECT_ID`
     - `EMAILS`

   Then update the workflow file to use secrets:

   ```yaml
   env:
     PROJECT_ID: ${{ secrets.PROJECT_ID }}
     EMAILS: ${{ secrets.EMAILS }}
   ```

## Understanding the Workflow

The workflow consists of three main steps:

1. **Run regression tests**: Executes the test runner container with the specified environment variables
2. **Check container logs**: Displays the test execution logs
3. **Cleanup container**: Removes the container after execution

### Test Results Format

The test results will be displayed in a structured format:

```
📊 Test Results Summary:
=====================
Total Tests: X
✅ Passed: Y
❌ Failed: Z
⏳ Pending: W

📝 Detailed Results:
=====================
1. Test Name
   Status: ✅ PASSED
   Last Run: [timestamp]
```

## Manual Testing

To test locally:

1. Pull the test runner image:

   ```bash
   docker pull mokshitjain18/drcode-regression-test-runner:latest
   ```

2. Run the container:

   ```bash
   docker run \
     -e NODE_ENV=development \
     -e PROJECT_ID=your_project_id \
     -e EMAILS=your-email@example.com \
     -e PORT=3000 \
     -e LOCAL_HOST=localhost \
     -e PREFIX=api/v1 \
     --name drcode-regression-test-runner \
     mokshitjain18/drcode-regression-test-runner:v1
   ```

3. Check the logs:
   ```bash
   docker logs drcode-regression-test-runner
   ```

## Troubleshooting

1. **Container fails to start**:

   - Check if all required environment variables are set
   - Verify the Docker image exists and is accessible
   - Check Docker logs for detailed error messages

2. **Tests not running**:

   - Verify the PROJECT_ID is correct
   - Check if the API endpoints are accessible
   - Ensure the EMAILS variable is properly formatted
   - Verify the PREFIX is correctly set if your API requires it

3. **No logs visible**:

   - The workflow includes a separate step to show logs
   - Check the GitHub Actions logs for the "Check container logs" step

4. **Tunnel issues**:
   - Verify the PORT is correct and matches your application's port
   - Check if the LOCAL_HOST is properly configured
   - Ensure your application is running and accessible on the specified port
   - Check the logs for any tunnel-related errors
   - Verify the PREFIX is correctly formatted if specified

## Support

For issues or questions:

1. Check the GitHub Actions logs for detailed error messages
2. Verify your environment variables and configuration
3. Contact support if the issue persists
