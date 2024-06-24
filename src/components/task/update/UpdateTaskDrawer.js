import { Adjust, AdminPanelSettings, CalendarMonth, Category, CheckRounded, Close, Delete, Description, Flag, NavigateNext, WatchLaterOutlined } from '@mui/icons-material';
import { Avatar, Box, Chip, CircularProgress, Drawer, IconButton, InputBase, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTask } from '../../../reducers/project/projectSlice';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import UpdateTaskAssigns from '../../manage-project/UpdateTaskAssigns';
import UpdateTaskStatus from '../../manage-project/UpdateTaskStatus';
import UpdateTaskPriority from '../../manage-project/UpdateTaskPriority';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useUtils } from '../../../utils/useUtils';
import { useDispatch } from 'react-redux';
import QuillEditor from '../../quill/QuillEditor';
import { deleteTasks, getTaskById, updateTask } from '../../../reducers/task/taskSlice';
import socket from '../../../utils/socket';
import { TASK_DELETED, TASK_UPDATED, TASK_UPDATING_BY } from '../../../utils/socket-events';
import { selectUser } from '../../../reducers/auth/authSlice';
import moment from 'moment';
import TaskComments from '../TaskComments/TaskComments';
import AlertDialog from '../../common/AlertDialog';
import { selectTeam } from '../../../reducers/team/teamSlice';

