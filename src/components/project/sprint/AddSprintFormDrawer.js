import { Box, Drawer, TextField, Typography, IconButton, Button, Chip, Divider } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import CloseIcon from '@mui/icons-material/Close';
import { Add, Close, Send } from '@mui/icons-material';
import React, { useState } from 'react';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useUtils } from '../../../utils/useUtils';
import { useDispatch } from 'react-redux';
import { addProjectSprint } from '../../../reducers/project/projectSlice';
import { PROJECT_UPDATED } from '../../../utils/socket-events';
import socket from '../../../utils/socket';
import dayjs from 'dayjs';

export default function AddSprintFormDrawer({ open, toggleDrawer = () => {}, project_start_date = undefined, project_id }) {

  const [sprint, setSprint] = useState({
    name: '',
    priorities: [
      { name: 'low', color: 'silver'},
      { name: 'medium', color: 'blue'},
      { name: 'high', color: 'gold'},
      { name: 'urgent', color: 'red'}
    ],
    status: [
      { name:'in progress', color: '#1E90FF'},
      { name: 'review', color: '#00FF00'},
      { name: 'todo', color: '#FFD700'},
      { name: 'done', color: '#808080'}
    ],
    task_types:['Bug','Feature','Enhancement'],
  });
  const [priority, setPriority] = useState({
    name: '',
    color: 'black'
  });
  const [status, setStatus] = useState({
    name: '',
    color: 'black'
  });
  const [typeInput, setTypeInput] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [targetEndDate, setTargetEndDate] = useState(null);

  const { formatDate } = useUtils();
  const dispatch = useDispatch();


  const addPriority = () => {
    if(!priority.name.trim()) return;
    if(sprint && sprint.priorities.map(priority => priority.name).includes(priority.name)) return;

    setSprint({
      ...sprint,
      priorities: [...sprint.priorities, priority]
    });
    
    setPriority({
      ...priority,
      name: ''
    });
  };

  const removePriority = (index) => {
    sprint.priorities.splice(index,1);
    setSprint({
      ...sprint
    });
  };

  const addStatus = () => {
    if(!status.name.trim()) return;
    if(sprint && sprint.status.map(status => status.name).includes(status.name)) return;
    
    setSprint({
      ...sprint,
      status: [...sprint.status, status]
    });
        
    setStatus({
      ...status,
      name: ''
    });
  };
      
  const removeStatus = (index) => {
    sprint.status.splice(index, 1);
    setSprint({
      ...sprint
    });
  };

  const deleteTaskType = (index) => {
    sprint.task_types.splice(index, 1);
    setSprint({ ...sprint });
  };

  const addTaskType = () => {
    if(sprint.task_types && sprint.task_types.includes(typeInput.toLowerCase())) return;

    setSprint({
      ...sprint,
      task_types: [...sprint.task_types, typeInput.toLowerCase()]
    });

    setTypeInput('');
  };

  const handleAddSprint = async() => {
    try{
      if(!project_id) return alert('Project id not found 404.');

      const sprint_data = {
        ...sprint,
        target_end_date: targetEndDate,
        start_date: startDate
      };

      if(sprint_data.target_end_date && sprint_data.start_date){
        if(new Date(sprint_data.target_end_date) < new Date(sprint_data.start_date)) return alert('target end date should bigger than start date');
      }

      const updated_project = await dispatch(addProjectSprint(project_id, sprint_data));
      socket.emit(PROJECT_UPDATED, updated_project);
      
      toggleDrawer();
    }catch(err){
      console.error(err);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={() => toggleDrawer()}>

      <Box sx={{ float:'right'}}>
        <IconButton onClick={toggleDrawer}>
          <Close />
        </IconButton>
      </Box>

      <Divider />

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

        <Box mb={2}>
          <Typography variant='body2' mb={1}>Sprint name *</Typography>

          <TextField 
            size='small'
            fullWidth 
            variant="outlined"
            defaultValue={sprint.name}
            onChange={e => sprint.name = e.target.value}
          />
        </Box>

        {/* sprint pririty */}
        <Box>
          <Typography variant='body2' mb={1}>Priorities</Typography>
              
          <Box display={'flex'} alignItems={'center'} flexWrap={'wrap'} gap={2} mb={2}>
            {
              (sprint.priorities || []).map((priority,i) => <Button 
                key={i}
                sx={{ borderRadius: 1, borderColor: priority.color, color:'black', textTransform: 'none' }}
                size='small'
                label={priority.name}
                startIcon={<FlagIcon sx={{ color: priority.color}} />}
                variant='outlined'
              >
                {priority.name}
                <CloseIcon onClick={() => removePriority(i)} sx={{ fontSize: 17, ml: 1 }} />
              </Button>)
            }
          </Box>

          <TextField
            size='small'
            value={priority.name}
            onChange={(e) => setPriority({ ...priority, name: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && addPriority()}
            InputProps={{
              endAdornment: (
                <Box display='flex' columnGap={1}>
                  <input
                    style={{
                      width:'40px',
                      height:'40px'
                    }} 
                    onChange={e => setPriority({...priority, color: e.target.value})}
                    type='color'
                  />

                  <IconButton onClick={addPriority}>
                    <Send />
                  </IconButton>
                </Box>
              )
            }}
          />
        </Box>
           
        {/* sprint status */}
        <Box mt={2}>
          <Typography variant='body2' mb={1}>Status</Typography>
              
          <Box display={'flex'} alignItems={'center'} flexWrap={'wrap'} gap={2} mb={2}>
            {
              (sprint.status || []).map((item, i) => <Button
                key={i}
                sx={{ borderRadius: 1, borderColor: item.color, color:'black' }}
                size='small'
                label={item.name}
                startIcon={<FlagIcon sx={{ color: item.color}} />}
                variant='outlined'
              >
                {item.name}
                <CloseIcon 
                  onClick={() => removeStatus(i)}
                  sx={{ fontSize: 17, ml: 1 }} 
                />
              </Button>)
            }
          </Box>

          <TextField
            size='small'
            value={status.name}
            onChange={(e) => setStatus({ ...status, name: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && addStatus()}
            InputProps={{
              endAdornment: (
                <Box display='flex' columnGap={1}>
                  <input
                    style={{
                      width:'40px',
                      height:'40px'
                    }} 
                    type='color'
                    onChange={e => setStatus({...status, color: e.target.value})}
                  />

                  <IconButton onClick={addStatus}>
                    <Send />
                  </IconButton>
                </Box>
              )
            }}
          />
        </Box>

        <Box mt={2}>
          <Typography variant='body2' mb={1}>Task types</Typography>

          <Box display={'flex'} alignItems={'center'} flexWrap={'wrap'} gap={2}>
            {
              (sprint.task_types || []).map((item, i) => <Chip
                key={item}
                label={item}
                size='small'
                variant='outlined'
                onDelete={() => deleteTaskType(i)}
                sx={{ borderRadius: 1, px: 2, mr: 2 }}
              />)
            }
          </Box>

          <TextField
            size='small'
            sx={{ mt: 2 }}
            value={typeInput}
            onChange={(e) => setTypeInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTaskType()}
            InputProps={{
              endAdornment: (
                <IconButton onClick={addTaskType}>
                  <Send />
                </IconButton>
              )
            }}
          />
        </Box>

        
             
        {/* date */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box display='flex' columnGap={2} marginY={3}>
      
            <DesktopDatePicker
              label='Start date (optional)'
              onChange={e => setStartDate(formatDate(e.$d))} 
              disablePast
              minDate={dayjs(project_start_date || formatDate(new Date()))}
            />

            <DesktopDatePicker 
              disablePast
              label='Target end date (optional)'
              onChange={e => setTargetEndDate(formatDate(e.$d))} 
              minDate={dayjs(startDate)} 
            />
          </Box>
        </LocalizationProvider>

        <Button
          sx={{ boxShadow: 0 }}
          variant='contained'
          size='small'
          startIcon={<Add />}
          onClick={handleAddSprint}
        >
            Add Sprint
        </Button>

      </Box>
    </Drawer>
  );
}
