import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, setUser, updateUser } from '../../../reducers/auth/authSlice';
import { Cached, ExitToApp, ManageSearch, RadioButtonChecked } from '@mui/icons-material';
import AlertDialog from '../../common/AlertDialog';
import { getTeamById, selectTeam, updateTeam, updateTeamState } from '../../../reducers/team/teamSlice';
import { TEAM_UPDATED, TEAM_UPDATED_GLOBAL } from '../../../utils/socket-events';
import socket from '../../../utils/socket';
import { MANAGE_TEAM } from '../../../utils/path';

const cells = [
  'Image',
  'Name',
  'Total Projects',
  'Total Member',
  'Switch',
  'Action'
];

export default function TeamJoined() {

  const [openDialog, setOpenDialog] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedTeam, setSelectedTeam] = React.useState({});

  const currentLoginUser = useSelector(selectUser);
  const currentTeam = useSelector(selectTeam);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleDialog = () => {
    setOpenDialog(!openDialog);
  };

  const leaveTeam = async() => {
    try{
      toggleDialog();

      const team = await dispatch(getTeamById(selectedTeam._id));

      const remining_memebers = team.members.filter(member => member._id !== currentLoginUser._id);
      const remining_memeber_ids = remining_memebers.map(member => member._id);
      const team_joined_ids = currentLoginUser.teamJoined.filter(t => t._id !== team._id).map(t => t._id);

      const updated_team =  await dispatch(updateTeam(team._id, {
        members: remining_memeber_ids
      }));

      socket.emit(TEAM_UPDATED, updated_team);
      socket.emit(TEAM_UPDATED_GLOBAL, updated_team);

      const updated_user = await dispatch(updateUser(currentLoginUser._id, {
        teamJoined: team_joined_ids
      }));

      dispatch(setUser(updated_user));

      if(team_joined_ids.length > 0){
        localStorage.setItem('team_id', team_joined_ids && team_joined_ids[0]);
      }

    }catch(err){
      console.error(err);
    }
  };

  const switchTeam = async(team) => {
    try{
      setIsLoading(true);

      await dispatch(updateTeamState(team._id));
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };  

  return (
    <TableContainer component={Box}>
      
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            {
              cells.map(cell => <TableCell key={cell} align="left">
                {cell}
              </TableCell>)
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {(currentLoginUser.teamJoined || []).map((team) => (
            <TableRow
              key={team._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <Avatar 
                  sx={{borderRadius: 2, backgroundColor:'#f5f7fd', color:'black'}} 
                  alt={team.name} 
                  src={team.logo || 'L'} 
                />
              </TableCell>
              
              <TableCell align="left">
                {team.name}
              </TableCell>
              
              <TableCell align="left">
                <IconButton size='small'>
                  {team.projects?.length}
                </IconButton>
              </TableCell>

              <TableCell align="left">
                <IconButton size='small'>
                  {team.members?.length}
                </IconButton>
              </TableCell>
             
              <TableCell align="left">
                <Button 
                  onClick={() => switchTeam(team)}
                  startIcon={currentTeam._id === team._id  ? <RadioButtonChecked /> : <Cached />}
                  variant='outlined'
                  size='small'
                  disabled={currentTeam._id === team._id || isLoading}
                > 
                  {
                    currentTeam._id === team._id ? 'Active' : 'Switch'
                  }
                </Button>
              </TableCell>
              
              <TableCell align="left">
                {
                  currentLoginUser._id === team.createor._id ?
                    <Button 
                      startIcon={<ManageSearch />}
                      variant='outlined'
                      color='primary'
                      size='small'
                      onClick={() => navigate(`${MANAGE_TEAM}/${team._id}`)}
                    >
                      Manage
                    </Button>
                    :
                    <Button 
                      onClick={() => {
                        setSelectedTeam(team),
                        toggleDialog();
                      }}
                      startIcon={<ExitToApp />}
                      variant='outlined'
                      color='error'
                      size='small'
                    >
                     Leave
                    </Button>
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* confirmation alert */}
      <AlertDialog
        open={openDialog}
        title={'Are you sure you want to leave?'}
        content="By leaving this team you can't join again untill someone invite you."
        toggleDialog={toggleDialog}
        toggleConfirm={leaveTeam}
      />

     
    </TableContainer>
  );
}
