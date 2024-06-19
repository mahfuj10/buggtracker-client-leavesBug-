import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import {  Box, Button, IconButton, InputBase, LinearProgress, Pagination, Typography } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Search, ViewCompact } from '@mui/icons-material';
import { selectUser } from '../../reducers/auth/authSlice';
import { useUtils } from '../../utils/useUtils';
import { getByCreator } from '../../reducers/task/taskSlice';
import UpdateTaskDrawer from '../task/update/UpdateTaskDrawer';
import { setTask } from '../../reducers/project/projectSlice';
import { selectTeam } from '../../reducers/team/teamSlice';

const cells = [
  'Title',
  'Due Date',
  'Action'
];

export default function MyTasks() {

  const [tasks, setTasks]  = useState([]);
  const [sprint, setSprint] = useState({});
  const [totalPage, setTotalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const inputRef = useRef(null);

  const currentLoginUser = useSelector(selectUser);
  const currentTeam = useSelector(selectTeam);
  
  const { debounce, displayDueDate } = useUtils();

  const dispatch = useDispatch();

  useEffect(() => {
    fetchTasks(currentPage);
  }, [dispatch]);
  
  const fetchTasks = async(page) => {
    try {
      setIsLoading(true);

      const response = await dispatch(getByCreator(currentLoginUser._id, page, inputRef.current.value));

      if(response && response.tasks){
        setTasks(response.tasks);
        setTotalPage(response.totalPages);
      }
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };

  const searchTask = () => {
    const handleTypingFinished = debounce(async() => {
      try{
        await fetchTasks(currentPage);
      }catch(err){
        console.error(err);
      }
    }, 1000);
    
    handleTypingFinished();
  };

  const handlePageChange = (_, page) => {
    setCurrentPage(page);
    fetchTasks(page);
  };

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const getSprint = (taskId) => {
    for (const project of currentTeam.projects) {
      for (const sprint of project.sprints) {
        const task = sprint.tasks.find(id => id === taskId);
        if (task) {
          setSprint(sprint);
          return sprint;
        }
      }
    }
    setSprint(null);
    return null;
  };

  return (
    <Box bgcolor={'white'} boxShadow={1}>

      <Box mx={1} pt={1} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
        <Typography fontSize={18}>Tasks You Created</Typography>

        <InputBase
          inputRef={inputRef}
          placeholder='Search...'
          onChange={searchTask}
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
              tasks.map((task) => (
                <TableRow
                  key={task._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {task.title}
                  </TableCell>


                  <TableCell align="left">
                    {task.due_date ? displayDueDate(task.due_date) : 'None'}
                  </TableCell>
                   

                  {/* <TableCell align="left">
                    {getCreatedDate(task.createdAt)}
                  </TableCell> */}
             
                  <TableCell align="left">
                    <Button 
                      startIcon={<ViewCompact />}
                      variant='outlined'
                      color='secondary'
                      size='small'
                      onClick={() => {
                        dispatch(setTask(task));
                        getSprint(task._id);
                        toggleDrawer();
                      }}
                    >
                      VIEW
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {
          totalPage > 1 && <Box display={'flex'} justifyContent={'end'} mb={1}>
            <Pagination
              size='small'
              onChange={handlePageChange}
              count={totalPage}
              color="secondary"
            />
          </Box>
        }

        <LinearProgress sx={{ height: 2, visibility: isLoading ? 'visible' : 'hidden' }} />
      </TableContainer>

      {/* update task drawer */}
      {
        sprint === null ?
          <Typography variant='body2'>Sprint not found.</Typography>
          :
          <UpdateTaskDrawer 
            open={openDrawer}
            toggleDrawer={toggleDrawer}
            sprint={sprint}
          /> 
      }
    </Box>
  );
}
