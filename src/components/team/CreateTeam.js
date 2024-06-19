import { Alert, Avatar, Box, Button, Chip, IconButton, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTeam, getTeamById, setLoading, updateMessage, updateTeam } from '../../reducers/team/teamSlice';
import { useUtils } from '../../utils/useUtils';
import { OVERVIEW } from '../../utils/path';
import { TEAM_INVITATION_SUBJECT, TEAM_INVITATION_TEMPLATE } from '../../utils/template';
import {  sendMail } from '../../reducers/email/emailSlice';
import { useNavigate } from 'react-router-dom';
import { isUserAlreadyExist, updateUser } from '../../reducers/auth/authSlice';
import { Add, Close } from '@mui/icons-material';
import { storage } from '../../services/firebase';
import socket from '../../utils/socket';
import { TEAM_UPDATED, USER_UPDATED } from '../../utils/socket-events';

export default function CreateTeam() {
  
  const [teamName, setTeamName] = useState('');
  const [step, setStep] = useState('first');
  const [emails, setEmails] = useState([]);
  const [email, setEmail] = useState('');
  const [createdTeamId, setCreatedTeamId] = useState('');
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');


  const dispatch = useDispatch();
  const navigate = useNavigate();

  const message = useSelector(state => state.team.message);
  const loading = useSelector(state => state.team.loading);
  const user = useSelector(state => state.auth.user);

  const { isEmailValid, addSpecialCharacters } = useUtils();
 
  const handleCreateTeam = async() => {
    try {
      if(!teamName?.trim()) return;
      if(teamName.length > 50) return dispatch(updateMessage('Max name length is 50.'));

      const res = await dispatch(createTeam({
        name: teamName,
        createor: user._id,
        members: [user._id],
        logo: imageUrl
      }));

      await dispatch(updateUser(user._id, {
        teamJoined: [...user.teamJoined, res.payload._id]
      }));

      setCreatedTeamId(res.payload._id);

      setStep('second');
    }catch(err){
      console.log(err);
    }
  };

  const getInvitationQueryURL = async(email) => {
    try {
      const res = await dispatch(isUserAlreadyExist(email));
      
      const url = `${process.env.REACT_APP_CLIENT_BASE_URL}/pending-invite/invitee=${addSpecialCharacters(email)}&new_user=${res.exists}&inviter=${user.uid}&team_id=${createdTeamId}`;

      return url;
    }catch(err){
      console.log(err);
    }
  };
  
  const sendInviteEmail = async(email) => {
    try {
      dispatch(setLoading(true));

      const redirect_url = await getInvitationQueryURL(email);

      await dispatch(sendMail({
        email,
        subject: TEAM_INVITATION_SUBJECT,
        template:  TEAM_INVITATION_TEMPLATE(user.photoURL, user.name, user.email, redirect_url)
      }));

      // if user exist in database then saving the team id in teamPending array
      const response = await dispatch(isUserAlreadyExist(email));

      if(response.exists){
        const updated_user = await dispatch(updateUser(
          response.user._id, 
          {
            teamInvited: [...response.user.teamInvited, createdTeamId]
          }
        ));

        const team = await dispatch(getTeamById(createdTeamId));

        const updated_team =   await dispatch(updateTeam(team._id, {
          pendingMembers: [...team.pendingMembers, response.user._id]
        }
        ));
        
        socket.emit(USER_UPDATED, updated_user);
        socket.emit(TEAM_UPDATED, updated_team);
      }


      dispatch(updateMessage('Invitation sent....!'));

    } catch(err){
      console.log(err);
      dispatch(updateMessage('Something went wrong..!'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSendInvite = () => {
    if(emails.length === 0) return alert('Add email first');
    for(const email of emails) sendInviteEmail(email);
  };

  const addEmail = () => {
    if(emails.includes(email)) return alert('email exist');
    if(!isEmailValid(email)) return alert('Invalid email');

    setEmails(prev => [...prev, email]);
    setEmail('');
  };

  const removeEmail = (email) => {
    const remining_emails = emails.filter(e => e !== email);
    setEmails(remining_emails);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImageUpload = () => {
    const uploadTask = storage.ref(`images/${file.name}`).put(file);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        console.log('object', snapshot);
        // Track progress here if needed
      },
      (error) => {
        console.error('Error uploading image:', error);
      },
      () => {
        storage
          .ref('images')
          .child(file.name)
          .getDownloadURL()
          .then((url) => {
            setImageUrl(url);
          });
      }
    );
  };

  return (
    <Box boxShadow={2} minWidth={300} padding={2.5} borderRadius={2}>

      {
        step === 'first' &&
        <Box marginBottom={2} display="flex" flexDirection="column" rowGap={2}>

          <Typography variant='h6' textAlign='left' fontWeight='bold'>
            Create Team
          </Typography>
          
          <Box >
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <button onClick={handleImageUpload}>Upload Image</button>

            {/* <CircularProgressWithLabel value={progress} /> */}
            {/* {cur.logo && <img src={cur.logo} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '300px' }} />} */}
            {
              imageUrl && <Avatar alt="team logo" src={imageUrl} 
                sx={{ width: 120, height: 120, borderRadius: 2 , mx:'auto', mt: 1}} 
              />
            }

          </Box>
          
          
          <TextField
            label="Team Name *"
            onChange={e => setTeamName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateTeam()}
            fullWidth
          />

          <Button disabled={loading} fullWidth variant="outlined" onClick={handleCreateTeam}>
            Create
          </Button>
        </Box>
      }
     
      {
        step === 'second' &&
        <Box marginBottom={2} display="flex" flexDirection="column" rowGap={2}>
          
          <Typography variant='h6' textAlign='left' fontWeight='bold'>
            Invite People
          </Typography>

          <Box display='flex' alignItems='center' gap={2} flexWrap='wrap' maxWidth={300}>
            {
              emails.map(email => <Chip 
                key={email}              
                variant="outlined" 
                size='small'
                onClick={()=>removeEmail(email)}
                icon={<Close />}
                label={email} 
              />
              )}
          </Box>

          <TextField
            label="Email *"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addEmail()}
            fullWidth
            value={email}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => addEmail()}>
                  <Add />
                </IconButton>
              ),
            }}
          />

          <Button disabled={loading} onClick={handleSendInvite} fullWidth variant="outlined">
            Invite
          </Button>
        </Box>
      }

      <Typography
        sx={{ textDecoration:'underline', cursor:'pointer'}}
        variant='caption'
        onClick={() => navigate(OVERVIEW)}
      >
          Home
      </Typography>

      { message && <Alert severity="info">{message}</Alert> }



    </Box>
  );
}
