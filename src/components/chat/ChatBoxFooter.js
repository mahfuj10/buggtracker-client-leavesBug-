import { AttachmentOutlined, Close, Description } from '@mui/icons-material';
import { Box, IconButton, InputBase } from '@mui/material';
import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../reducers/auth/authSlice';
import { saveMessage } from '../../reducers/chat/chatSlice';
import { useDispatch } from 'react-redux';
import socket from '../../utils/socket';
import { SEND_CHAT_MESSAGE } from '../../utils/socket-events';
import EmojiPicker from '../common/EmojiPicker';
import { storage } from '../../services/firebase';
import { useUtils } from '../../utils/useUtils';

export default function ChatBoxFooter({ selectedChat, addMessage }) {

  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mediaURLS, setMediaURLS] = useState([]);
  const fileInput = useRef(null);

  const currentLoginUser = useSelector(selectUser);
  const { getFileTypeFromUrl, getFileName }  = useUtils();
  const dispatch = useDispatch();

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    
    setIsLoading(true);

    const uploadTask = storage.ref(`images/${file.name}`).put(file);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        console.log('snapshot---->', snapshot);
      },
      (error) => {
        setIsLoading(false);
        console.error('Error uploading image:', error);
      },
      () => {
        storage
          .ref('images')
          .child(file.name)
          .getDownloadURL()
          .then((url) => {
            setMediaURLS([...mediaURLS, url]);
            setIsLoading(false);
          });
      }
    );
  };

  const openFile = () => {
    fileInput && fileInput.current.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const sendMessage = async() => {
    try {
      if(!content && !mediaURLS.length) return;

      const messageData = {
        sender: currentLoginUser,
        chat: selectedChat,
        createdAt: Date.now(),
        content: content,
        readBy: [currentLoginUser],
        media: mediaURLS,
        _id: `${Math.random() *  8788}YU`
      };

      socket.emit(SEND_CHAT_MESSAGE, {
        message: messageData,
        chatId: selectedChat._id
      });

      addMessage(messageData);
      setContent('');

      await dispatch(saveMessage({
        sender: currentLoginUser._id,
        chat: selectedChat._id,
        readBy: [currentLoginUser._id],
        media: mediaURLS,
        content: messageData.content
      }));

      setMediaURLS([]);
      
    }catch(err){
      console.error(err);
    }
  };


  const onEmojiClick = emoji => {
    setContent(prev => prev + emoji);
  };

  const removeMedia = URL => {
    setMediaURLS(prev => prev.filter(mediaURL => mediaURL !== URL));
  };

  return (
    <>
      {/* uploaded media */}
      
      <Box width={'100%'} display={'flex'} ml={1} columnGap={2} flexWrap={'wrap'} mb={1}>
        {
          mediaURLS.map((media, i) => (
            <Box key={media+i} display={'flex'} alignItems={'center'} width={200} columnGap={0.5}>
              
              <Description sx={{mt: 1}} />
              
              <Box>
                <p 
                  style={{fontSize: 10, marginBottom: -4}} 
                  className='text-break'
                  title={getFileName(media)}
                >
                  {getFileName(media)}
                </p>

                <small
                  style={{fontSize: 8}}
                >
                  {getFileTypeFromUrl(media)}
                </small>
              </Box>

              <IconButton size='small' onClick={() => removeMedia(media)}> 
                <Close fontSize='10px' /> 
              </IconButton>
            </Box>
          ))
        }
      </Box>

      <Box 
        bgcolor={'#f5f7fd'} 
        display={'flex'} 
        alignItems={'center'} 
        mx={1.5} 
        borderRadius={1.5}
        p={0.7}
      >

        <InputBase
          value={content}
          fullWidth
          placeholder='Type your message here'
          sx={{pl: 2}} 
          onKeyDown={handleKeyDown}
          onChange={e => setContent(e.target.value)}
        />
      
        <input 
          style={{ position: 'absolute', visibility:'hidden' }} 
          ref={fileInput}
          type='file'
          onChange={e => handleImageUpload(e)}
        />

        <IconButton size='small' disabled={isLoading} onClick={openFile}>
          <AttachmentOutlined />
        </IconButton>
      
        <EmojiPicker
          onEmojiClick={onEmojiClick}
        />

      </Box>
    </>
  );
}
