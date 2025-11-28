// API Configuration
// API Gateway endpoint from the backend stack deployment

export const config = {
  // API Gateway endpoint from ServerlessBackendStack deployment
  API_ENDPOINT: process.env.REACT_APP_API_ENDPOINT || 
                'https://bytzn6agd7.execute-api.eu-central-1.amazonaws.com/api',
  
  // API paths
  API_PATHS: {
    recommendations: '/recommendations',
    feedback: '/feedback',
  }
};

// Helper to get full API URL
export const getApiUrl = (path) => {
  return `${config.API_ENDPOINT}${path}`;
};
