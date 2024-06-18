import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../reducers/auth/authSlice';
import { Avatar, Box, IconButton, Tooltip, Typography } from '@mui/material';
import moment from 'moment';
import EmojiPicker from '../../common/EmojiPicker';
import { useDispatch } from 'react-redux';
import { updateMessage } from '../../../reducers/chat/chatSlice';
import socket from '../../../utils/socket';
import { CHAT_MESSAGE_DELETE, CHAT_MESSAGE_UPDATE } from '../../../utils/socket-events';
import { DeleteOutline } from '@mui/icons-material';
import MessageMedia from './MessageMedia';


export default function Message({ message, allMessage, index = 0, highlightedText }) {
  
  const [aggregatedReactions, setAggregatedReactions] = useState([]);
  const [reactions, setReactions] = useState([]);

  const currentLoginUser = useSelector(selectUser);
  const dispatch = useDispatch();

  if(!message?.sender) return 'No message';

  useEffect(() => {
    setReactions(message.reactions);
  },[]); 

  useEffect(() => {
    if (reactions && reactions.length > 0) {
      const populatedReactions = reactions.map(reaction => ({
        ...reaction,
        user: currentLoginUser._id === reaction.user._id ? currentLoginUser : {},
      }));
      setAggregatedReactions(aggregateReactions(populatedReactions));
    }
  }, [reactions]);

  useEffect(() => {
    socket.on(CHAT_MESSAGE_UPDATE, updatedMsg => {
      if(message._id === updatedMsg._id){
        setReactions(updatedMsg.reactions);
      }
      
      return () => {
        socket.off(CHAT_MESSAGE_UPDATE);
      };
    });
  },[socket]);

  const onEmojiClick = async(emoji) => {
    try {
      if(!emoji) return;
      console.log(reactions);
      const currentUserReactionIndex = reactions.findIndex(react => react.user?._id === currentLoginUser._id);
      console.log(currentUserReactionIndex);
      const emojiIndex = reactions.findIndex(react => react.reaction === emoji);
      console.log(emojiIndex);
      if(emojiIndex !== -1 && currentUserReactionIndex !== -1){
        setReactions(prev => {
          const reactions = [...prev];
          reactions.splice(emojiIndex, 1);
          emitAndUpdateMessage({ ...message, reactions });
          return reactions;
        }); 
      }

      if(currentUserReactionIndex !== -1 && emojiIndex === -1){
        setReactions(prev => {
          const reactions = [...prev];
          reactions[currentUserReactionIndex].reaction = emoji;
          emitAndUpdateMessage({ ...message, reactions });
          return reactions;
        }); 
      } 

      if(currentUserReactionIndex === -1 && emojiIndex === -1) {
        setReactions(prev => {
          const reactions = [...prev];
          reactions.push({reaction: emoji, user: currentLoginUser});
          emitAndUpdateMessage({ ...message, reactions });
          return reactions;
        }); 
      }

    }catch(err){
      console.error(err);
    }
  };

  const aggregateReactions = (reactions) => {
    const reactionMap = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.reaction]) {
        acc[reaction.reaction] = {
          count: 0,
          users: [],
        };
      }
      acc[reaction.reaction].count += 1;
      acc[reaction.reaction].users.push(reaction.user.name);
      return acc;
    }, {});
    
    return Object.entries(reactionMap).map(([reaction, { count, users }]) => ({
      reaction,
      count,
      users,
    }));
  };

  const emitAndUpdateMessage = async(updatedMsg) => {
    socket.emit(CHAT_MESSAGE_UPDATE, updatedMsg);
    await dispatch(updateMessage(message._id,  updatedMsg));
  };

  const isMe = () => {
    return currentLoginUser._id === message.sender._id;
  };

  const formatTimestamp = (timestamp) => {
    return moment(timestamp).format('MMM DD [AT] HH:mm');
  };

  const formatTime = (timestamp) => {
    return moment(timestamp).format('HH:mm');
  };

  const shouldShowSenderName = () => {
    if (index === allMessage.length - 1) return true;

    const currentMessage = allMessage[index];
    const nextMessage = allMessage[index + 1];

    return currentMessage.sender._id !== nextMessage.sender._id;
  };
   
  const shouldShowDate = () => {
    if (index === 0) return true; // Show date for the first message

    const currentMessageDate = new Date(allMessage[index].createdAt).toDateString();
    const previousMessageDate = new Date(allMessage[index - 1].createdAt).toDateString();

    return currentMessageDate !== previousMessageDate;
  };
   
  const shouldShowTime = () => {
    if (index === 0) return false; 
    const currentMessageDate = formatTime(allMessage[index].createdAt);
    const previousMessageDate = formatTime(allMessage[index - 1].createdAt);

    return currentMessageDate !== previousMessageDate;
  };

  const emitDeleteMessage = () =>  {
    socket.emit(CHAT_MESSAGE_DELETE, message);
  };

  const renderSenderDetails = (message) => {
    return (
      <Box mb={0.5} display={'flex'} alignItems={'start'}>
        {
          currentLoginUser._id !== message.sender._id && <Avatar 
            src={message.sender.photoURL} 
            sx={{ width: 20, height: 20, mt: -0.5 }}  
          />
        }

        {/* {
          message.readBy?.length > 0 &&  currentLoginUser._id !== message.sender._id &&
          <Typography variant='caption' color={'gray'} fontSize={8}>
            Seen by {message.readBy.length} person
          </Typography>
        } */}
      </Box>
    );
  };

  return (
    <>
      {
        shouldShowDate(index) && <Typography
          variant='caption' 
          fontSize={10} 
          display={'block'} 
          textAlign={'center'}
          mb={1}
        >
          {formatTimestamp(message.createdAt).toUpperCase()}
        </Typography>
      }

      {
        !shouldShowDate(index) && shouldShowTime(index) && <Typography 
          variant='caption'
          fontSize={10}
          color={'gray'} 
          display={'block'}
          textAlign={'center'}
        >
          {formatTime(message.createdAt)}
        </Typography>
      }

      <Box 
        display={'flex'}
        justifyContent={isMe() ? 'end' : 'start'}
        mb={1}
        ml={1}
        sx={{
          ':hover .option-icon': {
            visibility: 'visible'
          }
        }}
      >

        <Box maxWidth={'40%'} position={'relative'} order={isMe() ? 2 : 0}>
          <Tooltip title={`${moment(message.createdAt).fromNow()}`} arrow>
            <Box 
              color={isMe() && message.content ? 'white' : 'black' } 
              bgcolor={message.content ? (isMe() ? '#007d7d' : '#eaecf1') : 'transparent'}
              px={message.content ? 2 : 0}
              py={message.content ? 0.8 : 0}
              textAlign={'justify'}
              borderRadius={
                isMe() && shouldShowSenderName(index) ? '10px' :
                  !isMe() && shouldShowSenderName(index) ? '10px 10px 10px 0px' : '7px'
              }
            >
              <Typography fontSize={12}  dangerouslySetInnerHTML={{ __html: highlightedText }} />

              <MessageMedia media={message.media} />
              
            </Box>
          </Tooltip>

          <Box position={'absolute'} bottom={-10} sx={isMe() ? {left: 0} : {right: 0}}>
            {aggregatedReactions.map((aggReaction, index) => (
              <Tooltip key={index} title={aggReaction.users.join(', ')} arrow>
                <Typography variant="caption">
                  {aggReaction.reaction} {aggReaction.count > 1 ? `${aggReaction.count} ` : ''}
                </Typography>
              </Tooltip>
            ))}
            
          </Box>

        </Box>

        <Box
          order={1} 
          ml={isMe() ? 0 : 0.5 } 
          mr={isMe() ? 0.5 : 0 } 
          visibility={'hidden'} 
          className='option-icon'
        >
          <IconButton
            size='small' 
            onClick={emitDeleteMessage}
          >
            <DeleteOutline
              fontSize='18px'
            />
          </IconButton>

          <EmojiPicker 
            reactionsDefaultOpen={true}
            onEmojiClick={onEmojiClick}
            closeOnClick={true}
          />
        </Box>     
      </Box>

      <Box display={'flex'} justifyContent={isMe() ? 'end' : 'start'}>
        { shouldShowSenderName(index) && renderSenderDetails(message) }
      </Box>
    </>
  
  );
}
