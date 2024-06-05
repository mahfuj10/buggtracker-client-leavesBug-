import React from 'react';
import {  useSelector } from 'react-redux';
import { Box, Divider, IconButton, InputBase, Typography } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import GridViewIcon from '@mui/icons-material/GridView';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import DrawIcon from '@mui/icons-material/Draw';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SettingsIcon from '@mui/icons-material/Settings';
import { useUtils } from '../../utils/useUtils';
import { selectAdmin, selectTeamCreator } from '../../reducers/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { MANAGE_PROJECT } from '../../utils/path';

const items = [
  { icon: <GridViewIcon sx={{ fontSize: 16 }} />, label: 'Board' },
  { icon: <FormatListBulletedIcon sx={{ fontSize: 16 }} />, label: 'List' },
  { icon: <CalendarTodayIcon sx={{ fontSize: 16 }} />, label: 'Calendar' },
  { icon: <DescriptionIcon sx={{ fontSize: 16 }} />, label: 'Notes' },
  { icon: <DrawIcon sx={{ fontSize: 16 }} />, label: 'Whiteboard' },
];

export default function ProjectHeader({ project, selectPreviewScreen, previewScreen }) {

  const isTeamAdmin = useSelector(selectAdmin);
  const isTeamCreator = useSelector(selectTeamCreator);
  
  console.log('isTeamCreator',isTeamCreator, '->', 'isTeamAdmin',isTeamAdmin);
  
  const navigate = useNavigate();
  const { getCreatedDate } = useUtils();

  const isActiveScreen = (screen) => {
    return previewScreen === screen.toLowerCase();
  };
  
  return (
    <>
      <Box  bgcolor='white' display='flex' alignItems='center' px={2} pt={1.5} justifyContent='space-between'>

        <Box display='flex'  alignItems='end' columnGap={1}>
          <Typography fontWeight='bold' variant='h6'>
            {project.project_name}
          </Typography>
            
          <Typography fontWeight='light' variant='caption' fontSize={11}>
            Created on {getCreatedDate(project.createdAt)}
          </Typography>
        </Box>

        <Box display='flex'  alignItems='center' columnGap={2}>
          
          <InputBase
            placeholder="Search..."
            inputProps={{ 'aria-label': 'search' }}
          />
         
          <IconButton>
            <TuneIcon />
          </IconButton>

          <IconButton
            disabled={(isTeamAdmin || isTeamCreator) === false} 
            onClick={() => navigate(`${MANAGE_PROJECT}/${project._id}`)}
          >
            <SettingsIcon /> 
          </IconButton>
        </Box>

      </Box>

      <Divider />

      <Box display='flex' alignItems={'center'} columnGap={2} px={2} py={1.2}>
       
        {
          items.map((item, index) => (
            <Typography
              key={index}
              variant="caption"
              display="flex"
              alignItems="center"
              columnGap={0.5}
              className='cursor-pointer'
              color={isActiveScreen(item.label) ? 'black' : '#656f7d' }
              fontWeight={isActiveScreen(item.label) ? 'bold' : ''}
              onClick={() => selectPreviewScreen(item.label.toLowerCase())}
            >
              {item.icon} {item.label}
            </Typography>
          ))
        }

        <Typography variant='caption' color='#656f7d' display='flex' alignItems='center' columnGap={0.5}>
          <PersonIcon sx={{ fontSize: 16 }} /> Me Mode
        </Typography>

        <Typography variant='caption' color='#656f7d' display='flex' alignItems='center' columnGap={0.5}>
          <SupervisorAccountIcon sx={{ fontSize: 16 }} /> Assignees
        </Typography>
      </Box>

      <Divider />
    </>
  );
}
