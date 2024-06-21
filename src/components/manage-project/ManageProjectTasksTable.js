import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box,  Button, Checkbox, Chip,IconButton, InputBase, Paper, Typography, Pagination } from '@mui/material';
import { useUtils } from '../../utils/useUtils';
import { NEW_TASK, TASK_DELETED, TASK_UPDATED } from '../../utils/socket-events';
import { Add, CalendarMonth, DeleteOutline } from '@mui/icons-material';
import AlertDialog from '../common/AlertDialog';
import socket from '../../utils/socket';
import { useDispatch } from 'react-redux';
import { deleteTasks, updateTask } from '../../reducers/task/taskSlice';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import AddTaskDrawer from '../task/AddTaskDrawer';
import UpdateTaskPriority from './UpdateTaskPriority';
import UpdateTaskAssigns from './UpdateTaskAssigns';
import UpdateTaskStatus from './UpdateTaskStatus';
import { getProjectById } from '../../reducers/project/projectSlice';

const cells = [
  'Task title',
  'Assignes',
  'Due date',
  'Status',
  'Priority'
];
  
export default function ManageProjectTasksTable({ project, sprint, updateSprint = () => {} }) {

  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openStates, setOpenStates] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  
  const { displayDueDate, formatDate } = useUtils();
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on(NEW_TASK, async({ projectId, sprintId }) => {
      if (project._id === projectId){
        const updated_project = await dispatch(getProjectById(projectId));
        const sprintIndex = updated_project.sprints.findIndex(s => s._id === sprintId);

        project.sprints = updated_project.sprints;
        updateSprint(updated_project.sprints[sprintIndex]);
      }
    });

    socket.on(TASK_UPDATED, async({ task, sprintId }) => {
      const sprintIndex = (project.sprints || []).findIndex(s => s._id === sprintId);

      if (sprintIndex !== -1) {
        const updatedSprints = [...project.sprints];
        const taskIndex = updatedSprints[sprintIndex].tasks.findIndex(({_id}) => _id === task._id);

        updatedSprints[sprintIndex].tasks[taskIndex] = task;
        project.sprints =  updatedSprints;

        updateSprint({...sprint, tasks: [...updatedSprints[sprintIndex].tasks]});
      }
    });

    return () => {
      socket.off(NEW_TASK);
      socket.off(TASK_UPDATED);
    };

  }, [socket]);

  const selectAll = () => {
    const ids = sprint.tasks.map(task => task._id);
    setSelectedTaskIds(ids);
  };

  const handleSelectTask = (checked, taskId) => {
    if(!selectedTaskIds.includes(taskId)){
      setSelectedTaskIds(prev => [...prev, taskId]);
    }
    if(selectedTaskIds.includes(taskId)){
      setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId));
    }
  };
 
  const toggleDialog = () => {
    setOpenDialog(!openDialog);
  };
 
  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };
  
  const toggleOpen = (taskId, isOpen) => {
    setOpenStates(prevOpenStates => ({
      ...prevOpenStates,
      [taskId]: isOpen,
    }));
  };

  const handleDeleteTasks = async() => {
    try{
      if(selectedTaskIds.length === 0) return ;

      setIsLoading(true);

      toggleDialog();

      await dispatch(deleteTasks(selectedTaskIds));

      const remainingTasks = sprint.tasks.filter(task => !selectedTaskIds.includes(task._id));
      
      sprint.tasks = remainingTasks;

      if(currentPage > 1 && getTasksByPage().length === 0){
        setCurrentPage(currentPage - 1);
      }


      socket.emit(TASK_DELETED, {
        projectId: project._id,
        sprintId: sprint._id,
        taskIds: selectedTaskIds
      });

    }catch(err){
      console.log(err);
    }
    setIsLoading(false);
  };

  const handleUpdateTask = async(taskId, doc) => {
    try{
      if(!taskId) return;

      await dispatch(updateTask(taskId, doc));

    }catch(err){
      console.error(err);
    }
  };

  const saveDueDate = (taskId, date) => {
    const index = sprint.tasks.findIndex(task => task._id === taskId);

    if(index !== -1){
      sprint.tasks[index].due_date =  date;
    }
      
    handleUpdateTask(taskId, { due_date: date });
  };

  const updatePriority = (task, priority) => {
    const index = sprint.tasks.findIndex(task => task._id === task._id);

    if(index !== -1){
      sprint.tasks[index] = {...sprint.tasks[index], priority };
    }

    handleUpdateTask(task._id, { priority });
  };

  const handleChangeTitle = (taskId, updateTitle) => {
    const tasks  = sprint.tasks.map(task =>
      task._id === taskId ? { ...task, title: updateTitle } : task
    );
    
    updateSprint({...sprint, tasks });
    
    const delayDebounceFn = setTimeout(() => {
      if(!updateTitle) return;

      handleUpdateTask(taskId, { title: updateTitle });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  };

  const updateAssigns = (task, assigns) => {
    handleUpdateTask(task._id, { assigns });
  };

  const updateStatus = (task, status) => {
    handleUpdateTask(task._id, { status });
  };

  const getTotalPages = () => {
    return Math.ceil((sprint.tasks || []).length / itemsPerPage);
  };

  const handlePageChange = (_, page) => {
    setCurrentPage(page);
  };

  const getTasksByPage = () => {
    return (sprint.tasks || []).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  };

  return (
    <>
      <TableContainer component={Paper}>

        <Box pt={1} px={1} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
          <Typography variant='body2'>Task assoicate with <b>{ sprint.name}</b></Typography>

          <Box>
            <Button 
              sx={{ opacity: selectedTaskIds.length ? 1 : 0, mr: 1 }} 
              variant='outlined' 
              color='error' 
              size='small' 
              startIcon={<DeleteOutline />}
              disabled={isLoading}
              onClick={toggleDialog}
            >
              Delete
            </Button>

            <Button 
              variant='outlined' 
              color='success' 
              size='small' 
              startIcon={<Add />}
              onClick={toggleDrawer}
            >
              Add Task
            </Button>
          </Box>
        </Box>

        <Table sx={{ minWidth: 950 }}>
          <TableHead>
            <TableRow>
          
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  onClick={e => {
                    e.target.checked 
                      ?
                      selectAll()
                      :
                      setSelectedTaskIds([]);
                  }}
                />
              </TableCell>

              {
                cells.map((cell, i) => <TableCell key={`${cell}-${i}`}>
                  {cell}
                </TableCell>)
              }
            </TableRow>
          </TableHead>


          <TableBody>

            {
              getTasksByPage().length === 0 && 
            <TableRow>
              <TableCell component="th" scope="row" colSpan={12}>
                <Typography> No any tasks. </Typography>
              </TableCell>
            </TableRow>
            }

            { 
              getTasksByPage().map((task,i) => task._id && <TableRow key={`${task._id}-${i}`}>
                <TableCell  component="th" scope="row">
                  <Checkbox
                    checked={selectedTaskIds.includes(task._id)}
                    onChange={(e) => handleSelectTask(e.target.checked, task._id)}
                    color="primary"
                  />
                </TableCell>
              
                <TableCell  component="th" scope="row">
                  <InputBase
                    value={task.title} 
                    onChange={e => handleChangeTitle(task._id, e.target.value)}
                    size='small' 
                  />
                </TableCell>
              
                <TableCell  component="th" scope="row">
                  <UpdateTaskAssigns 
                    task={task}
                    updateAssigns={updateAssigns}
                  />
                </TableCell>

                <TableCell  component="th" scope="row" sx={{position:'relative'}}>
                  {
                    task.due_date ?
                      <Chip
                        label={`${displayDueDate(task.due_date)}`}
                        size='small'
                        clickable
                        variant='outlined'
                        onClick={() => toggleOpen(task._id, true)}
                      />
                      :
                      <IconButton onClick={() => toggleOpen(task._id, true)}> 
                        <CalendarMonth />
                      </IconButton>
                  }

                  <LocalizationProvider key={task._id} dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      open={openStates[task._id] || false}
                      onOpen={() => toggleOpen(task._id, true)}
                      onClose={() => toggleOpen(task._id, false)}
                      defaultValue={dayjs(task.due_date)}
                      onChange={(e) => saveDueDate(task._id, formatDate(e.$d))}
                      sx={{ position: 'absolute', left: 0, zIndex: -1 }}
                    />
                  </LocalizationProvider>
                </TableCell>

                <TableCell  component="th" scope="row">
                  <UpdateTaskStatus 
                    status={sprint.status}
                    task={task} 
                    updateStatus={updateStatus}
                  />
                </TableCell>

                <TableCell>
                  <UpdateTaskPriority 
                    priorities={sprint.priorities} 
                    task={task}
                    updatePriority={updatePriority}
                  />
                </TableCell>

              </TableRow>)
            }

          </TableBody>
          
        </Table>

        <Box m={1} display={'flex'} justifyContent={'end'}>
          <Pagination 
            count={getTotalPages()} 
            variant="outlined"
            color="secondary" 
            onChange={handlePageChange}
          />
        </Box>

      </TableContainer>


      {/* confirmation alert to delete sprint */}
      <AlertDialog
        open={openDialog}
        title={'Are you sure you?'}
        toggleDialog={toggleDialog}
        toggleConfirm={handleDeleteTasks}
      />

      {/* add task drawer */}
      <AddTaskDrawer
        open={openDrawer}
        toggleDrawer={toggleDrawer}
        project={project}
        sprint={sprint}
      />
    </>
  );
}
