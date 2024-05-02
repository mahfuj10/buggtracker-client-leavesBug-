import { Add } from '@mui/icons-material';
import { Box, Button, IconButton, Typography } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import React, { useEffect } from 'react';
import {  useSelector, useDispatch } from 'react-redux';
import AdjustIcon from '@mui/icons-material/Adjust';
import TaskTable from './TaskTable';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import {  selectSprint, setSprint, setTask } from '../../reducers/project/projectSlice';
import socket from '../../utils/socket';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(180deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

export default function ListTasks({ toggleDrawer = () => {} }) {
  // #656f7d
  const dispatch = useDispatch();
  const sprint = useSelector(selectSprint);

  useEffect(() => {
    socket.on('newTask', (task) => {
      console.log('new task from socket', task);
      dispatch(setSprint({...sprint, tasks: [...sprint.tasks, task]}));
    });
    return () => {
      socket.off('newTask');
    };
  }, [socket]);

  const handleDragEnd = (result) => {
    // Handle drag end here
    console.log('result', result);
  };


  return (
    <Box>
      

      {
        ((sprint && sprint.status) || []).map(status => <Box key={status._id}>
          
          <Accordion  
            defaultExpanded sx={{ boxShadow: 0 }}>
          
            <AccordionSummary

              expandIcon={
                <span >
                  <ExpandMoreIcon />
                </span>
              }

              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Box  display='flex' alignItems='center' columnGap={2} ml={1}>
            
                <Button 
                  startIcon={<AdjustIcon />} 
                  sx={{ boxShadow: 0, py: 0, px: 1, backgroundColor: status.color}} 
                  variant="contained" 
                  size="small"
                  className='pointer-events-none'
                >
                  {status.name}
                </Button>

                <Typography fontSize={12} color='#656f7d'>{sprint.tasks.length}</Typography>
      
                <IconButton sx={{ borderRadius: 2 }} size='small' onClick={(e)  =>  e.stopPropagation()}>
                  <MoreHorizIcon fontSize='12px' />
                </IconButton>
      
                <Typography 
                  className='cursor-pointer' 
                  fontSize={12}
                  display='flex'
                  alignItems='center'
                  columnGap={0.5}
                  color='#656f7d'
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleDrawer(); 
                    dispatch(setTask({status}));
                  }}>
                  <Add fontSize='12px' /> Add Task
                </Typography>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails>
              <TaskTable status={status.name}  />
            </AccordionDetails>
          </Accordion>

        </Box>)
      } 
    </Box>
  );
}
