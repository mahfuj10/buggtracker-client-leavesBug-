import { Box, Button, Chip, Drawer, IconButton,  TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import QuillEditor from '../quill/QuillEditor';
import { useDispatch, useSelector } from 'react-redux';
import { addTaskIntoSprint, getProjectById, selectTask } from '../../reducers/project/projectSlice';
import { selectUser } from '../../reducers/auth/authSlice';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import TaskAssignDropdown from './TaskAssignDropdown';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useUtils } from '../../utils/useUtils';
import { Adjust, CalendarMonth, Close, Flag } from '@mui/icons-material';
import { createTask } from '../../reducers/task/taskSlice';
import CategoryIcon from '@mui/icons-material/Category';
import { selectTeam } from '../../reducers/team/teamSlice';
import socket from '../../utils/socket';
import { NEW_TASK } from '../../utils/socket-events';
import dayjs from 'dayjs';
import { sendNotification } from '../Notification/Notification';
import { CREATE_TASK_IMAGE } from '../../utils/notification-images';
import { PROJECT } from '../../utils/path';

const priorityList = [
  {name: 'low', color: 'silver'},
  {name: 'medium', color: ''},
  {name: 'high', color: '#FFD700'},
  {name: 'urgent', color: '#8B0000'}
];
const taskType = ['bug', 'feature', 'enhancement'];

