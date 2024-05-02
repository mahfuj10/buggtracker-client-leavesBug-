import React from 'react';
import {  useSelector } from 'react-redux';
import {  selectProject } from '../../reducers/project/projectSlice';
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

export default function ProjectHeader() {

  const project = useSelector(selectProject);
  const { getCreatedDate } = useUtils();
  
  return (
    <>
      <Box  bgcolor='white' display='flex' alignItems='center' px={2} pt={1.5} justifyContent='space-between'>

        <Box display='flex'  alignItems='end' columnGap={1}>
          <Typography fontWeight='bold' variant='h6'>{project.project_name}</Typography>
          <Typography fontWeight='light' variant='caption' fontSize={11}>Created on {getCreatedDate(project.createdAt)}</Typography>
        </Box>

        <Box display='flex'  alignItems='center' columnGap={2}>
          
          <InputBase
            placeholder="Search..."
            inputProps={{ 'aria-label': 'search' }}
          />
          
          {/* <IconButton type="button" aria-label="search">
            <Search />
          </IconButton> */}

          <IconButton>
            <TuneIcon />
          </IconButton>

          <IconButton>
            <SettingsIcon />
          </IconButton>
        </Box>

      </Box>

      <Divider />

      <Box display='flex'  alignItems={'center'} columnGap={2} px={2} py={1.2}>
        <Typography variant='caption' color='#656f7d' display='flex' alignItems='center' columnGap={0.5}>
          <GridViewIcon sx={{ fontSize: 16 }} /> Board
        </Typography>

        <Typography variant='caption' color='#656f7d' display='flex' alignItems='center' columnGap={0.5}>
          <FormatListBulletedIcon sx={{ fontSize: 16 }} /> List
        </Typography>

        <Typography variant='caption' color='#656f7d' display='flex' alignItems='center' columnGap={0.5}>
          <CalendarTodayIcon sx={{ fontSize: 16 }} /> Calendar
        </Typography>

        <Typography variant='caption' color='#656f7d' display='flex' alignItems='center' columnGap={0.5}>
          <DescriptionIcon sx={{ fontSize: 16 }} /> Notes
        </Typography>

        <Typography variant='caption' color='#656f7d' display='flex' alignItems='center' columnGap={0.5}>
          <DrawIcon sx={{ fontSize: 16 }} /> Whiteboard
        </Typography>

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
