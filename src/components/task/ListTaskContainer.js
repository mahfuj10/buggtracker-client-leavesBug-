import { Add } from '@mui/icons-material';
import { Box, Button, IconButton, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import {  useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import TaskTable from './TaskTable';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import {  selectProject, selectSprint, setDragging, setProject, setSprint, setTask, updateProjectSprint } from '../../reducers/project/projectSlice';
import socket from '../../utils/socket';
import {  Adjust, ExpandMore, MoreHoriz } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { updateTask } from '../../reducers/task/taskSlice';
import { NEW_TASK } from '../../utils/socket-events';


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

  const dispatch = useDispatch();
  const { id } = useParams();

  const currentSprint = useSelector(selectSprint);
  const currentProject = useSelector(selectProject);
  
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
        ...currentSprint,
        status: rearangeArr(currentSprint.status, source.index, destination.index)
      }));
      
      await dispatch(updateProjectSprint(currentSprint._id, {
        status:  rearangeArr(currentSprint.status, source.index, destination.index)
      }));
      
    } else if (destination.droppableId !== source.droppableId) {
      const taskIndex = currentSprint.tasks.findIndex(task => task._id === result.draggableId);
      const status = currentSprint.status.find(status => status._id === result.destination.droppableId);

      if (taskIndex !== -1 && status) {
        const task = currentSprint.tasks[taskIndex];
        const updated_task = await dispatch(updateTask(task._id, {...task, status}));

        const updatedTasks = [...currentSprint.tasks];
        updatedTasks[taskIndex] = updated_task;

        dispatch(setSprint({
          ...currentSprint,
          tasks: updatedTasks,
        }));

        await dispatch(updateProjectSprint(currentSprint._id, {
          tasks: updatedTasks.map(task => task._id)
        }));
      }
  
    } else {
      const ids = rearangeArr(currentSprint.tasks, source.index, destination.index).map(task => task._id);
      
      dispatch(setSprint({
        ...currentSprint,
        tasks: rearangeArr(currentSprint.tasks, source.index, destination.index)
      }));

      await dispatch(updateProjectSprint(currentSprint._id, {
        tasks: ids
      }));
    }

  };


  useEffect(() => {
    socket.on(NEW_TASK, async({ task, projectId, sprintId }) => {
      if(id === projectId){
        const sprintIndex = currentProject.sprints.findIndex(sprint => sprint._id === sprintId);

        if (sprintIndex !== -1) {
          const updatedSprints = [...currentProject.sprints];
          updatedSprints[sprintIndex] = {
            ...updatedSprints[sprintIndex],
            tasks: [...updatedSprints[sprintIndex].tasks, task]
          };
          const sprint = updatedSprints.find(sprint => sprint._id === sprintId);

          dispatch(setProject({ ...currentProject, sprints: updatedSprints }));
          
          if(sprint._id === sprintId){
            dispatch(setSprint(sprint));
          }
        }
      }
    });

    return () => {
      socket.off(NEW_TASK);
    };
  },[socket]);


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
              {((currentSprint && currentSprint.status) || []).map((status, index) => (
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
             
                                <Typography fontSize={12} color='#656f7d'>{currentSprint.tasks.length}</Typography>
                   
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
