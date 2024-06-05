import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../reducers/auth/authSlice';
import { Outlet } from 'react-router-dom';
import NavigationSidebar from '../components/common/navigation/NavigationSidebar';
import { Box } from '@mui/material';
import NoTeamFound from '../components/common/NoTeamFound';
import { selectTeam } from '../reducers/team/teamSlice';
import socket from '../utils/socket';
import { USER_UPDATED } from '../utils/socket-events';
import Whiteboard from '../components/whiteboard/Whiteboard';

export default function Home() {
  const dispatch = useDispatch();
  const currentTeam = useSelector(selectTeam);

   
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
        !currentTeam?._id
          ?
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
