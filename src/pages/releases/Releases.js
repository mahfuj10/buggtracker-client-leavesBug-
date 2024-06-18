import React from 'react';
import NavigationTopbar from '../../components/common/navigation/NavigationTopbar';
import { Box, Typography } from '@mui/material';

export default function Releases() {
  return (
    <Box width={'100%'}>
      <NavigationTopbar />
      <Typography variant='h6' m={2}>This project is on BETA v.0.0.0 updated at 6 Jun 2024</Typography>
    </Box>
  );
}
