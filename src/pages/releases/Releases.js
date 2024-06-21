import React from 'react';
import NavigationTopbar from '../../components/common/navigation/NavigationTopbar';
import { Box, Typography } from '@mui/material';

export default function Releases() {
  return (
    <Box width={'100%'}>
      <NavigationTopbar />
      
      <Box boxShadow={1} bgcolor={'white'} p={2} ml={2} mt={2}>
        <Typography variant='h6'>
          This project is on BETA v.0.0.0 updated at 6 Jun 2024
        </Typography>
      </Box>
      
      <Box boxShadow={1} bgcolor={'white'} p={1.5} ml={2} mt={2}>
        <Typography variant='h6'>
          Upcoming v.1.0.0
        </Typography>

        <Typography variant='h6' my={1}>
          1. Notification system
        </Typography>

        <Typography variant='h6' my={1}>
          2. Reports page
        </Typography>

        <Typography variant='h6' my={1}>
          2. Help center
        </Typography>
      </Box>

      <Box boxShadow={1} bgcolor={'white'} p={1.5} ml={2} mt={2}>
        <Typography variant='h6'>
          Upcoming v.2.0.0
        </Typography>

        <Typography variant='h6' my={1}>
          1. Mobile Application
        </Typography>
      </Box>

      <Typography m={2} display={'block'} variant='caption'>
        @copyright; LeavesBug developer
      </Typography>
    </Box>
  );
}
