import { Add } from '@mui/icons-material';
import { Box, Button, IconButton, Typography } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import TaskTable from './ListTaskTable';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import {  Adjust, ExpandMore, MoreHoriz } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { setTask } from '../../../reducers/project/projectSlice';


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


export default function ListTaskContainer({ 
  sprint,
  onDragEnd,
  toggleUpdateTaskDrawer = () => {},
  toggleAddTaskDrawer = () => {} 
}) {

  const dispatch = useDispatch();
   
  {/* onDragStart={() => dispatch(setDragging(true))} */}
  {/* setTimeout(() => dispatch(setDragging(false)), 500); */}
  const getTasksByStatus = (status) => {
    return sprint.tasks.filter(task => task.status.name === status.name);
  };
 
  return (
    <DragDropContext onDragEnd={e => onDragEnd(e)}>
      <Droppable droppableId="Parent" type="droppableItem">
        {(provided) => (
          <div ref={provided.innerRef}>
            {((sprint && sprint.status) || []).map((status, index) => (
              <Draggable
                draggableId={`status-${status._id}`}
                key={`status-${status._id}`}
                index={index}
              >
                {(parentProvider) => (
                  <div
                    ref={parentProvider.innerRef}
                    {...parentProvider.draggableProps}
                  >
                    <Droppable droppableId={status._id.toString()}>
                      {(provided) => (
                        <Accordion
                          ref={provided.innerRef}
                          {...parentProvider.dragHandleProps}
                          defaultExpanded sx={{ boxShadow: 0 }}>
                       
                          <AccordionSummary
             
                            expandIcon={
                              <span>
                                <ExpandMore />
                              </span>
                            }
             
                            aria-controls="panel1-content"
                            id="panel1-header"
                          >
                            <Box  display='flex' alignItems='center' columnGap={2} ml={1}>
                         
                              <Button 
                                startIcon={<Adjust />} 
                                sx={{ boxShadow: 0, py: 0, px: 1, backgroundColor: status.color}} 
                                variant="contained" 
                                size="small"
                                className='pointer-events-none'
                              >
                                {status.name}
                              </Button>
             
                              <Typography fontSize={12} color='#656f7d'>
                                {getTasksByStatus(status).length}
                              </Typography>
                   
                              <IconButton sx={{ borderRadius: 2 }} size='small' onClick={(e)  =>  e.stopPropagation()}>
                                <MoreHoriz fontSize='12px' />
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
                                  toggleAddTaskDrawer(); 
                                  dispatch(setTask({ status }));
                                }}
                              >
                                <Add fontSize='12px' /> Add Task
                              </Typography>
                            </Box>
                          </AccordionSummary>
                         
                          <AccordionDetails sx={{mt:-3}}>
                            
                            <TaskTable
                              tasks={getTasksByStatus(status)}  
                              toggleUpdateTaskDrawer={toggleUpdateTaskDrawer}
                            />

                          </AccordionDetails>
                          {provided.placeholder}
                        </Accordion>
                      )}
                    </Droppable>
                  </div>
                )}
              </Draggable>
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
