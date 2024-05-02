import { Box, Button, Chip, IconButton, TextField, Typography } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useUtils } from '../../../utils/useUtils';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';


export default function CreateProjectSprint({ handleAddSprint, isLoading,  project_start_date }) {

  const [sprintName, setSprintName] = useState('sprint - 1');
  const [startDate, setStartDate] = useState(null);
  const [targetEndDate, setTargetEndDate] = useState(null);
  const [error, setError] = useState('');
  const [color, setColor] = useState('#fff');
  const [status, setStatus] = useState('');
  const [allStatus, setAllStatus] = useState([
    {
      name: 'todo',
      color: '#FFD700'
    },
    {
      name: 'in progress',
      color: '#1E90FF'
    },
    {
      name: 'review',
      color: '#00FF00'
    },
    {
      name: 'done',
      color: '#808080'
    }
  ]);

  const { formatDate, isValidProjectName } = useUtils();


  const addStatus = () => {
    if(!status.trim()) return;
    if(allStatus.includes(status)) return alert('This status already exist.');
    
    setAllStatus(prev => [...prev, {
      name: status,
      color: color
    }]);

    setStatus('');
  };

  const removeStatus = (status) => {
    const remining_status = allStatus.filter(s => s.name !== status);
    setAllStatus(remining_status);
  };

  const handleChangeSprintName = (e) => {
    const name = e.target.value;
    
    if(!isValidProjectName(name)){
      return setError('Invalid sprint name only allow - AND _.');
    }

    setSprintName(name);
    setError('');
  };

  

  return (
    <Box padding={3} boxShadow={1} bgcolor='white'>

      <TextField 
        defaultValue={sprintName}
        onChange={handleChangeSprintName}
        fullWidth
        error={Boolean(error)}
        helperText={error}
        label="Name *"
        variant="outlined"
      />

    
       

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box display='flex' columnGap={2} marginY={3}>
      
          <DesktopDatePicker
            label='Start date (optional)'
            onChange={e => setStartDate(formatDate(e.$d))} 
            disablePast
          />
          {/* minDate={dayjs(project_start_date ? project_start_date : formatDate(new Date()))} */}

          <DesktopDatePicker 
            disablePast
            label='Target end date (optional)'
            onChange={e => setTargetEndDate(formatDate(e.$d))} 
            minDate={dayjs(startDate)} 
          />
        </Box>
      </LocalizationProvider>

     
      <Typography display='block' marginBottom={1} variant='body'>Task status *</Typography>
      
      <Box display='flex' flexWrap='wrap' gap={1}>
        {
          (allStatus || []).map(item => <Chip 
            key={item.name}
            label={item.name}
            sx={{ borderColor: item.color }}
            variant="outlined" 
            onDelete={() => removeStatus(item.name)}
          />)
        }
      </Box>

      <Box display='flex' columnGap={1} mt={2}>
        <TextField
          label="Status"
          onChange={(e) => setStatus(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addStatus()}
          size='small'
          value={status}
          fullWidth
          InputProps={{
            endAdornment: (
              <Box display='flex' columnGap={1}>
                <input
                  onChange={e => setColor(e.target.value)}
                  style={{
                    width:'40px',
                    height:'40px'
                  }} type='color' />

                <IconButton onClick={() => addStatus()}>
                  <SendIcon />
                </IconButton>
              </Box>
            )
          }}
        />
        
        
        <Button 
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />} 
          color='success'
          disabled={isLoading}
          onClick={() => handleAddSprint({
            startDate,
            targetEndDate,
            sprintName,
            allStatus
          })}
        >
          Add Sprint
        </Button>
      </Box>
    </Box>
  );
}
