import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { IconButton } from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';

const steps = [
  'Create Project',
  'Add project sprint',
  'Create task',
];

export default function ProjectFlowStepper({ activeStep, func = () => {} }) {
  
  return (
    <Box width='100%' display='' bgcolor='#fff' boxShadow={1} paddingY={1}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {
          steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))
        }
        <IconButton onClick={() => func()}>
          <AutorenewIcon />
        </IconButton>
      </Stepper>

    </Box>
  );
}
