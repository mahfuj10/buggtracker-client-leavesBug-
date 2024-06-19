import React, { useState } from 'react';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useUtils } from '../../utils/useUtils';
import OTPInput from '../common/OTPInput';
import { useDispatch, useSelector } from 'react-redux';
import {  clearMessage, sendMail, setEmailLoading, updateMessage } from '../../reducers/email/emailSlice';
import { useNavigate } from 'react-router-dom';
import { getUserById, isUserAlreadyExist, registerWithEmail, selectLoading, setUser } from '../../reducers/auth/authSlice';
import { LOGIN, OVERVIEW } from '../../utils/path';
import { OTP_TEMPLATE, OTP_TEMPLATE_SUBJECT, WElCOME_TEMPLATE, WElCOME_TEMPLATE_SUBJECT } from '../../utils/template';
import { setTeam } from '../../reducers/team/teamSlice';

export default function RegisterForm() {

  const [step, setStep] = useState('first'); // first -> email -> second -> otp -> third -> create account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [otp, setOtp] = useState('');

  const { isEmailValid, generateOTP, createImageWithInitial } = useUtils();

  const message = useSelector(state => state.email.message);
  const emailLoading = useSelector(state => state.email.loading);
  const authLoading = useSelector(selectLoading);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const  updateStep = (step)  => {
    setStep(step);
  };

  const handleClearMessage = () => {
    setTimeout(() => dispatch(clearMessage()), 2000);
  };

  const handleSendOTPinEmail = async () => {
    try{
      if(!email) return; 

      if(!isEmailValid(email)) { // check is email valid
        dispatch(updateMessage('Invalid email'));
        handleClearMessage();
        return;
      }

      // check is email already exist in database
      dispatch(setEmailLoading(true));
      const response = await dispatch(isUserAlreadyExist(email)); 
      dispatch(setEmailLoading(false));

      if(response.exists){
        return dispatch(updateMessage('This email is already exist !!!'));  
      }

      const otp = generateOTP().toString();
    
      const res = await dispatch(sendMail({
        email,
        subject: OTP_TEMPLATE_SUBJECT,
        template:  OTP_TEMPLATE(otp)
      }));

      if(!res.type.includes('rejected')){
        updateStep('second');
        setSentOtp(otp);
      }
    }catch(err){
      console.error(err);
    }
  };

  const handleManageOtp = () => {
    if(otp.length < sentOtp.length) return;
    
    if(otp !== sentOtp) {
      dispatch(updateMessage('Invalid otp'));
      handleClearMessage();
      return;
    }

    setStep('third');

  };

  const handleSignUpWithEmail = async () => {
    try{
      if(!name?.trim() || !email || !password) return;
      if(password.length < 6) return dispatch(updateMessage('Password must be 6 digits.'));

      handleClearMessage();

      const user = await dispatch(registerWithEmail(name, createImageWithInitial(name), email, password));
      
      const response = await dispatch(getUserById(user.uid));
      
      if(response.teamJoined && response.teamJoined.length){
        dispatch(setTeam(response.teamJoined[0]));
      }

      dispatch(setUser(response));
      

      await dispatch(sendMail({
        email: email,
        subject: WElCOME_TEMPLATE_SUBJECT,
        template: WElCOME_TEMPLATE(name)
      }));


      navigate(OVERVIEW);
    }catch(err){
      dispatch(updateMessage('Something went wrong !'));
      console.log(err);
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ p: 3, borderRadius: 3}}
    >

      <Typography variant='h5' textAlign='left' fontWeight='bold' marginBottom={3}>
        Sign Up
      </Typography>

      {
        step === 'first' &&
        <Box display='flex' flexDirection='column' rowGap={3} width={320}>
          <TextField
            label="Email *"
            onKeyDown={e => e.key === 'Enter' && handleSendOTPinEmail()} 
            onChange={e => setEmail(e.target.value)}
          />
        
          <Button 
            onClick={handleSendOTPinEmail}
            disabled={emailLoading}
            variant="outlined">
              NEXT 
          </Button>
        </Box>
      }

      {
        step === 'second' &&
        <Box display='flex' flexDirection='column' rowGap={3}>
          <OTPInput
            otp={otp}
            setOtp={setOtp}
            handleManageOtp={handleManageOtp}
          />

          <Box display='flex' flexDirection='column' rowGap={1}>
            <Box display='flex' flexDirection='row' columnGap={0.5}>
              <Button 
                onClick={() => setStep('first')}
                disabled={emailLoading}
                fullWidth
                variant="outlined">
                 Back
              </Button>

              <Button 
                onClick={handleSendOTPinEmail}
                fullWidth
                disabled={emailLoading}
                variant="outlined">
                 Resend
              </Button>
            </Box>

            <Button 
              onClick={handleManageOtp}
              variant="outlined">
                NEXT
            </Button>
          </Box>
        </Box>
      }
      {
        step === 'third' 
        &&
         <Box display='flex' flexDirection='column' rowGap={3} width={320}>
           <TextField
             label="Full Name *"
             onChange={e => setName(e.target.value)}
           />
          
           <TextField
             label="Email *"
             value={email}
             disabled
           />
          
           <TextField
             label="Password *"
             type="password"
             onChange={e => setPassword(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && handleSignUpWithEmail()}
           />

           <Button 
             disabled={authLoading}
             onClick={handleSignUpWithEmail}
             variant="outlined">
            Sign up
           </Button>
         </Box>
      }

      <Box>
        <Typography
          sx={{ textDecoration:'underline', cursor:'pointer', float:'left', mt: 1, mb: 1 }}
          variant='caption'
          onClick={() => navigate(LOGIN)}
        >
         Sign In?
        </Typography>

      </Box>

      <Box>
        { message && <Alert sx={{width: '90%' }} severity="info">{ message }</Alert> }
      </Box>

    </Paper>
  );
}
