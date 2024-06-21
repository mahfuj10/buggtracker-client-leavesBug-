import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Avatar, Box, Button, Chip, IconButton, InputBase, LinearProgress, Typography } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ManageSearch, Search } from '@mui/icons-material';
import { selectUser } from '../../reducers/auth/authSlice';
import { useUtils } from '../../utils/useUtils';
import { useNavigate } from 'react-router-dom';
import { getProjectByCreator } from '../../reducers/project/projectSlice';
import { MANAGE_PROJECT } from '../../utils/path';

const cells = [
  'Project Name',
  'Team',
  'Sprints',
  'Created At',
  'Action'
];

export default function MyProjects() {

  const [projects, setProjects]  = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const currentLoginUser = useSelector(selectUser);
  
  const { debounce, getCreatedDate } = useUtils();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [dispatch]);
  
  const fetchProjects = async() => {
    try {
      setIsLoading(true);

      const response = await dispatch(getProjectByCreator(currentLoginUser._id, inputRef.current.value));

      setProjects(response);
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };

  const searchProject = () => {
    const handleTypingFinished = debounce(async() => {
      try{
        await fetchProjects();
      }catch(err){
        console.error(err);
      }
    }, 1000);
    
    handleTypingFinished();
  };

  return (
    <Box bgcolor={'white'} boxShadow={1}>

      <Box mx={1} pt={1} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
        <Typography fontSize={18}>Projects You Designed</Typography>

        <InputBase
          inputRef={inputRef}
          placeholder='Search...'
          onChange={searchProject}
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
              !projects.length &&
            <TableRow>
              <TableCell component="th" scope="row">
                <Typography> No any projects. </Typography>
              </TableCell>
            </TableRow>
            }

            {
              projects.map((project) => (
                <TableRow
                  key={project._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {project.project_name}
                  </TableCell>
              
                  <TableCell align="left">
                    <Chip
                      size='small'
                      avatar={<Avatar alt={project.team_id.name} src={project.team_id.logo} />}
                      label={project.team_id.name}
                      variant="outlined"
                    />
                  </TableCell>
              
                  <TableCell align="left">
                    <Box display={'flex'} flexWrap={'wrap'} gap={1}>
                      {
                        project.sprints.map(sprint =>  <Chip
                          key={sprint._id}
                          label={sprint.name}
                          size='small'
                          variant="outlined"
                        />)
                      }
                    </Box>
                  </TableCell>

                  <TableCell align="left">
                    {getCreatedDate(project.createdAt)}
                  </TableCell>
             
                  <TableCell align="left">
                    <Button 
                      startIcon={<ManageSearch />}
                      variant='outlined'
                      color='secondary'
                      size='small'
                      onClick={() => navigate(`${MANAGE_PROJECT}/${project._id}`)}
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
