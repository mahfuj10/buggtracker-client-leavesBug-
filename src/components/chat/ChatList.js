import { Close, ModeCommentOutlined, Polyline } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getMessages } from '../../reducers/chat/chatSlice';
import socket from '../../utils/socket';
import { CHAT_CREATED, MESSAGE_READ, SEND_CHAT_MESSAGE } from '../../utils/socket-events';
import { useSelector } from 'react-redux';
import { selectUser } from '../../reducers/auth/authSlice';
import moment from 'moment';
import CreateChatForm from './CreateChatForm';



export default function ChatList({ chats, hanldeSelectChat, selectedChat }) {

  const [lastMessage, setLastMessage] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChatForm, setShowChatForm] = useState(false);

  const dispatch = useDispatch();
  const currentLoginUser = useSelector(selectUser);

  useEffect(() =>  {

    const fetchLastMessage = async(chatId) => {
      if(chatId){
        setIsLoading(true);

        const response = await dispatch(getMessages(chatId, 1));

        if(response && response.messages && response.messages[0]){
          setLastMessage(prev => [...prev, {
            chatId: chatId,
            message: response.messages[0],
            count: response.count
          }]);
        }
        setIsLoading(false);
      }
    };

    for(const chat of chats) fetchLastMessage(chat._id);
  }, []);

  useEffect(() => {
    socket.on(SEND_CHAT_MESSAGE, (data) => {
      setLastMessage(prevLastMessage => {
        const messageIndex = prevLastMessage.findIndex(message => message.chatId === data.chatId);
        if (messageIndex !== -1) {
          // Update the existing message
          const updatedMessages = [...prevLastMessage];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            message: {
              ...data.message,
              readBy: selectedChat._id === data.chatId ? [...data.message.readBy, currentLoginUser] : data.message.readBy
            },
          };
          return updatedMessages;
        } else {
          return [
            ...prevLastMessage,
            {
              chatId: data.chatId,
              message: {
                ...data.message,
                readBy: selectedChat._id === data.chatId ? [...data.message.readBy, currentLoginUser] : data.message.readBy
              },
            }
          ];
        }
      });
      
    });

    socket.on(MESSAGE_READ, ({ chatId }) => {
      if(selectedChat._id === chatId){
        setLastMessage(prevMessages =>
          prevMessages.map((prevMsg) =>
            prevMsg.chatId === chatId
              ? 
              { ...prevMsg, message: {...prevMsg.message, readBy: [...prevMsg.message.readBy, currentLoginUser]} }
              : prevMsg
          )
        );
      }
    });

    socket.on(CHAT_CREATED, (newChat) => {
      if(newChat.creatorId === currentLoginUser._id){
        setShowChatForm(false);
      }
    });

    return () => {
      socket.off(SEND_CHAT_MESSAGE);
      socket.off(MESSAGE_READ);
      socket.off(CHAT_CREATED);
    };
  }, [socket, selectedChat]);

  const LastMessageDisplay = ({ chat, currentLoginUser }) => {
    const lastMsg = getLastMessage(chat._id);
    
    if (!lastMsg || !lastMsg.chatId) return null;
  
    const senderName = lastMsg.message.sender._id === currentLoginUser._id 
      ? 'You' 
      : lastMsg.message.sender.name.split(' ')[0];
  
    const messageContent =  lastMsg.message.content;
    return (
      <Typography variant="caption" color="black" className='text-break'>
        {senderName}: {messageContent || (lastMsg.message.media.length ? 'Shared file' : '')}
      </Typography>
    );
  };

  const getLastMessage = chatId => {
    if(lastMessage.length === 0) return {};
    return lastMessage.find(msg => msg.chatId === chatId);
  };

  const hasUnreadMessage = chatId => {
    if(lastMessage.length === 0) return false;
    if(isLoading) return false;
    
    const { message } = getLastMessage(chatId) ?? {};
    
    if(!message) return false;

    return ((message && message.readBy) || []).findIndex(readBy => readBy._id === currentLoginUser._id) === -1;
  };

  return (
    <Box
      m={1}
      bgcolor={'white'} 
      className='sidebar'
      p={1}
      borderRadius={2}
    >
      {
        chats.map(chat => <Box 
          key={chat._id}
          mb={3}
          p={1}
          bgcolor={chat._id === selectedChat._id ? '#f5f7fd' : ''}
          onClick={() => hanldeSelectChat(chat)}
          className='cursor-pointer'
        >
          <Box   
            display={'flex'} 
            alignItems={'center'} 
            justifyContent={'space-between'}
          > 

            <Box 
              display={'flex'} 
              alignItems={'center'} 
              columnGap={1}
            >

              <IconButton size='small'>
                <ModeCommentOutlined />
              </IconButton>

              <Box>
                <Typography
                  className='text-break' 
                  variant='body2' 
                  color={'black'}
                  title={chat.chatName}
                >
                  {chat.chatName}
                </Typography>
                
                <LastMessageDisplay chat={chat} currentLoginUser={currentLoginUser} />

              </Box>

            </Box>
            
            <Box>
              {
                getLastMessage(chat._id)?.message?.createdAt &&
                <Typography 
                  mb={1}
                  variant='caption'
                  fontSize={8}
                  display={'flex'}
                >
                  {moment(getLastMessage(chat._id).message.createdAt).format('hh:mm A')}
                </Typography> 
              }

              {
                hasUnreadMessage(chat._id) &&
              <Box
                sx={{float:'right'}} 
                width={8}
                height={8}
                bgcolor={'darkred'} 
                borderRadius={'50%'} 
              />
              }
            </Box>

          </Box>
        </Box>
        )
      }

      {/* create chat form */}
      <Typography 
        variant='body' 
        textTransform={'uppercase'} 
        display={'flex'}
        justifyContent={'center'}
        className='cursor-pointer'
        onClick={() => setShowChatForm(!showChatForm)}
      >
        {
          !showChatForm ? <>
            <Polyline /> create new chat
          </>
            : <>
              <Close /> close 
            </>
        }
      </Typography>

      {
        showChatForm && 
        <Box position={'absolute'} right={0} top={1} left={0} zIndex={2}>
          <CreateChatForm  />
        </Box>
      }

    </Box>
  );
}
