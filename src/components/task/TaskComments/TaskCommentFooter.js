import { AttachmentOutlined, Close, Description } from '@mui/icons-material';
import { Box, IconButton, InputBase } from '@mui/material';
import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { selectUser } from '../../../reducers/auth/authSlice';
import { useUtils } from '../../../utils/useUtils';
import { storage } from '../../../services/firebase';
import EmojiPicker from '../../../components/common/EmojiPicker';
import { NEW_COMMENT } from '../../../utils/socket-events';
import { selectTask } from '../../../reducers/project/projectSlice';
import socket from '../../../utils/socket';
import { createComment } from '../../../reducers/comment/commentSlice';
import ObjectId from 'bson-objectid';


export default function TaskCommentFooter({ addComment }) {

  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mediaURLS, setMediaURLS] = useState([]);
  const fileInput = useRef(null);

  const currentLoginUser = useSelector(selectUser);
  const { getFileTypeFromUrl, getFileName }  = useUtils();
  const task = useSelector(selectTask);
  
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

      const objectId = new ObjectId().toHexString();

      const commentData = {
        sender: currentLoginUser,
        createdAt: Date.now(),
        content: content,
        media: mediaURLS,
        _id: objectId
      };

      socket.emit(NEW_COMMENT, {
        comment: commentData,
        taskId: task._id
      });

      addComment(commentData);
      setContent('');

      await dispatch(createComment({
        _id: objectId,
        taskId: task._id,
        sender: currentLoginUser._id,
        media: mediaURLS,
        content: commentData.content
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
          placeholder='Write your comment down...'
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
