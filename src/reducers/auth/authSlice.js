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
    isInitialized: false,
    isTeamAdmin: false,
    isTeamCreator: false
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
    setAdmin: (state, action) => {
      state.isTeamAdmin = action.payload;
    },
    setTeamCreator: (state, action) => {
      state.isTeamCreator = action.payload;
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
 
export const initAuthListener = (dispatch) => {
  dispatch(setInitialized(false));
  auth.onAuthStateChanged(async(loginUser) => {
    try{
      if (loginUser) {
        const user = await dispatch(getUserById(loginUser.uid));
        
        const team_id = localStorage.getItem('team_id');
        const teamJoinedId = user.teamJoined && user.teamJoined.map(team => team._id);

        if(!team_id && user.teamJoined && user.teamJoined[0]) {
          localStorage.setItem('team_id', user.teamJoined[0]._id);
        } 

        if(team_id && teamJoinedId.includes(team_id)){
          const team = await dispatch(getTeamById(team_id));
          
          if((team.admins || []).findIndex(admin => admin._id === user._id) !== -1){
            dispatch(setAdmin(true));
          }

          if(user._id === team.createor._id){
            dispatch(setTeamCreator(true));
          }

          dispatch(setTeam(team));
        }
        
        dispatch(setUser(user));
      } else {
        console.log('no user');
      }
    }catch(err){
      console.log(err);
    }
    dispatch(setInitialized(true));
  });
};

export const { setUser, setError, clearError, setLoading, setInitialized, setAdmin, setTeamCreator } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectError = (state) => state.auth.error;
export const selectLoading = (state) => state.auth.loading;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectAdmin = (state) => state.auth.isTeamAdmin;
export const selectTeamCreator = (state) => state.auth.isTeamCreator;


export default authSlice.reducer;
