import { DeleteOutline } from '@mui/icons-material';
import { Avatar, Box, Chip, IconButton, Typography } from '@mui/material';
import moment from 'moment';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../reducers/auth/authSlice';
import MessageMedia from '../../chat/Message/MessageMedia';

export default function Comment({ comment, deleteComment }) {
  
  const currentLoginUser = useSelector(selectUser);

  const isMe = () => currentLoginUser._id === comment.sender._id;

  return (
    <Box 
      bgcolor={isMe() ? '' : '#f5f7fd' }
      borderRadius={1} 
      p={1} mb={1}
    >

      <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
        <Chip
          avatar={<Avatar alt={comment.sender.name} src={comment.sender.photoURL} />}
          label={comment.sender.name}
          variant="outlined"
          size='small'
          sx={{ fontSize: 11 }}
        />

        <Typography fontSize={12}>
          {moment(comment.createdAt).fromNow()}
        </Typography>
      </Box>

      <Typography fontSize={12} my={1}>
        {comment.content}
      </Typography>

      <MessageMedia media={comment.media} />      

      <Box display={'flex'} justifyContent={'end'} visibility={isMe() ? '' : 'hidden'}>
        <IconButton size='small' onClick={() => deleteComment(comment._id)}>
          <DeleteOutline fontSize='12px' />
        </IconButton>
      </Box>
      
    </Box>
  );
}
