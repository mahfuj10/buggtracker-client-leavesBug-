import React, { useEffect, useRef, useState } from 'react';
import { TextField, Box, Avatar, IconButton, Button, Typography, Chip } from '@mui/material';
import { updateTeam } from '../../../reducers/team/teamSlice';
import { Close, FileUpload, Save } from '@mui/icons-material';
import { useUtils } from '../../../utils/useUtils';
import { storage } from '../../../services/firebase';
import { useDispatch } from 'react-redux';
import socket from '../../../utils/socket';
import { TEAM_UPDATED, TEAM_UPDATED_GLOBAL } from '../../../utils/socket-events';
import { sendNotification } from '../../Notification/Notification';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../reducers/auth/authSlice';
import { NOTIFICATION_IMAGE } from '../../../utils/notification-images';

export default function TeamProfile({ team }) {
  const [newImageURL, setNewImageURL] = useState('');
  const [initialLogo, setInitialLogo] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInput = useRef(null);

  const { getCreatedDate, getFileName } = useUtils();

  const dispatch = useDispatch();
  const currentLoginUser = useSelector(selectUser);

  useEffect(() => {
    if(team){
      setInitialLogo(team.logo);
      setName(team.name);
      setDescription(team.description);
    }
  }, [team]);

  const deleteImage = async (imageName) => {
    try {
      const imageRef = storage.ref(`images/${imageName}`);
      await imageRef.delete();
      console.log('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error; // Rethrow the error to handle it outside this function if needed
    }
  };

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
            setNewImageURL(url);
            setIsLoading(false);
          });
      }
    );
  };

  const removeLogo = async() => {
    try{
      setIsLoading(true);

      if(newImageURL){
        setNewImageURL('');
        await deleteImage(getFileName(newImageURL));
      }
  
      if(initialLogo){
        setInitialLogo('');
        await deleteImage(getFileName(initialLogo));
      }
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleSave = async() => {
    try{
      setIsLoading(true);

      const updated_team = await dispatch(updateTeam(team._id, {
        logo: newImageURL || initialLogo,
        name: name,
        description: description
      }));

      sendNotification(
        dispatch,
        team._id,
        team.members.map(member => member._id),
        [currentLoginUser._id],
        NOTIFICATION_IMAGE,
        `${currentLoginUser.name} made changes in ${team.name}`
      );

      socket.emit(TEAM_UPDATED, updated_team);
      socket.emit(TEAM_UPDATED_GLOBAL, updated_team);
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };

  const openFile = () => {
    fileInput && fileInput.current.click();
  };

  return (
    <>
        
      <Box 
        display={'flex'}
        flexDirection={'column'}
        rowGap={2}
      >

        <Box mb={1} display={'flex'} alignItems={'start'} columnGap={5}>
          <img
            src={newImageURL || initialLogo} 
            style={{ width: 150, borderRadius: 5}} 
          />        

          <input 
            style={{ position: 'absolute', visibility:'hidden' }} 
            ref={fileInput}
            type='file'
            accept="image/*"
            onChange={e => handleImageUpload(e)}
          />

          <Box display={'flex'} flexDirection={'column'} columnGap={1}>

            <IconButton disabled={isLoading} onClick={openFile}>
              <FileUpload />
            </IconButton>

            <IconButton disabled={isLoading} onClick={removeLogo}>
              <Close />
            </IconButton>

          </Box>
        </Box>

        <TextField 
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
          label="Team Name (Mandatory)"
          variant="outlined"
        />

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      
        <Typography variant='body2'>Created on {getCreatedDate(team.createdAt)}</Typography>
        
        <Box>
            Created by
          <Chip
            sx={{ ml: 1 }}
            size='small'
            title={team.createor.email}
            avatar={<Avatar alt={team.createor.name} src={team.createor.photoURL} />}
            label={team.createor.name}
            variant="outlined"
          />
        </Box>



      </Box>
   
      <Button 
        variant='outlined' 
        startIcon={<Save />} 
        size='small' 
        color='success'
        onClick={handleSave}
        sx={{borderRadius: 0.5, mt: 2, px: 5}}
        disabled={isLoading}
      >
            save
      </Button>
      {/* <ShareButton socialMedia={'facebook'} url={'https://leaveschat.web.app'} /> */}

    </>
  );
}
