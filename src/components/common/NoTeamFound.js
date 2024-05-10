import React from 'react';
import NavigationTopbar from './navigation/NavigationTopbar';
import { Box, Typography, Divider, Link } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../reducers/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { CREATE_TEAM, ME } from '../../utils/path';
import TeamInvited from '../setting/me/TeamInvited';

export default function NoTeamFound() {

  const currentLoginUser = useSelector(selectUser);
  const navigate  = useNavigate();

  return (
    <>
      <NavigationTopbar />

      <Box display={'flex'} justifyContent={'center'} mt={10}>
        <Box bgcolor={'white'} boxShadow={1} borderRadius={1} px={10} py={2}>
       
          <br />
        
          <Typography variant='h6'>Hello <b>{currentLoginUser.name}</b>,</Typography>
          
          <br />

          <Divider />
    
          <Typography variant='body2' my={2} fontWeight={'bold'}>
              You haven&apos;t joined any teams yet.
          </Typography>
    
          <Typography variant='body2'>
              Wait for someone who can invite you,
          </Typography>
    
          <Typography variant='body2' my={2}>
              or <Link onClick={() => navigate(CREATE_TEAM)}>create a team</Link> and invite your friends or colleagues.
          </Typography>
    
          <Divider />
           

          {
            currentLoginUser.teamInvited && currentLoginUser.teamInvited.length > 0 &&
            <Box>
              <Typography variant='body2' mt={2}>
              You have following invitaion to join team
              </Typography>
    
              <TeamInvited />
            </Box>
          }
        </Box>
      </Box>

      
    </>
  );
}
