import { Avatar, Box } from '@mui/material';
import React from 'react';
import logo from '../../assets/img/logo.jpg';

export default function Logo({ position = 'relative'}) {

  return (
    <Box padding={2} position={position}>
      <Avatar
        alt="LEAVES_BUG LOGO" 
        src={logo} 
        sx={{ width: 70, height: 70 }}
      />
    </Box>
  );
}
