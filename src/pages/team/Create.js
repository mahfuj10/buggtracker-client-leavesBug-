import { Box } from '@mui/material';
import React from 'react';
import CreateTeam from '../../components/team/CreateTeam';
import Logo from '../../components/common/Logo';

export default function Create() {
  
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
        <CreateTeam />
      </Box>
    </>
  );
}
