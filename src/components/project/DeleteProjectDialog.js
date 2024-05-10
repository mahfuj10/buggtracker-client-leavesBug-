import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProject, selectProject, setProject } from '../../reducers/project/projectSlice';
import socket from '../../utils/socket';
import { PROJECT_DELETED } from '../../utils/socket-events';

export default function DeleteProjectDialog({open, toggleDialog = () => {}}) {

  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentProject = useSelector(selectProject);
  const dispatch = useDispatch();

  const handleDeleteProject = async() => {
    try{
      setIsLoading(true);

      await dispatch(deleteProject(currentProject._id));

      socket.emit(PROJECT_DELETED, { projectId: currentProject._id });

      toggleDialog();
      dispatch(setProject({}));
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
             Please retype the project name <b>{currentProject.project_name}</b>
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
          disabled={projectName !== currentProject.project_name}
          onClick={handleDeleteProject}
        >
            Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
