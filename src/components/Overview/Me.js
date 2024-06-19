import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser, signOut } from '../../reducers/auth/authSlice';
import { selectTeam } from '../../reducers/team/teamSlice';
import { Avatar, Box, Button, IconButton, Typography } from '@mui/material';
import { useUtils } from '../../utils/useUtils';
import { Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LOGIN, ME } from '../../utils/path';
import { useDispatch } from 'react-redux';

export default function Me() {
  
  const currentLoginUser = useSelector(selectUser);
  const currentTeam = useSelector(selectTeam);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { getCreatedDate } = useUtils();

  const isAdmin = (userId) => {
    return currentTeam.admins.findIndex(admin => admin._id === userId) !== -1;
  };

  const handleSignOut = () => {
    dispatch(signOut());
    localStorage.setItem('team_id', '');
    navigate(LOGIN);
  };

  return (
    <Box boxShadow={1} bgcolor={'white'} p={1}>
      <Typography variant='body'>Welcome <b>{currentLoginUser.name}</b>,</Typography>

      <Box display={'flex'} justifyContent={'end'}>
        <Avatar
          sx={{ width: 80, height: 80, borderRadius: 1 }}
          alt={currentLoginUser.name}
          src={currentLoginUser.photoURL} 
        />
      </Box>

      <Box display={'flex'} flexDirection={'column'} rowGap={2}>
        <Typography variant='body'>
       Your Active Team - <b>{currentTeam.name}</b> - #{ currentTeam.createor._id === currentLoginUser._id ? 'OWNER' : isAdmin(currentLoginUser._id) ? 'ADMIN' : 'MEMBER' }
        </Typography>

        <Typography variant='body'>
            Account Created At - <b>{getCreatedDate(currentLoginUser.createdAt)}</b>
        </Typography>

        <Typography variant='body'>
            Total Team Joined - <b>{currentLoginUser.teamJoined.length}</b>
        </Typography>
        
        <Typography variant='body'>
            Team Invited - <b>{currentLoginUser.teamInvited.length}</b>
        </Typography>

        <Box>
          <Button
            color='error'
            size='small'
            variant='outlined'
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
          
          <IconButton
            size='small' 
            sx={{ ml: 1 }} 
            onClick={() => navigate(ME)}
          >
            <Settings />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