export default function AddTaskDrawer({ open, sprint, project, toggleDrawer = () => {}, dueDate: initialDueDate = null }) {
 
  const dispatch = useDispatch();
  
  const task = useSelector(selectTask);
  const currentLoginUser = useSelector(selectUser);
  const currentTeam = useSelector(selectTeam);
  
  const { formatDate, displayDueDate } = useUtils();

  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState({});
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState({});
  const [assigns, setAssigns] = useState([]);
  const [dueDate, setDueDate] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  useEffect(() => {
    if(task && task.status && task.status.name){
      setStatus(task.status);
    }else if(sprint && sprint.status && sprint.status.length) {
      setStatus(sprint.status[0]);
    }
  }, [task]);

  useEffect(() => {
    setDueDate(initialDueDate);
  },[initialDueDate]);

  const updateDescription = (e) => {
    setDescription(e);
  };
  
  const handleTagInputChange = (event) => {
    setTagInput(event.target.value);
  };

  const handleKeyDown = (event) => {
    if(tags.includes(tagInput)) return;
    if (event.key === 'Enter' && tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const toggleDatePicker = () => {
    setOpenDatePicker(!openDatePicker);
  };

  const handleCreateTask = async() => {
    try {
      if(!title.trim()) return;

      setIsLoading(true);

      const taskData = {
        priority,
        title,
        status,
        description,
        assigns,
        tags,
        due_date: dueDate,
        task_type: type,
        createor: currentLoginUser._id,
        team_id: currentTeam._id
      };

      const created_task = await dispatch(createTask(taskData));

      const sprintIndex = project.sprints?.findIndex(s => s._id === sprint._id);
    
      await dispatch(addTaskIntoSprint(project._id, created_task._id, sprintIndex));

      await dispatch(getProjectById(project._id));
      
      socket.emit(NEW_TASK, { sprintId: sprint._id, task: created_task, projectId: project._id });

      sendNotification(dispatch, 
        currentTeam._id, 
        currentTeam.members.map(member => member._id),
        [currentLoginUser._id],
        CREATE_TASK_IMAGE,
        `New task in ${project.project_name}`,
        `${PROJECT}/${project._id}`
      );

      handleToggleDrawer();
    }catch(err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  // const sendNotification = async(imageURL, content) => {
  //   try{
  //     const notificationDoc = {
  //       teamId: currentTeam._id,
  //       imageURL: 'https://tse2.mm.bing.net/th?id=OIG1.Ndwd8KSpc0gk8h4hSr5g&pid=ImgGn',
  //       content: `New task created in ${project.project_name}`,
  //       visibleTo: currentTeam.members.map(member => member._id),
  //       readBy: [currentLoginUser._id], 
  //       createdAt: Date.now()
  //     };

  //     await dispatch(saveNotification(notificationDoc));

  //     socket.emit(SEND_NOTIFICATION, notificationDoc);
  //   }catch(err){
  //     console.error(err);
  //   }
  // };

  const handleToggleDrawer = () => {
    toggleDrawer();
    resetState();
  };

  const resetState = () => {
    setDescription('');
    setPriority({});
    setTitle('');
    setStatus({});
    setType('');
    setAssigns([]);
    setDueDate(null);
    setTags([]);
    setTagInput('');
  };

  return (
    <Drawer anchor="right" open={open} onClose={() => handleToggleDrawer()}>

      <Box sx={{
        p:2,
        width: {
          xs: '100%',
          sm: 320,   
          md: 400,   
          lg: 500,   
          xl: 600    
        }
      }}>
        <Box sx={{ float:'right'}} mt={-2}>
          <IconButton onClick={handleToggleDrawer}>
            <Close />
          </IconButton>
        </Box>

        <Box>
          <Typography display='block' fontSize={15} mb={1} variant='body' color='#656f7d'> 
              Title *
          </Typography>

          <TextField 
            onChange={e => setTitle(e.target.value)}
            fullWidth 
            size='small'
            variant="outlined"
          />
        </Box>

        <Box my={2}>
          <Typography fontSize={15} display='block' mb={1} variant='body' color='#656f7d'> 
              Status
          </Typography>

          <Box display='flex' flexWrap='wrap' gap={1}>
            {
              ((sprint && sprint.status) || []).map(item => <Chip
                key={item.name}
                label={item.name}
                sx={{ borderColor: item.color, px: 1 }}
                variant="outlined" 
                icon={status.name === item.name ? <CheckRoundedIcon color='success' /> : <Adjust color='primary' sx={{ color: status.color}} />}
                onClick={() => setStatus(status.name === item.name ? {} : item)}
              />)
            }
          </Box>
        </Box>

        <Box>
          <Typography fontSize={15} display='block' mb={1} variant='body' color='#656f7d'> 
              Priority
          </Typography>

          <Box display='flex' flexWrap='wrap' gap={1}>
            {
              priorityList.map(item => <Chip
                key={item.name}
                label={item.name}
                sx={{  px: 1 }}
                variant="outlined" 
                icon={item.name === priority.name ?  <CheckRoundedIcon color='success' /> : <Flag color='primary' sx={{ color: item.color}} />}
                onClick={() => setPriority(item.name === priority.name ? {} : item)}
              />)
            }
          </Box>
        </Box>

        <Box my={2} >
          <Typography fontSize={15} display='block' mb={1} variant='body' color='#656f7d'> 
              Task type
          </Typography>

          <Box display='flex' flexWrap='wrap' gap={1}>
            {
              taskType.map(item => <Chip
                key={item}
                label={item}
                sx={{  px: 1 }}
                variant="outlined" 
                icon={item === type ? <CheckRoundedIcon color='success' /> : <CategoryIcon />}
                onClick={() => setType(item === type ? '' : item)}
              />)
            }
          </Box>
        </Box>


        <Box display='flex' justifyContent='space-between'>

          <Box>
            <Typography fontSize={15}  variant='body' color='#656f7d'> 
              Assignees
            </Typography>

            <TaskAssignDropdown
              setAssigns={setAssigns}
              assigns={assigns}
            />
          </Box>

          <Box position={'relative'}>
            <Typography mb={0.5} display='block' color='#565656' variant='body'>
               Due date
            </Typography>

            {
              dueDate ?
                <Chip
                  label={displayDueDate(dueDate)}
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
                defaultValue={dayjs(dueDate)}
                onChange={(e) => setDueDate(formatDate(e.$d))}
                sx={{ position: 'absolute', opacity: 0,  left: 0, zIndex: -1 }}
              />
            </LocalizationProvider>
          </Box>
        </Box>

        <Box my={2}>

          <Typography fontSize={15} display='block' mb={1} variant='body' color='#656f7d'> 
              Tags
          </Typography>

          <Box display='flex' alignItems={'center'} columnGap={1}>
            {tags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                style={{ marginRight: 5 }}
              />
            ))}
            <TextField
              label="Add Tag"
              variant="outlined"
              size="small"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleKeyDown}
              sx={{ display: 'block', mt: 1 }}
            />
          </Box>
        </Box>
            
        <Box sx={{
          height: {
            xs: '150px',
            xl:'220px'
          }
        }}>
          <Typography fontSize={15} display='block' mb={1} variant='body' color='#656f7d'> 
              Description
          </Typography>

          <QuillEditor
            value={description}
            onChange={updateDescription}
          />
        </Box>


        <br />
        <br />
        <br />
        <br />
        <br />
        
        <Button 
          sx={{ mt: 1, float:'right', boxShadow: 0}}
          variant='contained'
          disabled={isLoading}
          onClick={handleCreateTask}
        >
          Create
        </Button>

      </Box>
    </Drawer>
  );
}
