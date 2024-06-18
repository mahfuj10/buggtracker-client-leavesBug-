import { Box, Typography } from '@mui/material';
import React from 'react';
import NavigationTopbar from '../../components/common/navigation/NavigationTopbar';

export default function Overview() {
  return (
    <Box width={'100%'}>
      <NavigationTopbar />
      <Typography variant='h6' m={2}>Coming soon..</Typography>
    </Box>
  );
}
