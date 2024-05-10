import React, { useRef, useState } from 'react';
import { TextField, Box, Avatar, IconButton, Button, Typography, Chip, Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectTeam, setTeam, updateTeam } from '../../../reducers/team/teamSlice';
import { Close, FileUpload, Save } from '@mui/icons-material';
import { useUtils } from '../../../utils/useUtils';
import { storage } from '../../../services/firebase';
import ShareButton from '../../common/ShareButton';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../../reducers/auth/authSlice';

export default function TeamProfile() {
  const currentTeam = useSelector(selectTeam);

  const [newImageURL, setNewImageURL] = useState('');
  const [initialLogo, setInitialLogo] = useState(currentTeam?.logo);
  const [name, setName] = useState(currentTeam?.name);
  const [description, setDescription] = useState(currentTeam?.description);
  const [isLoading, setIsLoading] = useState(false);
  const fileInput = useRef(null);

  
  const { getCreatedDate } = useUtils();

  const dispatch = useDispatch();

  const getImageNameFromURL = (imageUrl) => {
    const urlParts = imageUrl.split('%2F'); // Split by "%2F" to get the image name
    const lastPart = urlParts[urlParts.length - 1]; // Last part after splitting
    const imageName = lastPart.split('?')[0]; // Remove query parameters, if any
    return imageName;
  };


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
        await deleteImage(getImageNameFromURL(newImageURL));
      }
  
      if(initialLogo){
        setInitialLogo('');
        await deleteImage(getImageNameFromURL(initialLogo));
      }
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleSave = async() => {
    try{
      setIsLoading(true);

      await dispatch(updateTeam(currentTeam._id, {
        logo: newImageURL || initialLogo,
        name: name,
        description: description
      }));

      dispatch(setTeam({
        ...currentTeam,
        logo: newImageURL || initialLogo,
        name: name,
        description: description
      }));
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
          defaultValue={name}
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
          defaultValue={description}
          onChange={e => setDescription(e.target.value)}
        />
      
        <Typography variant='body2'>Created on {getCreatedDate(currentTeam.createdAt)}</Typography>
        
        <Box>
            Created by
          <Chip
            sx={{ ml: 1 }}
            size='small'
            title={currentTeam.createor.email}
            avatar={<Avatar alt={currentTeam.createor.name} src={currentTeam.createor.photoURL} />}
            label={currentTeam.createor.name}
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
        sx={{borderRadius: 0.5, mt: 2}}
        disabled={isLoading}
      >
            save
      </Button>
      {/* <ShareButton socialMedia={'facebook'} url={'https://leaveschat.web.app'} /> */}

    </>
  );
}
