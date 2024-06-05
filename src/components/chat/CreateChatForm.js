import { Edit } from '@mui/icons-material';
import { Box, Button, IconButton, InputBase, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import Members from '../task/TaskAssignDropdown';
import { useDispatch } from 'react-redux';
import { createChat } from '../../reducers/chat/chatSlice';
import { useSelector } from 'react-redux';
import { selectTeam } from '../../reducers/team/teamSlice';
import socket from '../../utils/socket';
import { CHAT_CREATED } from '../../utils/socket-events';
import { selectUser } from '../../reducers/auth/authSlice';

export default function CreateChatForm() {

  const currentLoginUser = useSelector(selectUser);

  const [chatName, setChatName] = useState('Work Discussions');
  const [participants, setParticipants] = useState([currentLoginUser?._id]);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef(null);
  const dispatch = useDispatch();

  const currentTeam = useSelector(selectTeam);
 
  const handleCreateChat = async() => {
    try{
      if(!chatName?.trim()) return;

      setIsLoading(true);

      if(!participants.includes(currentLoginUser._id)){
        setParticipants(prev => [...prev, currentLoginUser._id]);
      }

      const created_chat = await dispatch(createChat({ 
        chatName,
        participants,
        teamId: currentTeam._id,
        creatorId: currentLoginUser._id
      }));

      if(created_chat && created_chat._id){
        socket.emit(CHAT_CREATED, created_chat);
      }
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <Box 
      display={'flex'}
      justifyContent={'center'}
    >

      <Box
        boxShadow={1} 
        bgcolor={'white'}
        m={2}
        p={2}
        minWidth={'35%'}
      >
        
        

        <InputBase 
          defaultValue={chatName}
          onChange={e => setChatName(e.target.value)}
          inputRef={inputRef}
          fullWidth
          endAdornment={(
            <IconButton size='small' onClick={() => inputRef.current && inputRef.current.focus()}>
              <Edit />
            </IconButton>
          )
          }
        />


        <Typography mt={1.5} display={'block'} variant='caption'> Create With </Typography>

        <Members 
          size={30}
          assigns={participants}
          setAssigns={setParticipants}
        />

        <Button
          size='small'
          color='success'
          disabled={isLoading}
          sx={{ mt: 2, float: 'right' }}
          onClick={handleCreateChat}
        >
            create
        </Button>


      </Box>
        
    </Box>
  );
}
