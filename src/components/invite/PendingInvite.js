import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../App.css';
import { useDispatch, useSelector } from 'react-redux';
import { getUserById, isUserAlreadyExist, selectUser, setUser, updateUser } from '../../reducers/auth/authSlice';
import { getTeamById, updateTeam, setTeam as setCurrentTeam } from '../../reducers/team/teamSlice';
import { Avatar, Box, Button, Chip, Tooltip } from '@mui/material';
import { useUtils } from '../../utils/useUtils';
import { HOME, LOGIN } from '../../utils/path';
import Loader from '../common/Loader/Loader';
import { TEAM_UPDATED, TEAM_UPDATED_GLOBAL } from '../../utils/socket-events';
import socket from '../../utils/socket';

export default function PendingInvite() {

  const [inviter, setInviter] = useState({});
  const [invitee, setInvitee] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [team, setTeam] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { path } = useParams();

  const { removeSpecialCharacters } = useUtils();
  const currentLoginUser = useSelector(selectUser);
  

  async function fetchData(){
    try{
      setIsFetching(true);

      const inviter = await dispatch(getUserById(getParameterValue('inviter', path)));
      const team = await dispatch(getTeamById(getParameterValue('team_id', path))); 
      
      const inviteeEmail = removeSpecialCharacters(getParameterValue('invitee', path));
      const has_account = await dispatch(isUserAlreadyExist(inviteeEmail));

      if(has_account.exists){
        const inviteeMember = await dispatch(getUserById(has_account.user.uid));
        setInvitee(inviteeMember);
      }

      setInviter(inviter);
      setTeam(team);
    }catch(err) {
      console.log(err);
    }
    setIsFetching(false);
  }

  useEffect( () => {
    fetchData();
  }, []);

  useEffect( () => {
    socket.on(TEAM_UPDATED_GLOBAL, (updated_team) => {
      if(team._id === updated_team._id){
        setTeam(updated_team);
      }
    });
  }, [socket]);


  const handleAcceptInvite = async() => {
    try {
      setIsLoading(true);

      const remining_team_invited = invitee.teamInvited.filter(teamInvited => teamInvited._id !== team._id).map(teamInvited => teamInvited._id);
      
      const team_joined = invitee.teamJoined.filter(teamJoined => teamJoined._id !== team._id).map(teamJoined => teamJoined._id);
      
      const team_pending_members = team.pendingMembers.filter(member => member._id !== invitee._id).map(member => member._id);
      
      const team_members = team.members.filter(member => member._id !== invitee._id).map(member => member._id);
      
      const updated_user = await dispatch(updateUser(invitee._id, {
        teamInvited: remining_team_invited, 
        teamJoined: [...team_joined, team._id]
      }));
      
      const updated_team = await dispatch(updateTeam(team._id, {
        pendingMembers: team_pending_members, 
        members: [...team_members, invitee._id]
      }));

      if(updated_user.teamJoined && updated_user.teamJoined.length !== 0){
        localStorage.setItem('team_id', updated_team._id);
        dispatch(setCurrentTeam(updated_team));
      }
      
      socket.emit(TEAM_UPDATED, updated_team);
      socket.emit(TEAM_UPDATED_GLOBAL, updated_team);

      dispatch(setUser(updated_user));
      navigate(HOME);
    }catch(err){
      console.log(err);
    }
    setIsLoading(false);
  };

  function getParameterValue(parameter, queryString) {
    const params = new URLSearchParams(queryString);
    return params.get(parameter);
  }

  if(isFetching) {
    return <Loader />;
  }

  const isValidInvitation = () => {
    return (team.pendingMembers || []).findIndex(member => member._id === currentLoginUser._id) !== -1;
  };

  return (
    <div className='invite-container'>
      
      <div className="invite-text">
        <h2>You&apos;re invited to join <b>{team.name}</b></h2>
        
        <p>You&apos;ve been invited to join our project team. We&apos;re excited to have you onboard!</p>
        
        {team.logo && <img src={team.logo} style={{borderRadius: '5px'}} alt="team_logo" width="120" />}

        

        <Box mt={2}>
          Invited by:  
          <Tooltip title={inviter.email} placement="top"> 
            <Chip
              sx={{ ml: 1 }}
              avatar={<Avatar alt={inviter.name} src={inviter.photoURL} />}
              label={`${inviter.name}`}
              size='small'
              variant="outlined"
            /> 
          </Tooltip>
        </Box>
      </div>
      
      { !currentLoginUser?.uid ? 
        <div className="login-button">
          <p>Please log in to accept the invitation.</p>
          <Button variant="outlined" onClick={()=>navigate(LOGIN)}>
               Login
          </Button>
        </div>
        :
        isValidInvitation() 
          ?
          <div className="login-button">
            <Button disabled={isLoading} variant="outlined" onClick={handleAcceptInvite}>
               Accept
            </Button>
          </div>
          :
          <div>
            <h5 style={{color:'red', textAlign:'center'}}>*** Invitation expired ***</h5>
            <p style={{ textAlign:'center'}}>For further details please contact with invitor</p>
          </div>
      }
    </div>
  );
}
