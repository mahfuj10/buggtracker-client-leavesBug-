import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, signOut } from '../reducers/auth/authSlice';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import NavigationSidebar from '../components/common/navigation/NavigationSidebar';
import { Box, Divider } from '@mui/material';
import NoTeamFound from '../components/common/NoTeamFound';
import { selectTeam } from '../reducers/team/teamSlice';

export default function Home() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const currentLoginUser = useSelector(selectUser);
  const currentTeam = useSelector(selectTeam);

  return (
    <>
      {
        currentLoginUser && currentLoginUser.teamJoined && (currentLoginUser.teamJoined.length < 1 || !currentTeam?._id) 
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
