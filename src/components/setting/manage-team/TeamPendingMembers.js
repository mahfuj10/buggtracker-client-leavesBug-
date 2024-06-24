import { Add, Close, DeleteOutline, Email, Send } from '@mui/icons-material';
import { Avatar, Box, Button, ButtonGroup, Chip, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import { useUtils } from '../../../utils/useUtils';
import { useDispatch } from 'react-redux';
import { getUserById, isUserAlreadyExist, selectUser, updateUser } from '../../../reducers/auth/authSlice';
import { useSelector } from 'react-redux';
import { sendMail } from '../../../reducers/email/emailSlice';
import { TEAM_INVITATION_REMINDER_SUBJECT, TEAM_INVITATION_REMINDER_TEAMPLATE, TEAM_INVITATION_SUBJECT, TEAM_INVITATION_TEMPLATE, TEAM_INVITATION_WITHDRAW_SUBJECT, TEAM_INVITATION_WITHDRAW_TEAMPLATE } from '../../../utils/template';
import { getTeamById, updateTeam } from '../../../reducers/team/teamSlice';
import socket from '../../../utils/socket';
import { TEAM_UPDATED_GLOBAL, USER_UPDATED } from '../../../utils/socket-events';


const cells = [
  'Name & Image',
  'Email',
  'Action'
];

  
export default function TeamPendingMembers({ team }) {
  
  const [emails, setEmails] = useState([]);
  const [isInviteBoxOpen, setIsInviteBoxOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const emailInput = useRef(null);
  
  const { isEmailValid, addSpecialCharacters }  = useUtils();
  const currentLoginUser = useSelector(selectUser);
  const dispatch = useDispatch();

  const isEmailExist = (email) => {
    return emails.findIndex(e => e === email) !== -1 && team.pendingMembers.findIndex(member => member.email ===  email) !== -1 && team.members.findIndex(member => member.email ===  email) !== -1;
  };

  const addEmail = () => {
    const email =  emailInput.current.value;

    if(!isEmailValid(email)) return alert('Invalid email');
    if(isEmailExist(email)) return alert('email exist');

    setEmails(prev => [...prev, email]);
    emailInput.current.value = '';
  };

  const removeEmail = (email) => {
    const remining_emails = emails.filter(e => e !== email);
    setEmails(remining_emails);
  };

  const toggle = () => {
    setIsInviteBoxOpen(!isInviteBoxOpen);
  };


  const getInvitationQueryURL = async(email) => {
    try {
      const res = await dispatch(isUserAlreadyExist(email));
      
      const url = `${process.env.REACT_APP_CLIENT_BASE_URL}/pending-invite/invitee=${addSpecialCharacters(email)}&new_user=${res.exists}&inviter=${currentLoginUser.uid}&team_id=${team._id}`;

      return url;
    }catch(err){
      console.log(err);
    }
  };
  
  const sendInviteEmail = async(email) => {
    try {
      setIsLoading(true);

      const redirect_url = await getInvitationQueryURL(email);

      await dispatch(sendMail({
        email,
        subject: TEAM_INVITATION_SUBJECT,
        template:  TEAM_INVITATION_TEMPLATE(currentLoginUser.photoURL, currentLoginUser.name, currentLoginUser.email, redirect_url, team.logo)
      }));

      // if user exist in database then saving the team id in teamPending array
      const response = await dispatch(isUserAlreadyExist(email));
      console.log(response);
      if(response.exists){
        const updated_user = await dispatch(updateUser(
          response.user._id, 
          {
            teamInvited: [...response.user.teamInvited, team._id]
          }
        ));

        const updated_team = await dispatch(updateTeam(team._id, {
          pendingMembers: [...team.pendingMembers, response.user._id]
        }
        ));
        
        // socket.emit(USER_UPDATED, updated_user);
        socket.emit(TEAM_UPDATED_GLOBAL, updated_team);
      }

    } catch(err){
      console.log(err);
    }
    setIsLoading(false);
  };

  const handleSendInvite = async () => {
    for(const email of emails) await sendInviteEmail(email);
    setEmails([]);
    toggle();
  };


  const remindToPendingMember = async(member) => {
    try{

      setIsLoading(true);

      const redirect_url = await getInvitationQueryURL(member.email);

      await dispatch(sendMail({
        email: member.email,
        subject: TEAM_INVITATION_REMINDER_SUBJECT,
        template:  TEAM_INVITATION_REMINDER_TEAMPLATE(member.name, redirect_url, currentLoginUser.name)
      }));

    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };

  const withdrawInvite = async(member) => {
    try {
      setIsLoading(true);

      const response = await dispatch(getTeamById(team._id));
      const user = await dispatch(getUserById(member.uid));

      const remining_pending_members = response.pendingMembers.filter(member => member._id !== user._id);
      
      const remining_team_invited = user.teamInvited.filter(teamInvited => teamInvited._id !== response._id);

      const updated_team = await dispatch(updateTeam(response._id, {
        pendingMembers: remining_pending_members.map(member => member._id)
      }));

      const updated_user = await dispatch(updateUser(user._id, {
        teamInvited: remining_team_invited.map(team => team._id)
      }));

      await dispatch(sendMail({
        email: user.email,
        subject: TEAM_INVITATION_WITHDRAW_SUBJECT(team.name),
        template:  TEAM_INVITATION_WITHDRAW_TEAMPLATE(user.name, currentLoginUser.name, currentLoginUser.email)
      }));

      socket.emit(TEAM_UPDATED_GLOBAL, updated_team);
      socket.emit(USER_UPDATED, updated_user);
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <>

      <TableContainer position={'relative'} boxShadow={1} component={Box} bgcolor={'white'} border={true}>

        <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
          <Typography variant='body' ml={2} pt={1} display={'block'}>
          Pending members for <b>{team.name}</b>
          </Typography>

          <Button
            variant='outlined'
            size='small'
            startIcon={<Email />}
            onClick={toggle}
          >
            Invite people
          </Button>
        </Box>

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
              team.pendingMembers && !team.pendingMembers.length &&
            <TableRow>
              <TableCell component="th" scope="row">
                <Typography> No any pending members. </Typography>
              </TableCell>
            </TableRow>
            }

            {
              (team.pendingMembers || []).map(member => (
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

                  <TableCell align="left">
                    <ButtonGroup disabled={isLoading} variant="outlined" color='secondary' size='small'>
                      <Button onClick={() => remindToPendingMember(member)}>REMIND</Button>
                      <Button onClick={() => withdrawInvite(member)}>Withdraw</Button>
                    </ButtonGroup>
                  </TableCell>

                </TableRow>
              ))
            }
          </TableBody>
        </Table>

        {
          isInviteBoxOpen && (
            <Box
              position="absolute"
              zIndex={1}
              width="100%"
              height="100%"
              top={0}
              left={0}
              backgroundColor="rgba(255, 255, 255, 0.5)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box>

                <IconButton 
                  onClick={toggle}
                  sx={{ position: 'absolute', left: 0, top: 0 }} 
                  size='small'
                >
                  <Close />
                </IconButton>

                <Box mb={1.5} display='flex' alignItems='center' gap={2} flexWrap='wrap' maxWidth={300}>
                  {
                    emails.map(email => <Chip 
                      key={email}              
                      variant="outlined" 
                      size='small'
                      onDelete={()=>removeEmail(email)}
                      deleteIcon={<DeleteOutline />}
                      label={email} 
                    />
                    )}
                </Box>

                <Box display={'flex'} alignItems={'center'}>
                  <TextField
                    label="Email *"
                    inputRef={emailInput}
                    size='small'
                    sx={{ bgcolor:'white', display:'block' }}
                    onKeyDown={e => e.key === 'Enter' && addEmail()}
                    InputProps={{
                      endAdornment: (
                        <IconButton size='small' onClick={() => addEmail()}>
                          <Add />
                        </IconButton>
                      ),
                    }}
                  />

                  <Button
                    startIcon={<Send />}
                    size='medium'
                    variant='outlined'
                    color='success'
                    onClick={handleSendInvite}
                    disabled={isLoading || !emails.length}
                  >
                    Send Invite
                  </Button>

                </Box>
              </Box>
            </Box>
          )
        }
      </TableContainer>


    </>
  );
}
