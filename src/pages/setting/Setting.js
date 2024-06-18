import React from 'react';
import NavigationTopbar from '../../components/common/navigation/NavigationTopbar';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { MANAGE_PROJECT, MANAGE_TEAM, ME } from '../../utils/path';
import TuneIcon from '@mui/icons-material/Tune';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import { useSelector } from 'react-redux';
import { selectTeam } from '../../reducers/team/teamSlice';

export default function Setting() {

  const routes = [
    {
      icon: ManageAccountsIcon,
      path: ME,
      title: 'Manage Account',
      sub_title: 'Update Your Profile and Preferences'
    },
  ];
  // {
  //   icon: TuneIcon,
  //   path: MANAGE_PROJECT,
  //   title: 'Manage Project',
  //   sub_title: 'Fine-Tune Your Project Managemen'
  // }

  const navigate = useNavigate();

  const currentTeam = useSelector(selectTeam);

  return (
    <Box width={'100%'}>

      <NavigationTopbar   />


      <Box p={2}>
        {
          routes.map(({icon:Icon, path, title, sub_title}) => <Box 
            key={path}
            display='flex'
            alignItems={'center'} 
            columnGap={0.5}
            className='cursor-pointer'
            borderBottom={'1px solid #0000001f'} 
            pb={1}
            mb={2}
            onClick={() => navigate(path)}
          >
            <Icon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant='body2' fontSize={14}>{title}</Typography>
              <Typography variant='caption' fontSize={9} display={'block'} mt={-0.2}>{sub_title}</Typography>
            </Box>

          </Box>)
        }

        <Box 
          display='flex'
          alignItems={'center'} 
          columnGap={0.5}
          className='cursor-pointer'
          borderBottom={'1px solid #0000001f'} 
          pb={1}
          mb={2}
          onClick={() => navigate(`${MANAGE_TEAM}/${currentTeam._id}`)}
        >
          <SettingsApplicationsIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant='body2' fontSize={14}>Team Configuration</Typography>
            <Typography variant='caption' fontSize={9} display={'block'} mt={-0.2}>Customize your team&apos;s workflow and preferences</Typography>
          </Box>

        </Box>
      </Box>
      
    </Box>
  );
}
