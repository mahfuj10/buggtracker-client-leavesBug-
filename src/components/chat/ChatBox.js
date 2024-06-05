import { Box, LinearProgress, Skeleton } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import ChatBoxHeader from './ChatBoxHeader';
import ChatBoxFooter from './ChatBoxFooter';
import { useDispatch } from 'react-redux';
import { deleteMessage, getMessages, readMessages } from '../../reducers/chat/chatSlice';
import Message from './Message/Message';
import { useSelector } from 'react-redux';
import { selectUser } from '../../reducers/auth/authSlice';
import socket from '../../utils/socket';
import { CHAT_MESSAGE_DELETE, MESSAGE_READ, SEND_CHAT_MESSAGE } from '../../utils/socket-events';

export default function ChatBox({ selectedChat }) {

  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [latestMessageLoading, setLatestMessageLoading] = useState(false);
  const [olderMessageLoading, setOlderMessageLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const dispatch = useDispatch();
  const currentLoginUser = useSelector(selectUser);
   
  
  const fetchLatestMessages = async () => {
    setLatestMessageLoading(true);
    try {
      const response = await dispatch(getMessages(selectedChat._id, 20));

      if(response){
        setMessages(response.messages); //.reverse()
        setHasMore(true);
        markAllMessagesAsRead(response.messages.reverse()); //.reverse()
        setTimeout(() => scrollToBottom(), 200); 
      }
    } catch (error) {
      console.error('Error fetching messages', error);
    } finally {
      setLatestMessageLoading(false);
    }
  };
  
  useEffect(() => {
    setHasMore(true);
    setMessages([]);
    fetchLatestMessages();
  }, [selectedChat]);

  const fetchOlderMessages = async () => {
    if (!hasMore || latestMessageLoading || olderMessageLoading) return;

    setOlderMessageLoading(true);
    try {

      const firstMessage = messages[0];
      console.log('2');
      const response =  await dispatch(getMessages(selectedChat._id, 20, firstMessage?.createdAt));

      if (response && response.messages.length === 0) {
        setHasMore(false);
      } else {
        setMessages(prevMessages => [...response.messages.reverse(), ...prevMessages]);
        markAllMessagesAsRead([...response.messages.reverse(), ...messages]);
        setTimeout(() => {
          containerRef.current.scrollTop += 100;
        }, 5);
      }
    } catch (error) {
      console.error('Error fetching older messages', error);
    } finally {
      setOlderMessageLoading(false);
    }
  };

  const handleScroll = () => {
    if (containerRef.current.scrollTop === 0) {
      // fetchOlderMessages();
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [window.scroll]);
 
  const scrollToBottom = () => {
    containerRef.current.style.scrollBehavior = 'smooth';
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  };

  const addMessage = newMessage => {
    setMessages(prev => [...prev, newMessage]);
    setTimeout(() => scrollToBottom(), 100);
  };

  // const updateMessageInState = (index, updatedMessage) => {
  //   setMessages(prevMessages => {
  //     const newMessages = [...prevMessages];
  //     newMessages[index] = updatedMessage;
  //     return newMessages;
  //   });
  // };

  const markAllMessagesAsRead = async (messages) => {
    try {
      const unreadMessageIds = messages
        .filter(message => !message.readBy.some(user => user?._id === currentLoginUser._id))
        .map(message => message._id);
        
      if (unreadMessageIds.length > 0) {
        setMessages(prevMessages =>
          prevMessages.map(message =>
            unreadMessageIds.includes(message._id)
              ? { ...message, readBy: [...message.readBy.map(user => user?._id), currentLoginUser._id] }
              : message
          )
        );

        socket.emit(MESSAGE_READ, {
          chatId: selectedChat._id
        });

        await dispatch(readMessages(unreadMessageIds, currentLoginUser._id));
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
 
  function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  useEffect(() => {
    socket.on(SEND_CHAT_MESSAGE, data => {
      console.log('SEND_CHAT_MESSAGE {ChatBox.js}', data);
      if(data.chatId === selectedChat._id && data.message.sender._id !== currentLoginUser._id){
        addMessage({
          ...data.message,
          readBy: [...data.message.readBy, currentLoginUser]
        });
      }
    });

    socket.on(CHAT_MESSAGE_DELETE, message => {
      console.log('CHAT_MESSAGE_DELETE {ChatBox.js}', message);
      if(message.chat._id === selectedChat._id){
        setMessages(prev => prev.filter(msg => msg._id !== message._id));
        dispatch(deleteMessage(message._id));
      }
    });

    return () => {
      socket.off(SEND_CHAT_MESSAGE);
      socket.off(CHAT_MESSAGE_DELETE);
    };
  }, [socket, selectedChat]);
   
  useEffect(() => {
    if (searchQuery) {
      const firstMatch = document.querySelector('.message.highlight');
      if (firstMatch) {
        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [searchQuery]);

  return (
    <Box 
      className='chat-area'
      m={1} 
      pb={4}
      borderRadius={2}
    >

      <Box>
        <ChatBoxHeader 
          setSearchQuery={setSearchQuery}
          selectedChat={selectedChat} 
        />

        <LinearProgress
          color="secondary"
          thickness={0.5}
          sx={{ opacity: olderMessageLoading ? 1 : 0 }} 
        />
      </Box>


      <Box
        display={'flex'}
        flexDirection={'column'}
        height={'calc(100% - 40px)'}
      >

        <Box overflow={'auto'}>
          {
            latestMessageLoading &&
          [1,2,3,4,5,6,7].map(item => <Box
            key={item} 
            display={'flex'} 
            justifyContent={item % 2 === 0 ? 'start':'end'} 
            m={1}
            mt={2}
          >
            <Skeleton 
              variant="rectangular"
              width={'45%'} 
              height={52} 
              animation='wave'
              sx={{ borderRadius: item % 2 === 0 ? '10px 10px 10px 0' : '10px 10px 0 10px' }} 
            />
            
          </Box> )
          }
        </Box>

        <Box 
          ref={containerRef} 
          flex={1}
          overflow={'auto'} 
          ml={2}
          mt={2}
          pr={2}
        >
          {
            messages.map((message, i) => {
              const highlightedText = highlightText(message.content, searchQuery);
              
              return (
                <div 
                  key={`${message._id}_${i}`}
                  className={`message ${highlightedText.includes('<mark>') ? 'highlight' : ''}`}
                >
                  <Message 
                    message={message}
                    highlightedText={highlightedText}
                    index={i}
                    allMessage={messages}
                  /> 
                </div>
              );
            }
            )
          }
          {/* <Message 
          key={`${message._id}_${i}`} 
          message={message}
          index={i}
          allMessage={messages}
        /> */}
          <div ref={messagesEndRef} />
        </Box>

        <ChatBoxFooter
          addMessage={addMessage}
          selectedChat={selectedChat}
        />

      </Box>
      
    </Box>
  );
}