export default function UpdateTaskDrawer({ open, toggleDrawer = () => {}, sprint = {} }) {

  const [task, setTask] = useState({});
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const taskId = useSelector(selectTask)._id;
  const currentLoginUser = useSelector(selectUser);
  const currentTeam = useSelector(selectTeam);

  const dispatch = useDispatch();

  const { formatDate, displayDueDate } = useUtils();

  const fetchTask = async() => {
    try{
      if(!taskId) return;
      
      setIsLoading(true);

      const response = await dispatch(getTaskById(taskId));

      setTask(response);
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTask();
  },[dispatch, taskId]);

  const toggleDatePicker = () => {
    setOpenDatePicker(!openDatePicker);
  };

  const addTag = (event) => {
    if(task.tags.includes(tagInput)) return;

    if (event.key === 'Enter' && tagInput.trim() !== '') {
      setTask({
        ...task,
        tags: [...task.tags, tagInput]
      });
      setTagInput('');
    }

    handleUpdateTask({ tags: [...task.tags, tagInput] });
  };

  const removeTag = (tagToRemove) => {
    const reminginTags = task.tags.filter(tag => tag !== tagToRemove);

    setTask({
      ...task,
      tags: reminginTags
    });

    handleUpdateTask({ tags: reminginTags });
  };

  const handleUpdateTask = async(doc) => {
    try{
      if(!task._id) return;

      const updated_task = await dispatch(updateTask(task._id, doc));

      socket.emit(TASK_UPDATED, {
        sprintId: sprint._id,
        task: updated_task
      });
    }catch(err){
      console.error(err);
    }
  };

  const updateAssigns = (_, assignIds) => {
    const assigns = [];
    
    for(const id of assignIds){
      const member = currentTeam.members.find(member => member._id === id);
      assigns.push(member);
    }
    
    setTask({
      ...task,
      assigns
    });

    handleUpdateTask({ assigns: assignIds });
  };

  const updateStatus = (task, status) => {
    setTask({
      ...task,
      status
    });
    handleUpdateTask({ status });
  };

  const updatePriority = (task, priority) => {
    setTask({
      ...task,
      priority
    });

    handleUpdateTask({ priority });
  };

  const saveDueDate = (date) => {
    setTask({
      ...task,
      due_date: date
    });
    handleUpdateTask({ due_date: date });
  };

  const updateDescription = updatedDesc => {
    const delayDebounceFn = setTimeout(async() => {
      if(!updatedDesc) return;

      await dispatch(updateTask(task._id, { description: updatedDesc }));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  };

  const handleChangeTitle = (updateTitle) => {
    const delayDebounceFn = setTimeout(() => {
      if(!updateTitle) return;

      handleUpdateTask({ title: updateTitle });
    }, 500);

    socket.emit(TASK_UPDATING_BY, currentLoginUser);

    return () => clearTimeout(delayDebounceFn);
  };

  const nextStatus = () => {
    const status = sprint.status;
    const statusLength = status.length;
    const currentStatusIndex = status.findIndex(s => s._id === task.status._id);

    if(currentStatusIndex === statusLength - 1){
      setTask({
        ...task,
        status: status[0]
      });

      handleUpdateTask({ status: status[0] });
    }else {
      setTask({
        ...task,
        status: status[currentStatusIndex + 1]
      });

      handleUpdateTask({ status: status[currentStatusIndex + 1] });
    }
  };

  const updateTaskType = taskType => {
    const task_type = task.task_type === taskType ? '' : taskType;

    setTask({
      ...task,
      task_type: task.task_type === taskType ? '' : taskType
    });

    handleUpdateTask({ task_type });
  };

  const handleDeleteTask = async() => {
    try{
      if(!sprint._id) return alert('Sprint not found. Reload or contact with us.');

      setIsLoading(true);

      const sprintId = sprint._id;
      const taskIds = [task._id];
      const projectId = getProjectIdBySprintId(sprintId);

      await dispatch(deleteTasks(taskIds));

      socket.emit(TASK_DELETED, {
        projectId,
        sprintId,
        taskIds
      });

      toggleDrawer();
      setOpenDialog(false);
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };

  const toggleDialog = () => {
    setOpenDialog(!openDialog);
  };

  const getProjectIdBySprintId = sprintId => {
    for(const project of currentTeam.projects){
      for(sprint of project.sprints){
        if(sprint._id === sprintId){
          return project._id;
        }
      }
    }
    return null;
  };

  return (
    <Drawer anchor="right" open={open} onClose={() => toggleDrawer()}>

      <Box display={'flex'} px={3} py={1} sx={{
        width: {
          xs: '100%',
          sm: 320,   
          md: 400,   
          lg: 700,   
          xl: 400    
        }
      }}>


        { isLoading &&
          <Box 
            width={'100%'} 
            height={'100vh'} 
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <CircularProgress  color="secondary" />
          </Box>
        }

        { !isLoading &&
          <>

            <Box>

              <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
                <IconButton size='small' onClick={toggleDrawer} sx={{ ml: -3 }}>
                  <Close />
                </IconButton>

                <IconButton size='small' onClick={toggleDialog}>
                  <Delete />
                </IconButton>
              </Box>

              <InputBase
                defaultValue={task.title}
                onChange={e => handleChangeTitle(e.target.value)}
                sx={{ fontWeight:'bold', fontSize: 23, mb: 2}}
                fullWidth
              />

              <Box display={'flex'} flexDirection={'column'} rowGap={2}>

                <Box display={'flex'} columnGap={10}>
                  <Typography 
                    variant='body'
                    color='#656f7d'
                    display='flex'
                    alignItems={'center'}
                    columnGap={0.5}
                  >
                    <Adjust sx={{ fontSize: 18 }} />
              Status
                  </Typography>

                  <Box display={'flex'} alignItems={'center'}>
                    <UpdateTaskStatus
                      status={sprint.status}
                      task={task} 
                      updateStatus={updateStatus}
                    />

                    <IconButton
                      size='small'
                      color='primary'
                      onClick={nextStatus}
                    >
                      <NavigateNext />
                    </IconButton>
            
                  </Box>
                </Box>

                <Box display={'flex'} columnGap={10}>
                  <Typography 
                    variant='body'
                    color='#656f7d'
                    display='flex'
                    alignItems={'center'}
                    columnGap={0.5}
                  >
                    <PersonOutlineIcon sx={{ fontSize: 18 }} />
            Assignees
                  </Typography>

                  <UpdateTaskAssigns 
                    task={task}
                    updateAssigns={updateAssigns}
                  />
                </Box>
        
                <Box display={'flex'} columnGap={10}>
                  <Typography 
                    variant='body'
                    color='#656f7d'
                    display='flex'
                    alignItems={'center'}
                    columnGap={0.5}
                  >
                    <Flag sx={{ fontSize: 18 }} />
            Priority
                  </Typography>

                  <UpdateTaskPriority 
                    task={task}
                    priorities={sprint.priorities}
                    updatePriority={updatePriority}
                  />
                </Box>

                <Box display={'flex'} columnGap={10}>
                  <Typography 
                    variant='body'
                    color='#656f7d'
                    display='flex'
                    alignItems={'center'}
                    columnGap={0.5}
                  >
                    <WatchLaterOutlined sx={{ fontSize: 18 }} />
              Due date
                  </Typography>

                  {
                    task.due_date ?
                      <Chip
                        label={displayDueDate(task.due_date)}
                        size='small'
                        clickable
                        variant='outlined'
                        onClick={toggleDatePicker}
                      />
                      :
                      <IconButton onClick={toggleDatePicker}> 
                        <CalendarMonth />
                      </IconButton>
                  }

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      open={openDatePicker}
                      onOpen={toggleDatePicker}
                      onClose={toggleDatePicker}
                      defaultValue={dayjs(task.due_date)}
                      minDate={dayjs(task.createdAt)}
                      onChange={(e) => saveDueDate(formatDate(e.$d))}
                      sx={{ position: 'absolute', opacity: 0,  left: 0, zIndex: -1 }}
                    />
                  </LocalizationProvider>
                </Box>

                {task.createor &&  <Box display={'flex'} columnGap={10}>
                  <Typography 
                    variant='body'
                    color='#656f7d'
                    display='flex'
                    alignItems={'center'}
                    columnGap={0.5}
                  >
                    <AdminPanelSettings sx={{ fontSize: 18 }} />
              Created by
                  </Typography>

                  <Chip
                    size='small'
                    avatar={<Avatar alt={task.createor.name} src={task.createor.photoURL} />}
                    label={`${task.createor.name}, ${moment(task.createdAt).fromNow()}`}
                    variant="outlined"
                  />

                </Box>}

                <Box>
                  <Typography 
                    fontSize={15}
                    display='flex'
                    alignItems={'center'} 
                    columnGap={0.5}
                    mb={1.2}
                    variant='body'
                    color='#656f7d'
                  > 
                    <Category sx={{ fontSize: 17 }} /> Task type
                  </Typography>

                  <Box display='flex' flexWrap='wrap' gap={1}>
                    {
                      (sprint.task_types || []).map(item => <Chip
                        key={item}
                        label={item}
                        sx={{  px: 1 }}
                        variant="outlined" 
                        size='small'
                        onClick={() => updateTaskType(item.toLowerCase())}
                        icon={item.toLowerCase() === task.task_type 
                          ?
                          <CheckRounded color='success' /> 
                          :
                          <Category />
                        }
                      />)
                    }
                    {/* onClick={() => setType(item === type ? '' : item)} */}
                  </Box>
                </Box>

                <Box>

                  <Typography fontSize={15} display='block' mb={1.2} variant='body' color='#656f7d'> 
              Tags
                  </Typography>

                  <Box display='flex' flexWrap={'wrap'} alignItems={'center'} columnGap={1}>
                    {
                      (task.tags || []).map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size='small'
                          sx={{ px: 1 }}
                          onDelete={() => removeTag(tag)}
                        />
                      ))
                    }
             
                  </Box>

                  <TextField
                    label="Add Tag"
                    variant="outlined"
                    size="small"
                    value={tagInput}
                    onChange={event => setTagInput(event.target.value)}
                    onKeyDown={addTag}
                    sx={{ display: 'block', mt: 1 }}
                  />

                </Box>

                <Box sx={{
                  height: {
                    xs: '150px',
                    xl:'220px'
                  }
                }}>
                  <Typography  fontSize={15} display='flex' alignItems={'center'} columnGap={0.5} mb={1} variant='body' color='#656f7d'> 
                    <Description sx={{ fontSize: 17 }} /> Description
                  </Typography>

                  <Box className='quill-no-border'>
                    <QuillEditor
                      value={task.description}
                      onChange={updateDescription}
                    />
                  </Box>
                </Box>

              </Box>

            </Box>
        
            <Box minWidth={300} borderLeft={'1px solid #0000001f'}>
              <TaskComments task={task} />
            </Box>

          </>
        }

      </Box>

      {/* confirmation alert to delete task */}
      <AlertDialog
        open={openDialog}
        title={'Are you sure you?'}
        toggleDialog={toggleDialog}
        toggleConfirm={handleDeleteTask}
      />

    </Drawer>
  );
}
