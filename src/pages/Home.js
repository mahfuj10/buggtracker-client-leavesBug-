import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, setUser } from '../reducers/auth/authSlice';
import { Outlet } from 'react-router-dom';
import NavigationSidebar from '../components/common/navigation/NavigationSidebar';
import { Box } from '@mui/material';
import NoTeamFound from '../components/common/NoTeamFound';
import socket from '../utils/socket';
import { USER_UPDATED } from '../utils/socket-events';

export default function Home() {
  const dispatch = useDispatch();
  const currentLoginUser = useSelector(selectUser);

   
  useEffect(() => {
    socket.on(USER_UPDATED, (data ) => {
      console.log('user updated from socket', data);
      dispatch(setUser(data));
    });
  },[socket]);
  
  return (
    <>
      {/* testing */}
      {/* <Whiteboard /> */}
      {
        !(currentLoginUser && currentLoginUser.teamJoined && currentLoginUser.teamJoined.length > 0) ?
          <Box>
            <NoTeamFound />
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
