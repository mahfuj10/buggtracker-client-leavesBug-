import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, signOut } from '../../../reducers/auth/authSlice';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import BugLogo from '../../../assets/img/logo.jpg';
import { useNavigate } from 'react-router';
import { LOGIN, ME } from '../../../utils/path';
import Notification from '../../Notification/Notification';
import { ContentCopy } from '@mui/icons-material';

export default function NavigationTopbar() {

  const currentLoginUser = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleSignOut = () => {
    dispatch(signOut());
    localStorage.setItem('team_id', '');
    navigate(LOGIN);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const copyToCliboard =  async(text) => {
    try{
      await navigator.clipboard.writeText(text);
    }catch(err){
      console.error(err);
    }
  };

  return (
    <Box bgcolor="white" borderBottom="1px solid #0000001f" sx={{flex: '0 0 auto'}}>

      <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}  py={0.5}  px={1}>

        <Avatar alt='logo' src={BugLogo} />
        

        <Box>
          <Notification />
          
          <Tooltip title={currentLoginUser.name}>
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar src={currentLoginUser.photoURL} sx={{ width: 32, height: 32 }}>{currentLoginUser.name?.slice(0,1)}</Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >

          <MenuItem>
            {currentLoginUser.email}
            <ListItemIcon size='small' sx={{ ml: 2}} onClick={() => copyToCliboard(currentLoginUser.email)}>
              <ContentCopy fontSize="small" />
            </ListItemIcon>
          </MenuItem>

          <MenuItem onClick={() => navigate(ME)}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
          Settings
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleSignOut}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
          Logout
          </MenuItem>
        </Menu>
      </Box>

    </Box>
  );
}
