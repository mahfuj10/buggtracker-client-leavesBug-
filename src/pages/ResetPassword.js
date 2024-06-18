import { Box } from '@mui/material';
import React from 'react';
import ResetPasswordForm from '../components/form/ResetPasswordForm';
import Logo from '../components/common/Logo';

export default function ResetPassword() {
  
  return (
    <>
      <Logo position="absolute" />
      
      <Box
        sx={{
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh', 
        }}
      >
        <ResetPasswordForm />
      </Box>
    </>
  );
}
