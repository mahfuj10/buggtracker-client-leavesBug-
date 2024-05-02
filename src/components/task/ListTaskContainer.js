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
import {  selectSprint, setDragging, setSprint, setTask, updateProjectSprint } from '../../reducers/project/projectSlice';
import socket from '../../utils/socket';
import {  Adjust, ExpandMore, MoreHoriz } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { updateTask } from '../../reducers/task/taskSlice';


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


export default function ListTaskContainer({ toggleDrawer = () => {} }) {
  const sprint = useSelector(selectSprint);
  const dispatch = useDispatch();


  useEffect(() => {
    socket.on('newTask', (task) => {
      console.log('new task from socket', task);
      dispatch(setSprint({...sprint, tasks: [...sprint.tasks, task]}));
    });
    return () => {
      socket.off('newTask');
    };
  }, [socket]);

  
  const rearangeArr = (arr, sourceIndex, destIndex) => {
    const arrCopy = [...arr];
    const [removed] = arrCopy.splice(sourceIndex, 1);
    arrCopy.splice(destIndex, 0, removed);

    return arrCopy;
  };

  const onDragEnd = async(result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === 'Parent') {
      dispatch(setSprint({
        ...sprint,
        status: rearangeArr(sprint.status, source.index, destination.index)
      }));
      
      await dispatch(updateProjectSprint(sprint._id, {
        status:  rearangeArr(sprint.status, source.index, destination.index)
      }));
      
    } else if (destination.droppableId !== source.droppableId) {
      const taskIndex = sprint.tasks.findIndex(task => task._id === result.draggableId);
      const status = sprint.status.find(status => status._id === result.destination.droppableId);

      if (taskIndex !== -1 && status) {
        const task = sprint.tasks[taskIndex];
        const updated_task = await dispatch(updateTask(task._id, {...task, status}));

        const updatedTasks = [...sprint.tasks];
        updatedTasks[taskIndex] = updated_task;

        dispatch(setSprint({
          ...sprint,
          tasks: updatedTasks,
        }));

        await dispatch(updateProjectSprint(sprint._id, {
          tasks: updatedTasks.map(task => task._id)
        }));
      }
  
    } else {
      const ids = rearangeArr(sprint.tasks, source.index, destination.index).map(task => task._id);
      
      dispatch(setSprint({
        ...sprint,
        tasks: rearangeArr(sprint.tasks, source.index, destination.index)
      }));

      await dispatch(updateProjectSprint(sprint._id, {
        tasks: ids
      }));
    }

  };

  return (
    <Box width={'100%'}>
      <DragDropContext onDragEnd={(e) => {
        onDragEnd(e),
        dispatch(setDragging(false));
      }} 
      onDragStart={() => dispatch(setDragging(true))}
      >
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
                                <span >
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
             
                                <Typography fontSize={12} color='#656f7d'>{sprint.tasks.length}</Typography>
                   
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
                                    toggleDrawer(); 
                                    dispatch(setTask({status}));
                                  }}
                                >
                                  <Add fontSize='12px' /> Add Task
                                </Typography>
                              </Box>
                            </AccordionSummary>
                         
                            <AccordionDetails sx={{mt:-3}}>
                              <TaskTable status={status}  />
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


      
    </Box>
  );
}
