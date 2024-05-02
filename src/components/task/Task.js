import { Box, Button, IconButton, Typography } from '@mui/material';
import React from 'react';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Add } from '@mui/icons-material';

export default function Task() {
  return (
    <Box display='flex' justifyContent='space-between'>
      <Box>
        <Typography variant='h5' fontWeight='bold'>Todo</Typography>
        <Typography mt={-0.2} display='block' variant='caption'>2 Task available</Typography>
      </Box>
      <Box>
        <IconButton sx={{ border: '1px solid gray'}} size='small'>
          <MoreHorizIcon />
        </IconButton>
        <Button variant='contained' startIcon={<Add />} 
          sx={{
            boxShadow:0,
            borderRadius:0,
            background:'black'
          }}
        >
            Add new
        </Button>
      </Box>
    </Box>
  );
}
