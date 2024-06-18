import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import LoginForm from '../components/form/LoginForm';
import Logo from '../components/common/Logo';
import { useLocation, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/auth/authSlice';
import { HOME, LOGIN } from '../utils/path';

export default function Login() {

  const navigate = useNavigate();
  const location = useLocation();
  const currentLoginUser = useSelector(selectUser);
  const isLogin = location.pathname === LOGIN;

  useEffect(() => {
    if(location.pathname === LOGIN && currentLoginUser && currentLoginUser.email){
      return navigate(HOME);
    }
  }, [isLogin]);
   
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
        <LoginForm />
      </Box>
    </>
  );
}
