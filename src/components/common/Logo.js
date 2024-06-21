import { Avatar, Box } from '@mui/material';
import React from 'react';
import logo from '../../assets/img/logo.jpg';
import { useNavigate } from 'react-router-dom';
import { OVERVIEW } from '../../utils/path';

export default function Logo({ position = 'relative'}) {

  const navigate = useNavigate();

  return (
    <Box padding={2} position={position}>
      <Avatar
        alt="LEAVES_BUG LOGO" 
        src={logo} 
        sx={{ width: 70, height: 70 }}
        className='cursor-pointer'
        onClick={() => navigate(OVERVIEW)}
      />
    </Box>
  );
}
