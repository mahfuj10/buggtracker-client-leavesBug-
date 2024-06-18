import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getChats } from '../../reducers/chat/chatSlice';
import Loader from '../../components/common/Loader/Loader';
import CreateChatForm from '../../components/chat/CreateChatForm';
import NavigationTopbar from '../../components/common/navigation/NavigationTopbar';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectTeam } from '../../reducers/team/teamSlice';
import { selectUser } from '../../reducers/auth/authSlice';
import ChatList from '../../components/chat/ChatList';
import ChatBox from '../../components/chat/ChatBox';
import socket from '../../utils/socket';
import { CHAT_CREATED } from '../../utils/socket-events';

export default function Chat() {

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const currentTeam = useSelector(selectTeam);
  const currentLoginUser = useSelector(selectUser);

  useEffect(() => {
    
    const fetchChats = async() => {
      try{
        setIsLoading(true);

        const response = await dispatch(getChats(currentTeam._id, currentLoginUser._id));

        if(response && response[0]){
          setChats(response);
          // selectChat(response[0]);
        }
      }catch(err){
        console.error(err);
      }
      setIsLoading(false);
    };

    fetchChats();

  }, []);

  useEffect(() => {
    socket.on(CHAT_CREATED, (newChat) => {
      console.log('CHAT_CREATED',CHAT_CREATED, newChat);

      if(newChat.participants.includes(currentLoginUser._id)){
        addChat(newChat);
      }
    });

    return () => {
      socket.off(CHAT_CREATED);
    };
  }, [socket]);

  const selectChat = chat => {
    setSelectedChat(chat);
  };

  const addChat = newChat => {
    setChats(prev => [...prev, newChat]);
  };

  if(isLoading) return <Loader />;


  return (

    <Box  className='chat-container' width={'100%'}>
        
      <NavigationTopbar />

      {
        (!chats.length && !isLoading) ?
          <Box>
            <Typography 
              variant='body2'
              textAlign={'center'}
              mt={2}
            >
              You don&apos;t any chat. Create chat or wait for invitation !!! 
            </Typography>

            <CreateChatForm />

          </Box>

          : 

          <Box className='chat-box'>
            <ChatList
              chats={chats} 
              hanldeSelectChat={selectChat}
              selectedChat={selectedChat}
            />

            {
              !selectedChat._id &&
              <Typography variant='h6'>
                Select chat to start conversation
              </Typography>
            }

            {
              selectedChat._id &&   <ChatBox
                selectedChat={selectedChat}
              />
            }

          </Box>
      }

    </Box>
  );
}
