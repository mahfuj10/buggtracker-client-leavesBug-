import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../reducers/auth/authSlice';
import { useDispatch } from 'react-redux';
import { getTeamByCreator, selectTeam, updateTeamState } from '../../reducers/team/teamSlice';
import { Avatar, Box, Button, IconButton, InputBase, LinearProgress, Typography } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Cached, ManageSearch, RadioButtonChecked, Search } from '@mui/icons-material';
import { MANAGE_TEAM } from '../../utils/path';
import { useNavigate } from 'react-router-dom';
import { useUtils } from '../../utils/useUtils';

const cells = [
  'Image',
  'Name',
  'Total Projects',
  'Total Member',
  'Created At',
  'Switch',
  'Action'
];

export default function MyTeams() {

  const [teams, setTeams]  = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const currentLoginUser = useSelector(selectUser);
  const currentTeam = useSelector(selectTeam);
  
  const { debounce, getCreatedDate } = useUtils();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, [dispatch]);
  
  const fetchTeams = async() => {
    try {
      setIsLoading(true);

      const response = await dispatch(getTeamByCreator(currentLoginUser._id, inputRef.current.value));
    
      setTeams(response);
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
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

  const searchTeam = () => {
    const handleTypingFinished = debounce(async() => {
      try{
        await fetchTeams();
      }catch(err){
        console.error(err);
      }
    }, 1000);
    
    handleTypingFinished();
  };

  return (
    <Box bgcolor={'white'} boxShadow={1}>

      <Box mx={1} pt={1} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
        <Typography fontSize={18}>Teams Created by You</Typography>

        <InputBase
          inputRef={inputRef}
          placeholder='Search...'
          onChange={searchTeam}
          endAdornment={(
            <IconButton
              size='small' 
              onClick={() => inputRef.current && inputRef.current.focus()}
            >
              <Search />
            </IconButton>
          )
          }
        />
      </Box>

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
            {
              !teams.length &&
            <TableRow>
              <TableCell component="th" scope="row">
                <Typography> No any teams. </Typography>
              </TableCell>
            </TableRow>
            }

            {
              teams.map((team) => (
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
                    {getCreatedDate(team.createdAt)}
                  </TableCell>
             
                  <TableCell align="left">
                    <Button 
                      onClick={() => switchTeam(team)}
                      startIcon={currentTeam._id === team._id  ? <RadioButtonChecked /> : <Cached />}
                      variant='outlined'
                      size='small'
                      color='secondary'
                      disabled={currentTeam._id === team._id || isLoading}
                    > 
                      {
                        currentTeam._id === team._id ? 'Active' : 'Switch'
                      }
                    </Button>
                  </TableCell>
              
                  <TableCell align="left">
                    <Button 
                      startIcon={<ManageSearch />}
                      variant='outlined'
                      color='primary'
                      size='small'
                      onClick={() => navigate(`${MANAGE_TEAM}/${team._id}`)}
                    >
                      Manage
                    </Button>
                     
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <LinearProgress sx={{ height: 2, visibility: isLoading ? 'visible' : 'hidden' }} />
      </TableContainer>
    </Box>
  );
}
