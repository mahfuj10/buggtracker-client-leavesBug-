import { Avatar, Badge, Box, IconButton, Typography } from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import Menu from '@mui/material/Menu';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getNotifications, markAllNotificationAsRead, removeUserFromAllNotifications, removeUserFromVisibleTo, saveNotification } from '../../reducers/notification/notification.slice';
import { useSelector } from 'react-redux';
import { selectTeam } from '../../reducers/team/teamSlice';
import { selectUser } from '../../reducers/auth/authSlice';
import socket from '../../utils/socket';
import { SEND_NOTIFICATION } from '../../utils/socket-events';
import NotificationsActiveOutlineIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { CheckBoxOutlineBlank, Close } from '@mui/icons-material';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

export const sendNotification = async (dispatch, teamId, visibleTo, readBy, imageURL, content, redirectURL = null) => {
  try {
    const notificationDoc = {
      teamId,
      imageURL,
      content,
      visibleTo,
      readBy, 
      redirectURL,
      createdAt: Date.now()
    };
  
    const response = await dispatch(saveNotification(notificationDoc));
  
    socket.emit(SEND_NOTIFICATION, {...notificationDoc, _id: response._id});
  } catch (err) {
    console.error(err);
  }
};

export default function Notification() {
    
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentTeam = useSelector(selectTeam);
  const currentLoginUser = useSelector(selectUser);
  

  useEffect(() => {
    const fetchNotification = async() => {
      try{
        const response = await dispatch(getNotifications(currentLoginUser._id));

        if(response){
          setNotifications(response);
        }
      }catch(err){
        console.error(err);
      }
    };

    fetchNotification();
  }, [dispatch]);

  useEffect(() => {
    socket.on(SEND_NOTIFICATION, (newNotification) => {
      if(newNotification.teamId === currentTeam._id){
        setNotifications(prev => [...prev, newNotification]);
      }
    });

    return () => {
      socket.off(SEND_NOTIFICATION);
    };
  }, [socket]);

  const markAsRead = async() => {
    try {
      const unreadNotifications = getUnreadNotifications();

      if(unreadNotifications.length === 0) return;

      await dispatch(
        markAllNotificationAsRead(
          unreadNotifications.map(notification => notification._id),
          currentLoginUser._id
        )
      );

      setNotifications(prev => prev.map(notification => ({
        ...notification,
        readBy: [...new Set([...notification.readBy, currentLoginUser._id])]
      })));


    }catch(err){
      console.error(err);
    }

  };
    
  const getUnreadNotificationCount = () => {
    return getUnreadNotifications().length;
  };
  
  const getUnreadNotifications = () => {
    if(!notifications.length) return 0;
    return notifications.filter(notification => !notification.readBy.includes(currentLoginUser._id));
  };
    
  const getNotificationsByUserId = () => {
    if(!notifications.length) return [];
    return notifications.filter(notification => notification.visibleTo.includes(currentLoginUser._id)).reverse();
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
    
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (redirectURL) => {
    if(!redirectURL || !currentTeam._id) return;
    navigate(redirectURL);
  };

  const removeAllNotification = async()=>{
    try{
      setIsLoading(true);

      await dispatch(removeUserFromAllNotifications(currentLoginUser._id));

      setNotifications([]);
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };

  const clearNotification = async(notification)=>{
    try{
      const remining_notifications = notifications.filter(({_id}) => _id !== notification._id);
      setNotifications(remining_notifications);

      await dispatch(removeUserFromVisibleTo(currentLoginUser._id, notification._id));

    }catch(err){
      console.error(err);
    }
  };

  return (
    <>
      <Badge
        badgeContent={getUnreadNotificationCount()} 
        color="secondary"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        sx={{
          mt: getUnreadNotificationCount() > 0 ? -1 : 0
        }}
      > 
        <IconButton
          id="demo-positioned-button"
          aria-controls={open ? 'demo-positioned-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          size='small'
          onClick={(e) => {
            handleClick(e);
            markAsRead();
          }}
        >
          {
            getUnreadNotificationCount() > 0 
              ?
              <NotificationsActiveOutlineIcon />
              :
              <NotificationsOutlinedIcon />
          }
        </IconButton>
      </Badge>

      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box width={400} minHeight={160} maxHeight={260} >

          {
            !notifications.length &&
             <Box display={'flex'} justifyContent={'center'} alignItems={'center'} pt={5.5}>
               <CheckBoxOutlineBlank sx={{ fontSize: 75 , color: '#e3e6ec', display:'block' }} />
             </Box>
          }
          
          <Box maxHeight={240} overflow={'scroll'}>
            {
              getNotificationsByUserId().map((notification, index) => <Box 
                key={`${notification.teamId}_${index}`}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'space-between'}
                bgcolor={index % 2 === 0 ? '#f5f7fd' : '#fff'}
                borderBottom={'1px solid #d4d4d4'}
                className={notification.redirectURL ? 'cursor-pointer' : ''}
                onClick={() => handleNavigate(notification.redirectURL)}
                p={1} mb={1} pb={1}
                sx={{
                  ':hover' : {
                    '.remove-icon': {
                      opacity: 1
                    }
                  }
                }}
              >
                <Box display={'flex'} alignItems={'center'} columnGap={1}>
                  <Avatar 
                    src={notification.imageURL}
                    alt={'notification logo'}
                    sx={{
                      borderRadius: 2
                    }}
                  />

                  <Typography variant='body2' className='text-break-notification-content'>
                    {notification.content}
                  </Typography>
                </Box>

                <Box>
                  <IconButton
                    size='small' 
                    className='remove-icon' 
                    sx={{
                      opacity: 0, 
                      transition: '0.2s' 
                    }}
                    onClick={(event) => {
                      clearNotification(notification);
                      event.stopPropagation();
                    }}
                  >
                    <Close fontSize='12px' />
                  </IconButton>

                  <Typography variant='caption' display={'block'}>
                    {moment(notification.createdAt).format('hh:mm')}
                  </Typography>
                </Box>

              </Box>)
            }
          </Box>

          {
            notifications.length > 0 &&
            <Box display={'flex'} justifyContent={'end'} pt={0.5}>
              <button 
                disabled={isLoading}
                onClick={removeAllNotification}
                className='cursor-pointer'>
                Clear All
              </button>
            </Box>
          }
           
        </Box>
      </Menu>
    </>
  );
}
