import { Box, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useUtils } from '../../utils/useUtils';
import { Polyline } from '@mui/icons-material';

export default function CreateProject( { handleCreateProject, isLoading = false} ) {
  
  const [projectName, setProjectName] = useState('');
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
            sx={{width:'100%'}}
            label='Start date (optional)'
            onChange={e => setStartDate(formatDate(e.$d))} 
            disablePast
          />

          <DesktopDatePicker 
            disablePast
            sx={{width:'100%'}}
            label='Target end date (optional)'
            onChange={e => setTargetEndDate(formatDate(e.$d))} 
            minDate={dayjs(startDate)} 
          />
        </Box>
      </LocalizationProvider>

      <Button 
        variant="outlined"
        color='success'
        onClick={() => handleCreateProject({
          projectName,
          startDate,
          targetEndDate
        })}
        disabled={isLoading}
        startIcon={<Polyline />}
      >
          Create Project
      </Button>
    </Box>
  );
}
