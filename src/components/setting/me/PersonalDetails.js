import React from 'react';
import { Avatar, Box, IconButton, InputBase, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../reducers/auth/authSlice';
import { useUtils } from '../../../utils/useUtils';
import { ContentPaste } from '@mui/icons-material';

export default function PersonalDetails() {

  const currentLoginUser = useSelector(selectUser);
  const { getCreatedDate } = useUtils();

  const copyToCliboard =  async(text) => {
    try{
      await navigator.clipboard.writeText(text);
    }catch(err){
      console.error(err);
    }
  };

  return (
    <>
      <Typography variant='h6'>Personal Information</Typography>

      <Avatar
        sx={{ my: 1.5 }}
        alt={currentLoginUser.name} 
        src={currentLoginUser.photoURL}
      />


      <Box display={'flex'} flexDirection={'column'} rowGap={2}>

        <Box display={'flex'} alignItems={'center'} columnGap={8}>
          <Typography variant='body2' color={'#656f7d'}>Display Name</Typography>
  
          <InputBase defaultValue={currentLoginUser.name} sx={{ fontSize: 14, mt: 0.5}} size='small' />
        </Box>


        <Box display={'flex'} alignItems={'center'} columnGap={14.7}>
          <Typography variant='body2' color={'#656f7d'}>Email</Typography>
  
          <Typography sx={{ color: '#FF8C00'}} variant='body2'>
            {currentLoginUser.email}

            <IconButton size='small' onClick={() => copyToCliboard(currentLoginUser.email)}>
              <ContentPaste sx={{ fontSize: 15 }} />
            </IconButton>
          </Typography>
        </Box>



        <Box display={'flex'} alignItems={'center'} columnGap={10}>
          <Typography variant='body2' color={'#656f7d'}>Joined Date</Typography>
 
          <Typography variant='body2'>{getCreatedDate(currentLoginUser.createdAt)}</Typography>
        </Box>

        <Box display={'flex'} alignItems={'center'} columnGap={7.5}>
          <Typography variant='body2' color={'#656f7d'}>Phone Number</Typography>
  
          <InputBase defaultValue={'+88 0'} sx={{ fontSize: 14, mt: 0.5}} size='small' />
        </Box>

        <Box display={'flex'} alignItems={'center'} columnGap={13.5}>
          <Typography variant='body2' color={'#656f7d'}>User ID</Typography>
  
          <Typography variant='body2'>
            {currentLoginUser.uid}

            <IconButton size='small' onClick={() => copyToCliboard(currentLoginUser.uid)}>
              <ContentPaste sx={{ fontSize: 15 }} />
            </IconButton>
          </Typography>
        </Box>

      </Box>
    </>
  );
}
