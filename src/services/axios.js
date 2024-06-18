// Import Axios
import axios from 'axios';
console.log('process.env.REACT_APP_SERVER_BASE_URL',process.env.REACT_APP_SERVER_BASE_URL);
// Create an Axios instance with default configurations
const instance = axios.create({
  baseURL: process.env.REACT_APP_SERVER_BASE_URL, // Specify your base URL
  headers: {
    'Authorization': 'Bearer your-access-token' // Example: Authorization header with a token
  }
});

export default instance;