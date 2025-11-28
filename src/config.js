// API Configuration
// Update this with your deployed API Gateway endpoint from the backend stack

export const config = {
  // TODO: Replace with your actual API Gateway endpoint URL
  // You can find this in AWS CloudFormation stack outputs (ServerlessBackendStack -> ApiEndpoint)
  // or by running: aws cloudformation describe-stacks --stack-name ServerlessBackendStack --profile FakeGods
  // 
  // Format: https://{api-id}.execute-api.{region}.amazonaws.com/{stage}
  // Example: https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
  
  API_ENDPOINT: process.env.REACT_APP_API_ENDPOINT || 
                'https://YOUR_API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/prod',
  
  // API paths
  API_PATHS: {
    recommendations: '/recommendations',
    // Add more API paths as needed
  }
};

// Helper to get full API URL
export const getApiUrl = (path) => {
  return `${config.API_ENDPOINT}${path}`;
};
