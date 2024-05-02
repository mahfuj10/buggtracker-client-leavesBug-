import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTeamAndReferences, selectTeam, updateTeamState } from '../../../reducers/team/teamSlice';
import { selectUser } from '../../../reducers/auth/authSlice';
import { sendMail } from '../../../reducers/email/emailSlice';
import { TEAM_DELETE_CONFIRMATION_SUBJECT, TEAM_DELETE_CONFIRMATION_TEMPLATE } from '../../../utils/template';

export default function DeleteTeamDialog({ open, toggleDialog = () => {}, selectedTeam }) {

  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentTeam = useSelector(selectTeam);
  const currentLoginUser = useSelector(selectUser);

  const dispatch = useDispatch();
  
  const deleteTeam = async() => {
    try {
      setIsLoading(true);

      await dispatch(deleteTeamAndReferences(selectedTeam._id));

      if(currentTeam._id === selectedTeam._id && currentLoginUser.teamJoined?.length > 1){
        await  dispatch(updateTeamState(currentLoginUser.teamJoined[0]._id));
      }

      // send to group creator
      await dispatch(sendMail({
        email: selectedTeam.createor.email,
        subject: TEAM_DELETE_CONFIRMATION_SUBJECT,
        template:  TEAM_DELETE_CONFIRMATION_TEMPLATE(selectedTeam.name, selectedTeam.createor.name, selectedTeam.createor.email)
      }));

      // also send to admins
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
    toggleDialog();
  };
 
  return (
    <Dialog
      open={open}
      onClose={toggleDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
          Are you sure ? 
      </DialogTitle>
        
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
            By deleteing the team you can not access the team again. <br /> You will lost all project access which include this team.
        </DialogContentText>
          
        <DialogContentText  mt={1}>
             Please retype the team name <b>{selectedTeam.name}</b>
        </DialogContentText>

        <TextField 
          onPaste={e => e.preventDefault()}
          sx={{ mt: 2 }}
          variant='standard'
          size='small'
          fullWidth
          onChange={e => setTeamName(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={toggleDialog} color='success'>Close</Button>
        {isLoading && 'loading...'}
        <Button 
          autoFocus
          color='error'
          disabled={teamName !== selectedTeam.name}
          onClick={deleteTeam}
        >
            Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
