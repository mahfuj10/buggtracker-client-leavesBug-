import { Box } from '@mui/material';
import React from 'react';
import RegisterForm from '../components/form/RegisterForm';
import Logo from '../components/common/Logo';

export default function Register() {
  
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
        <RegisterForm />
      </Box>
    </>
  );
}
