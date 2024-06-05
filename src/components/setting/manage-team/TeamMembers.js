import React, { useState } from 'react';
import { Box, Chip, Avatar, Table, TableBody, TableCell, IconButton, TableContainer, TableHead, ButtonGroup, Button, TableRow, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { updateTeam } from '../../../reducers/team/teamSlice';
import { AdminPanelSettings, Chat, ContentCopy, GppBad, PersonRemove } from '@mui/icons-material';
import AlertDialog from '../../common/AlertDialog';
import { useDispatch } from 'react-redux';
import socket from '../../../utils/socket';
import { REMOVE_MEMBER_FROM_TEAM, TEAM_UPDATED, TEAM_UPDATED_GLOBAL, USER_UPDATED } from '../../../utils/socket-events';
import { getUserById, selectUser, updateUser } from '../../../reducers/auth/authSlice';

const cells = [
  'Name & Image',
  'Email',
  'Role',
  'User ID',
  'Action'
];

export default function TeamMembers({ team }) {

  const [removeMemberAlert, setRemoveMemberAlert] = useState(false);
  const [makeAdminALert, setMakeAdminAlert] = useState(false);
  const [removeAdminALert, setRemoveAdminAlert] = useState(false);
  const [selectedMember, setSelectedMember] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const currentLoginUser = useSelector(selectUser);

  const handleRemoveMember = async() => {
    try{
      toggleMemberAlert();
      setIsLoading(true);

      const user = await dispatch(getUserById(selectedMember.uid));

      const remining_team_joined = user.teamJoined.filter(teamJoined => teamJoined._id !== team._id).map(teamJoined => teamJoined._id);

      const remining_team_members = team.members.filter(member => member._id !== user._id).map(member => member._id);

      const updated_user = await dispatch(updateUser(user._id, {
        teamJoined: remining_team_joined
      }));

      const updated_team = await dispatch(updateTeam(team._id, {
        members: remining_team_members
      }));

      socket.emit(USER_UPDATED, updated_user);
      socket.emit(TEAM_UPDATED_GLOBAL, updated_team);
      socket.emit(TEAM_UPDATED, updated_team);

      socket.emit(REMOVE_MEMBER_FROM_TEAM, {
        userId: user._id,
        teamId: team._id
      });

    }catch(err){
      console.log(err);
    }
    setIsLoading(false);
  };

  const handleMakeAdmin = async() => {
    try{
      toggleMakeAdminAlert();
      setIsLoading(true);
      
      const adminsID = team.admins.map(admin => admin._id);

      const updated_team = await dispatch(updateTeam(team._id, {
        admins: [...adminsID, selectedMember._id]
      }));

      socket.emit(TEAM_UPDATED_GLOBAL, updated_team);
      socket.emit(TEAM_UPDATED, updated_team);
      
    }catch(err){
      console.log(err);
    }
    setIsLoading(false);
  };

  const handleRemoveAdmin = async() => {
    try{
      toggleRemoveAdminAlert();
      setIsLoading(true);
      
      const adminsID = team.admins.filter(admin => admin._id !== selectedMember._id).map(admin => admin._id);
      
      const updated_team = await dispatch(updateTeam(team._id, {
        admins: adminsID
      }));

      socket.emit(TEAM_UPDATED_GLOBAL, updated_team);
      socket.emit(TEAM_UPDATED, updated_team);
      
    }catch(err){
      console.log(err);
    }
    setIsLoading(false);
  };

  const copyToCliboard =  async(text) => {
    try{
      await navigator.clipboard.writeText(text);
    }catch(err){
      console.error(err);
    }
  };

  const toggleMemberAlert = () => {
    setRemoveMemberAlert(!removeMemberAlert);
  };

  const toggleMakeAdminAlert = () => {
    setMakeAdminAlert(!makeAdminALert);
  };

  const toggleRemoveAdminAlert = () => {
    setRemoveAdminAlert(!removeAdminALert);
  };

  const isAdmin = (userId) => {
    return team.admins.findIndex(admin => admin._id === userId) !== -1;
  };

  return (
    <>
      <TableContainer component={Box} bgcolor={'white'} border={true}>

        <Typography variant='body' ml={2} pt={1.5} display={'block'}>
          Members associated with <b>{team.name}</b>
        </Typography>

        <Table sx={{ width: '100%' }}>
          <TableHead>
            <TableRow>
              {
                cells.map(cel => <TableCell key={cel}>{cel}</TableCell>)
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {
              (team.members || []).map(member => (
                <TableRow
                  key={member._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Chip
                      avatar={<Avatar alt={member.name} src={member.photoURL} />}
                      label={member.name}
                      variant="outlined"
                    />
                  </TableCell>
                
                  <TableCell align="left">
                    {member.email}
                  </TableCell>

                  <TableCell align="left"
                    sx={{ color: team.createor._id === member._id ? 'darkred' : isAdmin(member._id) ? 'darkblue' : '' }}
                  >
                    { team.createor._id === member._id ? 'OWNER' : isAdmin(member._id) ? 'ADMIN' : 'MEMBER' }
                  </TableCell>

                  <TableCell align="left">
                    {member.uid?.slice(0,10)}..
                    <IconButton
                      size="small" 
                      onClick={() => copyToCliboard(member.uid)}
                    >
                      <ContentCopy />
                    </IconButton>
                  </TableCell>

                  <TableCell align="left">
                    <ButtonGroup size='small' color='secondary' variant="outlined" sx={{ boxShadow: 0 }}>

                      {
                        (team.createor._id !== member._id && currentLoginUser._id !== member._id ) && (isAdmin(currentLoginUser._id) || team.createor?._id === currentLoginUser._id) &&  <Button onClick={() =>{
                          toggleMemberAlert();
                          setSelectedMember(member);
                        }}
                        startIcon={<PersonRemove />}
                        disabled={isLoading}
                        >
                        Remove
                        </Button>
                      }
                      
                      <Button startIcon={<Chat />}>Chat</Button>
                      
                      { 
                        !isAdmin(member._id) &&  team.createor._id !== member._id && team.createor._id === currentLoginUser._id  &&  <Button
                          disabled={isLoading}
                          startIcon={<AdminPanelSettings />}
                          onClick={() => {
                            toggleMakeAdminAlert();
                            setSelectedMember(member);
                          }}
                        >
                         Make admin
                        </Button>
                      }
                      
                      { 
                        isAdmin(member._id) && team.createor._id === currentLoginUser._id  &&  <Button
                          disabled={isLoading}
                          startIcon={<GppBad />}
                          onClick={() => {
                            toggleRemoveAdminAlert();
                            setSelectedMember(member);
                          }}
                        >
                         Remove admin 
                        </Button>
                      }
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>

      {/* confirmation alert for remove member */}
      <AlertDialog
        open={removeMemberAlert}
        toggleDialog={toggleMemberAlert}
        title={'Are you sure?'}
        toggleConfirm={handleRemoveMember}
      />

      {/* confirmation alert for make admin */}
      <AlertDialog
        open={makeAdminALert}
        toggleDialog={toggleMakeAdminAlert}
        title={'Are you sure you want to make this person admin?'}
        toggleConfirm={handleMakeAdmin}
      />

      {/* confirmation alert for remove admin */}
      <AlertDialog
        open={removeAdminALert}
        toggleDialog={toggleRemoveAdminAlert}
        title={'Are you sure you want remove this person from admin ?'}
        toggleConfirm={handleRemoveAdmin}
      />
    </>
  );
}
