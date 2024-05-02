import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {  createUser, getUserById, isUserAlreadyExist, loginWithEmail, selectError, selectLoading, setError, setLoading, setUser, signInWithGoogle } from '../../reducers/auth/authSlice';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from 'react-router-dom';
import { HOME, REGISTER, RESET_PASSWORD } from '../../utils/path';
import { useUtils } from '../../utils/useUtils';
import { sendMail } from '../../reducers/email/emailSlice';
import { WElCOME_TEMPLATE, WElCOME_TEMPLATE_SUBJECT } from '../../utils/template';

export default function LoginForm() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
    
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authLoading = useSelector(selectLoading);
  const authError = useSelector(selectError);

  const { isEmailValid, createImageWithInitial, getCurrentLocation } = useUtils();

  
  const handleGoogleSignIn = async() => {
    try{

      dispatch(setLoading(true));

      const user = await dispatch(signInWithGoogle());
      const response = await dispatch(isUserAlreadyExist(user.email));
      const imageURL = createImageWithInitial(user.displayName);

      const userCred = {
        uid: user.uid,
        email: user.email,
        name: user.displayName, 
        phoneNumber: user.phoneNumber,
        projectInvited: [],
        projectJoined: [],
        photoURL: user.photoURL || imageURL,
        location
      };

      if(!response.exists){
        await dispatch(createUser(userCred));
        await dispatch(sendMail({
          email: userCred.email,
          subject: WElCOME_TEMPLATE_SUBJECT,
          template: WElCOME_TEMPLATE(userCred.name)
        }));
      }

      const res = await dispatch(getUserById(user.uid));
      dispatch(setUser(res));

      navigate(HOME);
    }catch(err){
      console.log(err);
    }finally {
      dispatch(setLoading(false));
    }
  };

  const handleSignInWithEmail = async() => {
    if(!email || !password) return;

    if(!isEmailValid(email)) { // check is email valid
      return dispatch(setError('Invalid email'));
    }

    await dispatch(loginWithEmail(email, password));

    navigate(HOME);
  };
 

  return (
    <Paper 
      elevation={2} 
      sx={{ p: 3, display:'flex', flexDirection:'column', rowGap: 3}}
    >

      <Typography variant='h5' textAlign='left' fontWeight='bold'>
        Sign In 
      </Typography>

      <TextField
        label="Email *"
        onChange={e => setEmail(e.target.value)}
        sx={{ width: 320 }}
      />
        
      <TextField
        label="Password *"
        type="password"
        onChange={e => setPassword(e.target.value)}
        sx={{ width: 320 }}
      />

      <Box display='flex' flexDirection='column' rowGap={0.8}>
        <Button 
          onClick={handleSignInWithEmail}
          disabled={authLoading}
          variant="outlined">
          Sign In
        </Button>

          or

        <Button
          variant="outlined"
          disabled={authLoading}
          onClick={handleGoogleSignIn}
          startIcon={
            <GoogleIcon />
          }
        >
          Sign in With Google
        </Button>
      </Box>
      

      <Box display='flex' flexDirection='column' rowGap={1}>
        <Typography
          sx={{ textDecoration:'underline', cursor:'pointer' }}
          variant='caption'
          textAlign='left' 
          onClick={() => navigate(REGISTER)}
        >
         Want to create account?
        </Typography>

        <Typography
          sx={{ textDecoration:'underline', cursor:'pointer' }}
          variant='caption'
          textAlign='left' 
          onClick={() => navigate(RESET_PASSWORD)}
        >
         Forget your password?
        </Typography>

      </Box>
     
      <Box sx={{  maxWidth: 320 }}>
        {
          authError && <Alert severity="error">
            { authError }
          </Alert> 
        }
      </Box>
    </Paper>
  );
}
