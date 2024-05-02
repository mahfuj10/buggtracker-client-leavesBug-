// authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { useUtils } from '../../utils/useUtils';
import firebase from 'firebase/compat/app';
import { auth } from '../../services/firebase';
import axios from 'axios';
import { getTeamById, setTeam } from '../team/teamSlice';

export const authSlice = createSlice({
  name: 'auth',
  initialState: {   
    user: null,
    error: null,
    loading: false,
    isInitialized: false
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
  },
});
 

export const createUser = (data) => async () =>  {
  try{
    const response = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/user/create`, data);

    return response.data;
  }catch(err){
    return err;
  }
};

export const updateUser = (id, data) => async () =>  {
  try{
    const response = await axios.put(`${process.env.REACT_APP_SERVER_BASE_URL}/user/update?id=${id}`, data);

    return response.data;
  }catch(err){
    return err;
  }
};

export const isUserAlreadyExist = (email) => async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/user/check-user?email=${email}`);

    return response.data;
  } catch (error) {
    return error;
  }  
};

export const getUserById = (uid) => async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/user/id?uid=${uid}`);

    return response.data;
  } catch (error) {
    return error;
  }  
};

export const sendResetPasswordEmail = (email) => async () => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/user/reset-password`, {
      email
    });

    return response.data;
  } catch (error) {
    return error;
  }  
};

export const loginWithEmail = (email, password) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const response = await dispatch(getUserById(userCredential.user.uid));
    
    dispatch(setUser(response));
  } catch (error) {
    dispatch(setError(error.message));
  }
  dispatch(setLoading(false));
};

export const registerWithEmail = (displayName, photoURL,  email, password) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const { user } = await auth.createUserWithEmailAndPassword(email, password);

    const data = { 
      uid: user.uid,
      email: email,
      name: displayName, 
      phoneNumber: user.phoneNumber,
      projectInvited: [],
      projectJoined: [],
      photoURL
    };
    
    await dispatch(createUser(data));
    
    dispatch(setUser(data));
  } catch (error) {
    dispatch(setError(error.message));
  }
  dispatch(setLoading(false));
};

export const signOut = () => async (dispatch) => {
  try {
    await auth.signOut();
    const utils = useUtils();
    dispatch(setUser(utils.extractUser({})));
  } catch (error) {
    console.error('Sign out error:', error.message);
  }
};

export const signInWithGoogle = () => async (dispatch) => {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const userCredential = await auth.signInWithPopup(provider);
    
    return userCredential.user;
  } catch (error) {
    dispatch(setError(error.message));
  }
};

const setProjectANDSprint = async(dispatch) => {
  try{
    console.log('object');
  }catch(err){
    console.error(err);
  }

};

export const initAuthListener = (dispatch) => {
  dispatch(setInitialized(false));
  auth.onAuthStateChanged(async(user) => {
    try{
      if (user) {
        const response = await dispatch(getUserById(user.uid));
        
        const team_id = localStorage.getItem('team_id');
        if(!team_id) {
          localStorage.setItem('team_id', response.teamJoined && response.teamJoined[2]?._id);
        } else {
          const team = await dispatch(getTeamById(team_id));
          dispatch(setTeam(team));
        }
        
        dispatch(setUser(response));
      } else {
        console.log('no user');
      }
    }catch(err){
      console.log(err);
    }
    dispatch(setInitialized(true));
  });
};

export const { setUser, setError, clearError, setLoading, setInitialized } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectError = (state) => state.auth.error;
export const selectLoading = (state) => state.auth.loading;
export const selectIsInitialized = (state) => state.auth.isInitialized;


export default authSlice.reducer;
