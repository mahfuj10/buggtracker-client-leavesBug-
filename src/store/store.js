import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../reducers'; // Import your root reducer

const store = configureStore({
  reducer: rootReducer,
  // Other store configurations (middleware, enhancers) can be added here
});

export default store;
