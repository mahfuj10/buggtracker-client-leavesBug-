import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, signOut } from '../reducers/auth/authSlice';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import NavigationSidebar from '../components/common/navigation/NavigationSidebar';
import { Box, Divider } from '@mui/material';

export default function Home() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const currentLoginUser = useSelector(selectUser);

  return (
    <>
      <Box display='flex'>

        <NavigationSidebar />

        <Outlet />

      </Box>
    </>
  );
}
