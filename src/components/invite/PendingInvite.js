import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../App.css';
import { useDispatch, useSelector } from 'react-redux';
import { getUserById, isUserAlreadyExist, selectUser, setUser, updateUser } from '../../reducers/auth/authSlice';
import { getTeamById, updateTeam } from '../../reducers/team/teamSlice';
import { Button } from '@mui/material';
import { useUtils } from '../../utils/useUtils';
import { HOME, LOGIN } from '../../utils/path';
import Loader from '../common/Loader/Loader';
import { TEAM_UPDATED } from '../../utils/socket-events';
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
      const has_user = await dispatch(isUserAlreadyExist(inviteeEmail));

      if(has_user.exists){
        setInvitee(has_user.user);
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


  const handleAcceptInvite = async() => {
    try {
      setIsLoading(true);

      const remining_team_invited = invitee.teamInvited.filter(id => id !== team._id);
      const team_joined = invitee.teamJoined.filter(id => id !== team._id);
      const team_pending_members = team.pendingMembers.filter(id => id !== invitee._id);
      const team_members = team.members.filter(id => id !== invitee._id);
      
      await dispatch(updateUser(invitee._id, {
        teamInvited: remining_team_invited, 
        teamJoined: [...team_joined, team._id]
      }));
      
      const updated_team = await dispatch(updateTeam(team._id, {
        pendingMembers: team_pending_members, 
        members: [...team_members, invitee._id]
      }));

      if(currentLoginUser.teamJoined && currentLoginUser.teamJoined.length === 0){
        localStorage.setItem('team_id', updated_team._id);
      }
      
      const user = await dispatch(getUserById(currentLoginUser.uid));
      
      socket.emit(TEAM_UPDATED, updated_team);
      dispatch(setUser(user));
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
  // console.log(path);
  return (
    <div className='invite-container'>
      
      <div className="invite-text">
        <h2>You&apos;re invited to join <b>{team.name}</b></h2>
        <p>You&apos;ve been invited to join our project team. We&apos;re excited to have you onboard!</p>
        <img src={inviter.photoURL} style={{borderRadius: '50%'}} alt="Invitor Image" width="100" />
        <p>Invited by: {inviter.name} ({inviter.email})</p>
      </div>
      
      { !currentLoginUser?.uid ? 
        <div className="login-button">
          <p>Please log in to accept the invitation.</p>
          <Button variant="outlined" onClick={()=>navigate(LOGIN)}>
               Login
          </Button>
        </div>
        :
        <div className="login-button">
          <Button disabled={isLoading} variant="outlined" onClick={handleAcceptInvite}>
               Accept
          </Button>
        </div>
      }
    </div>
  );
}
