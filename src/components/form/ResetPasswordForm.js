import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { isUserAlreadyExist, selectError, selectLoading, sendResetPasswordEmail, setError, setLoading } from '../../reducers/auth/authSlice';
import { useUtils } from '../../utils/useUtils';
import { LOGIN } from '../../utils/path';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('');

  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const authError = useSelector(selectError);
  const authLoading = useSelector(selectLoading);
  
  const { isEmailValid } = useUtils();

  const handleResetPasswordEmail = async() => {
    try {
      if(!email) return;
      if(!isEmailValid(email)) return dispatch(setError('Invalid email.'));

      dispatch(setLoading(true));

      const response = await dispatch(isUserAlreadyExist(email));
      
      if(response.exists){
        await dispatch(sendResetPasswordEmail(email));
        alert('Please check your email.');
        navigate(LOGIN);
      } else {
        dispatch(setError('Can\'t find any account. please try with valid email..!'));
      }
    }catch(err){
      console.error(err);
    }
    dispatch(setLoading(false));
  };


    
  return (
    <Paper
      elevation={2} 
      sx={{ p: 3, display:'flex', flexDirection:'column', rowGap: 3}}
    >

      <Typography variant='h5' textAlign='left' fontWeight='bold'>
        Reset password
      </Typography>

      <TextField
        label="Email *"
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleResetPasswordEmail()}
        sx={{ width: 320 }}
      />

      <Button
        onClick={handleResetPasswordEmail}
        disabled={authLoading}
        variant="outlined">
          SEND EMAIL
      </Button>

      <Typography
        sx={{ textDecoration:'underline', cursor:'pointer' }}
        variant='caption'
        textAlign='left' 
        onClick={() => navigate(LOGIN)}
      >
         Sign In?
      </Typography>

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
