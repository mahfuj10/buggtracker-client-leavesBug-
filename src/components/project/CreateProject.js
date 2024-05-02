import { Box, Button, TextField, TextareaAutosize } from '@mui/material';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../reducers/auth/authSlice';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useUtils } from '../../utils/useUtils';

export default function CreateProject( { handleCreateProject, isLoading = false} ) {
  
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [targetEndDate, setTargetEndDate] = useState(null);
  
  const [error, setError ] = useState('');

  const { formatDate, isValidProjectName } = useUtils();

  const handleChangeProjectName = (e) => {
    const name = e.target.value;
    if(!isValidProjectName(name)) {
      return setError('Invalid project name (- AND _ only allow for special char.)');
    }
    setProjectName(name);
    setError('');
  };
 
  return (
    <Box padding={3} boxShadow={1} bgcolor='white'>

      <TextField
        error={Boolean(error)}
        aria-errormessage='test'
        fullWidth
        label="Project name *"
        variant="outlined"
        helperText={error}
        onChange={handleChangeProjectName}
      />

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box display='flex' columnGap={2} marginY={3}>
          
          <DesktopDatePicker 
            label='Start date (optional)'
            onChange={e => setStartDate(formatDate(e.$d))} 
            disablePast
          />

          <DesktopDatePicker 
            disablePast
            label='Target end date (optional)'
            onChange={e => setTargetEndDate(formatDate(e.$d))} 
            minDate={dayjs(startDate)} 
          />
        </Box>
      </LocalizationProvider>

      <TextField
        label="Description (optional)"
        variant='outlined'
        multiline
        rows={3}
        onChange={e => setDescription(e.target.value)}
        fullWidth
      />

      <Button 
        fullWidth
        variant="outlined"
        color='success'
        onClick={() => handleCreateProject({
          projectName,
          description,
          startDate,
          targetEndDate
        })}
        sx={{ mt: 3 }}
        disabled={isLoading}
      >
          Create Project
      </Button>
    </Box>
  );
}
