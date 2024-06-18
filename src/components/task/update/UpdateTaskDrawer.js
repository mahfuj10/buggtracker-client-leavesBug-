import { Adjust, AdminPanelSettings, CalendarMonth, Category, CheckRounded, Close, Description, Flag, NavigateNext, WatchLaterOutlined } from '@mui/icons-material';
import { Avatar, Box, Chip, Drawer, IconButton, InputBase, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTask, setTask } from '../../../reducers/project/projectSlice';
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
import { updateTask } from '../../../reducers/task/taskSlice';
import socket from '../../../utils/socket';
import { TASK_UPDATED, TASK_UPDATING_BY } from '../../../utils/socket-events';
import { selectUser } from '../../../reducers/auth/authSlice';
import moment from 'moment';
import TaskComments from '../TaskComments/TaskComments';

export default function UpdateTaskDrawer({ open, toggleDrawer = () => {}, sprint = {} }) {

  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const task = useSelector(selectTask);
  const currentLoginUser = useSelector(selectUser);
  const dispatch = useDispatch();

  const { formatDate, displayDueDate } = useUtils();

  const toggleDatePicker = () => {
    setOpenDatePicker(!openDatePicker);
  };

  const addTag = (event) => {
    if(task.tags.includes(tagInput)) return;

    if (event.key === 'Enter' && tagInput.trim() !== '') {
      dispatch(setTask({
        ...task,
        tags: [...task.tags, tagInput]
      }));
      setTagInput('');
    }

    handleUpdateTask({ tags: [...task.tags, tagInput] });
  };

  const removeTag = (tagToRemove) => {
    const reminginTags = task.tags.filter(tag => tag !== tagToRemove);

    dispatch(setTask({
      ...task,
      tags: reminginTags
    }));

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

  const updateAssigns = (_, assigns) => {
    handleUpdateTask({ assigns });
  };

  const updateStatus = (task, status) => {
    dispatch(setTask({
      ...task,
      status
    }));
    handleUpdateTask({ status });
  };


  const updatePriority = (task, priority) => {
    dispatch(setTask({
      ...task,
      priority
    }));

    handleUpdateTask({ priority });
  };

  const saveDueDate = (date) => {
    dispatch(setTask({
      ...task,
      due_date: date
    }));
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
      dispatch(setTask({
        ...task,
        status: status[0]
      }));

      handleUpdateTask({ status: status[0] });
    }else {
      dispatch(setTask({
        ...task,
        status: status[currentStatusIndex + 1]
      }));

      handleUpdateTask({ status: status[currentStatusIndex + 1] });
    }
  };

  const updateTaskType = taskType => {
    const task_type = task.task_type === taskType ? '' : taskType;

    dispatch(setTask({
      ...task,
      task_type: task.task_type === taskType ? '' : taskType
    }));

    handleUpdateTask({ task_type });
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

        <Box>

          <IconButton sx={{ ml: -3 }}  onClick={toggleDrawer}>
            <Close />
          </IconButton>
      
          <br />

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
                  sprint.task_types.map(item => <Chip
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
          <TaskComments />
        </Box>

      </Box>

    </Drawer>
  );
}
