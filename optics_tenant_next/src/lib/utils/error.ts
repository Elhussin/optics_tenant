
export  function handleError(error: any) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Error response:', error.response.data);
    console.error('Error status:', error.response.status);
    console.error('Error headers:', error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Error request:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error message:', error.message);
  }
  console.error('Error config:', error.config);
}

export function handleApiError(error: any) {
  if (error.response) {
    // Server responded with a status code outside the range of 2xx
    console.error('API Error:', error.response.data);
    console.error('Status Code:', error.response.status);
  } else if (error.request) {
    // Request was made but no response received
    console.error('API Request Error:', error.request);
  } else {
    // Something else happened in setting up the request
    console.error('API Error Message:', error.message);
  }
}


export function handleErrorStatus(error: any) {
    // Handle different error statuses and show appropriate messages
    let message :string ='An error occurred';
    if (error.response?.status === 400) {
            message='Validation error occurred';
          }
          if (error.response?.status === 401) {
            message = 'Unauthorized access';
          }
          if (error.response?.status === 403) {
            message = 'Forbidden access';
          }
          if (error.response?.status === 404) {
            message = 'Resource not found';
          }
          if (error.response?.status === 500) {
            message = 'Internal server error';

          }
          if (error.response?.status === 503) {
            message = 'Service unavailable';

          }
          if (error.response?.status === 422) {
            message = 'Unprocessable entity';
    
          }
          if (error.response?.status === 429) {
            message = 'Too many requests, please try again later';

          }
          if (error.response?.status === 408) {
            message = 'Request timeout, please try again';
          }
          
    return message;
}