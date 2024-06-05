import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProject, selectProject, setProject } from '../../reducers/project/projectSlice';
import socket from '../../utils/socket';
import { PROJECT_DELETED, TEAM_UPDATED } from '../../utils/socket-events';
import { useNavigate } from 'react-router-dom';
import { getTeamById, selectTeam } from '../../reducers/team/teamSlice';
import { HOME, MANAGE_PROJECT } from '../../utils/path';

export default function DeleteProjectDialog({open, toggleDialog = () => {}, project}) {

  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentTeam = useSelector(selectTeam);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDeleteProject = async() => {
    try{
      setIsLoading(true);

      await dispatch(deleteProject(project._id));
      const team = await dispatch(getTeamById(currentTeam._id));
      
      socket.emit(TEAM_UPDATED, team);
      socket.emit(PROJECT_DELETED, { projectId: project._id });
      
      const remining_project = (currentTeam.projects || []).filter(project => project._id !== project._id);


      toggleDialog();

      if(remining_project.length > 0){
        navigate(`${MANAGE_PROJECT}/${remining_project[remining_project.length - 1]._id}`);
      }else {
        navigate(HOME);
      }
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
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
            By deleteing the project you can not access this project again.
        </DialogContentText>
          
        <DialogContentText  mt={1}>
             Please retype the project name <b>{project.project_name}</b>
        </DialogContentText>

        <TextField 
          onPaste={e => e.preventDefault()}
          sx={{ mt: 2 }}
          variant='standard'
          size='small'
          fullWidth
          onChange={e => setProjectName(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={toggleDialog} color='success'>Close</Button>
        {isLoading && 'loading...'}
        <Button 
          autoFocus
          color='error'
          disabled={projectName !== project.project_name}
          onClick={handleDeleteProject}
        >
            Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
