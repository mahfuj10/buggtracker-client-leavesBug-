import { Close } from '@mui/icons-material';
import { Box, Drawer, IconButton, InputBase, Typography } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectTask } from '../../../reducers/project/projectSlice';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import TaskAssignDropdown from '../TaskAssignDropdown';

export default function UpdateTaskDrawer({ open, toggleDrawer = () => {} }) {

  const task = useSelector(selectTask);

  return (
    <Drawer anchor="right" open={open} onClose={() => toggleDrawer()}>

      {/* <IconButton onClick={toggleDrawer}>
        <Close />
      </IconButton> */}

      <Box sx={{
        px: 3,
        width: {
          xs: '100%',
          sm: 320,   
          md: 400,   
          lg: 500,   
          xl: 600    
        }
      }}>

      

        <br />

        <InputBase
          defaultValue={task.title}
          sx={{ fontWeight:'bold', fontSize: 23}}
        />

        <Box display={'flex'}>
          <Typography variant='body' color='#656f7d' fontSize={14} display='flex' alignItems={'center'} columnGap={0.5}>
            <PersonOutlineIcon />
            Assignees
          </Typography>

          <TaskAssignDropdown />
        </Box>

      </Box>

    </Drawer>
  );
}
