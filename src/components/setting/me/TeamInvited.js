import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {  Box, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, updateUser, setUser, getUserById } from '../../../reducers/auth/authSlice';
import { getTeamById, updateTeam } from '../../../reducers/team/teamSlice';
import AlertDialog from '../../common/AlertDialog';
import { sendMail } from '../../../reducers/email/emailSlice';
import { TEAM_INVITATION_REJECT_SUBJECT, TEAM_INVITATION_REJECT_TEMPLATE } from '../../../utils/template';
import socket from '../../../utils/socket';
import { TEAM_UPDATED, USER_UPDATED } from '../../../utils/socket-events';

const rows = [
  'Team Name',
  'Team Size',
  'Decline',
  'Accept'
];

export default function TeamInvited() {

  const [selectedTeam, setSelectedTeam] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
    
  const currentLoginUser = useSelector(selectUser);
  const dispatch = useDispatch();

  const declineTeamInvite = async() => {
    try {
      setIsLoading(true);
      toggleDialog();

      const res = await dispatch(getTeamById(selectedTeam._id));

      const remining_pending_members = res.pendingMembers.filter(member => member._id !== currentLoginUser._id);
      const remining_team_invited = currentLoginUser.teamInvited.filter(team => team._id !== res._id);

      await dispatch(updateTeam(res._id, {
        pendingMembers: remining_pending_members
      }));

      await dispatch(updateUser(currentLoginUser._id, {
        teamInvited: remining_team_invited
      }));

      await dispatch(sendMail({
        email: selectedTeam.createor.email,
        subject: TEAM_INVITATION_REJECT_SUBJECT,
        template: TEAM_INVITATION_REJECT_TEMPLATE(selectedTeam.createor.name, currentLoginUser.name)
      }));

      dispatch(setUser({
        ...currentLoginUser,
        teamInvited: remining_team_invited, 
      }));  
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };

  const acceptTeamInvite = async(teamId) => {
    try{
      setIsLoading(true);

      const team = await dispatch(getTeamById(teamId));
      console.log(team);
      if(!team) return Promise.reject('err');

      const remining_team_invited = currentLoginUser.teamInvited.filter(item => item._id !== team._id);
      const team_joined = currentLoginUser.teamJoined.filter(item => item._id !== team._id);
      const team_pending_members = team.pendingMembers.filter(member => member._id !== currentLoginUser._id);
      const team_members = team.members.filter(member => member._id !== currentLoginUser._id);

      await dispatch(updateUser(currentLoginUser._id, {
        teamInvited: remining_team_invited, 
        teamJoined: [...team_joined, team._id]
      }));
      
      const updated_team = await dispatch(updateTeam(team._id, {
        pendingMembers: team_pending_members, 
        members: [...team_members, currentLoginUser._id]
      }));

      dispatch(setUser({
        ...currentLoginUser,
        teamInvited: remining_team_invited,
        teamJoined: team_joined
      }));      

      socket.emit(TEAM_UPDATED, updated_team);
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };

  const toggleDialog = () => {
    setOpenDialog(!openDialog);
  };

  useEffect(() => {
    socket.on(USER_UPDATED, (user) => {
      // if(currentLoginUser.uid === user.uid){
      console.log('updated_user_from_socket {TeamInvited.js}', user);
      dispatch(setUser(user));
      // }
    });
  },[socket]);

  return (
    <TableContainer component={Box}>
      
      <Table sx={{ width: '100%' }}>
        
        <TableHead>
          <TableRow>
            {
              rows.map(row => <TableCell key={row} align="left">{row}</TableCell>)
            }
          </TableRow>
        </TableHead>
        

        <TableBody>
          {(currentLoginUser.teamInvited || []).map((team) => (
            <TableRow
              key={team._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {team.name}
              </TableCell>
              
              <TableCell align="left">
                {team.members.length}
              </TableCell>
              
              <TableCell align="left">
                <Button 
                  size='small'
                  variant='outlined' 
                  color='error'
                  disabled={isLoading}
                  onClick={() => {
                    toggleDialog(),
                    setSelectedTeam(team);
                  }}
                >
                    Decline
                </Button>
              </TableCell>

              <TableCell align="left">
                <Button 
                  size='small'
                  variant='outlined'
                  color='success'
                  disabled={isLoading}
                  onClick={() => acceptTeamInvite(team._id)}
                >
                    Accept
                </Button>
              </TableCell>
             
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* confirmation alert */}
      <AlertDialog
        open={openDialog}
        title={'Are you sure you want to reject?'}
        toggleDialog={toggleDialog}
        toggleConfirm={declineTeamInvite}
      />
    </TableContainer>
  );
}
