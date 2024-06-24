import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, setUser } from '../reducers/auth/authSlice';
import { Outlet } from 'react-router-dom';
import NavigationSidebar from '../components/common/navigation/NavigationSidebar';
import { Box, Typography } from '@mui/material';
import NoTeamFound from '../components/common/NoTeamFound';
import socket from '../utils/socket';
import { USER_UPDATED } from '../utils/socket-events';
import TeamInvited from '../components/setting/me/TeamInvited';

export default function Home() {
  const dispatch = useDispatch();
  const currentLoginUser = useSelector(selectUser);

   
  useEffect(() => {
    socket.on(USER_UPDATED, (data ) => {
      console.log('user updated from socket', data);
      if(data._id === currentLoginUser._id){
        dispatch(setUser(data));
      }
    });
  },[socket]);
  
  return (
    <>
      {
        !(currentLoginUser && currentLoginUser.teamJoined && currentLoginUser.teamJoined.length > 0) ?
          <Box>
            <NoTeamFound />

            <Box display={'flex'} justifyContent={'center'} mt={2}>
              <Box 
                bgcolor='white'
                boxShadow={1}
                sx={{
                  width: {
                    xs: '100%',
                    lg: '50%'
                  },
                }}>
                
                <Typography variant='body' display={'block'} m={1}>
                  Team you have been invited to join
                </Typography>
                
                <TeamInvited />
              </Box>
            </Box>
          </Box>
          :
          <Box display='flex'>
            <NavigationSidebar />
             
            <Outlet />

          </Box>
      }
    </>
  );
}
