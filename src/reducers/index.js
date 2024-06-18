import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import emailReducer from './email/emailSlice';
import teamReducer from './team/teamSlice';
import projectReducer from './project/projectSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  email: emailReducer,
  team: teamReducer,
  project: projectReducer
});

export default rootReducer;
