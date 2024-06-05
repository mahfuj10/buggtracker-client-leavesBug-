import { Add } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { setTask, updateProjectSprint } from '../../../reducers/project/projectSlice';
import BoardTaskList from './BoardTaskList';
import { updateTask } from '../../../reducers/task/taskSlice';

export default function BoardTaskContainer({ 
  sprint,
  toggleUpdateTaskDrawer = () => {}, 
  toggleAddTaskDrawer = () => {},
  updateSprint = () => {}
}) {

  // const [sprint, setSprint] = useState(initialSprint);

  const dispatch = useDispatch();

  const getTasksByStatus = (status) => {
    return sprint.tasks.filter(task => task.status.name === status.name);
  };

  function capitalizeFirstLetter(str) {
    return str.split(' ').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  const moveTask = async(position, selectedTask) => {
    const taskIndex = sprint.tasks.findIndex(task => task._id === selectedTask._id);
    const status = sprint.status;
    const currentStatusIndex = status.findIndex(s => s._id === selectedTask.status._id);

    if (position === 'next' || position === 'prev') {
      let newStatusIndex;
      if (position === 'next') {
        newStatusIndex = currentStatusIndex === (status.length - 1) ? 0 : currentStatusIndex + 1;
      } else if (position === 'prev') {
        newStatusIndex = currentStatusIndex === 0 ? status.length - 1 : currentStatusIndex - 1;
      }

      const updatedTasks = sprint.tasks.map((task, index) => {
        if (index === taskIndex) {
          return { ...task, status: status[newStatusIndex] };
        }
        return task;
      });
      
      updateSprint({
        ...sprint,
        tasks: updatedTasks
      });
      
      await dispatch(updateTask(sprint.tasks[taskIndex]._id, { status: status[newStatusIndex] }));
    } 

    const tasks = getTasksByStatus(selectedTask.status);
    const index = tasks.findIndex(task => task._id === selectedTask._id);

    if (position === 'up' && index > 0) {
      const allTasks = [...sprint.tasks];
      const taskIndexInAllTasks = allTasks.findIndex(task => task._id === selectedTask._id);
  
      const taskToSwap = tasks[index - 1];
      const swapIndexInAllTasks = allTasks.findIndex(task => task._id === taskToSwap._id);

      [allTasks[taskIndexInAllTasks], allTasks[swapIndexInAllTasks]] = [allTasks[swapIndexInAllTasks], allTasks[taskIndexInAllTasks]];

      updateSprint({
        ...sprint,
        tasks: allTasks
      });

      await dispatch(updateProjectSprint(sprint._id, {
        tasks: allTasks.map(task => task._id)
      }));
    }

    if (position === 'down' && index < tasks.length - 1) {
      const allTasks = [...sprint.tasks];
      const taskIndexInAllTasks = allTasks.findIndex(task => task._id === selectedTask._id);
  
      const taskToSwap = tasks[index + 1];
      const swapIndexInAllTasks = allTasks.findIndex(task => task._id === taskToSwap._id);
  
      [allTasks[taskIndexInAllTasks], allTasks[swapIndexInAllTasks]] = [allTasks[swapIndexInAllTasks], allTasks[taskIndexInAllTasks]];
  
      updateSprint({
        ...sprint,
        tasks: allTasks
      });

      await dispatch(updateProjectSprint(sprint._id, {
        tasks: allTasks.map(task => task._id)
      }));
    }

    // console.log(sprint.tasks);
    // await dispatch(updateProjectSprint(sprint._id, {
    //   tasks: sprint.tasks.map(task => task._id)
    // }));
  };

  return (
    <Box 
      width={window.innerWidth - 260} 
      height={window.innerHeight - 170} 
      m={2}
      columnGap={5} 
      display={'flex'}  
      overflow={'auto'}
    >
      {
        (sprint && sprint.status).map((status, index) => (
          <Box key={status._id}>
            <>
              <Box 
                key={`${status.name}_${index}`} 
                minWidth={240}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'space-between'}
                pb={2}
                borderBottom={'2px solid black'}
              >
                <Box>
                  <Typography 
                    variant='h6'
                    fontWeight={'bold'}
                    title={status.name}
                    className='text-break'
                  >
                    {capitalizeFirstLetter(status.name)}
                  </Typography>

                  <Typography variant='body2' color={'grey'}>
                    {getTasksByStatus(status).length} tasks available
                  </Typography>

                </Box>
            
                <IconButton 
                  size='small'
                  sx={{ border: '1px solid #767676' }}
                  onClick={() => {
                    toggleAddTaskDrawer(),
                    dispatch(setTask({ status }));
                  }}
                >
                  <Add />
                </IconButton>
              </Box>
              
              <BoardTaskList 
                toggleUpdateDrawer={toggleUpdateTaskDrawer}
                tasks={getTasksByStatus(status)} 
                moveTask={moveTask}
              />
            </>
          </Box>
        ))
      }
      
    </Box>
  );
}
