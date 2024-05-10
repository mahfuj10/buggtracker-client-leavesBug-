import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import { Avatar, Button, Checkbox, IconButton, Paper, Typography } from '@mui/material';
import { useUtils } from '../../utils/useUtils';
import { TASK_DELETED } from '../../utils/socket-events';
import { DeleteOutline, Edit } from '@mui/icons-material';
import AlertDialog from '../common/AlertDialog';
import socket from '../../utils/socket';
import { useSelector } from 'react-redux';
import { selectProject, selectSprint } from '../../reducers/project/projectSlice';

const cells = [
  'Task title',
  'Assignes',
  'Due date',
  'Action'
];
  
export default function ManageProjectTasksTable() {

  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  
  const sprint = useSelector(selectSprint) ?? {};
  const project = useSelector(selectProject);
  const { calculateDaysRemaining } = useUtils();

  const selectAll = () => {
    const ids = sprint.tasks.map(task => task._id);
    setSelectedTaskIds(ids);
  };

  const handleSelectTask = (checked, taskId) => {
    if(!selectedTaskIds.includes(taskId)){
      setSelectedTaskIds(prev => [...prev, taskId]);
    }
    if(selectedTaskIds.includes(taskId)){
      setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId));
    }
  };

  const toggleDialog = () => {
    setOpenDialog(!openDialog);
  };

  const handleDeleteTasks = async() => {
    try{
      // console.log('object');
      const res =  socket.emit(TASK_DELETED, {
        projectId: project._id,
        sprintId: sprint._id,
        taskIds: selectedTaskIds
      });

      console.log(res);
    }catch(err){
      console.log(err);
    }
  };

  return (
    <>
      <TableContainer component={Paper}>

        <Box pt={1} px={1} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
          <Typography variant='body2'>Task assoicate with <b>{ sprint.name}</b></Typography>

          <Button 
            sx={{ opacity: selectedTaskIds.length ? 1 : 0 }} 
            variant='outlined' 
            color='error' 
            size='small' 
            startIcon={<DeleteOutline />}
            onClick={toggleDialog}
          >
           Delete
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
          
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  onClick={e => {
                    e.target.checked 
                      ?
                      selectAll()
                      :
                      setSelectedTaskIds([]);
                  }}
                />
              </TableCell>

              {
                cells.map((cell, i) => <TableCell key={`${cell}-${i}`}>
                  {cell}
                </TableCell>)
              }
            </TableRow>
          </TableHead>

          <TableBody>
            { 
              sprint.tasks 
            && 
            sprint.tasks.map((task,i) => <TableRow key={`${task._id}-${i}`}>
              <TableCell  component="th" scope="row">
                <Checkbox
                  checked={selectedTaskIds.includes(task._id)}
                  onChange={(e) => handleSelectTask(e.target.checked, task._id)}
                  color="primary"
                />
              </TableCell>
              
              <TableCell  component="th" scope="row">{task.title}</TableCell>
              
              <TableCell  component="th" scope="row">
                {
                  task.assigns?.length ?
                    <Box display="flex" alignItems="center" columnGap={0.5}>
                      { 
                        task.assigns.map((assign) => (
                          <Avatar
                            key={assign._id}
                            sx={{ width: 25, height: 25 }}
                            alt={assign.name}
                            src={assign.photoURL}
                          />
                        ))
                      }
                    </Box>
                    : 
                    'not asssign'    
                }
              </TableCell>

              <TableCell  component="th" scope="row">
                {
                  task.due_date ?
                    <Box display={'flex'} alignItems={'center'} columnGap={1}>
                      <IconButton size='small' sx={{ border: '1px dashed black' , width: 25, height: 25 }}>
                        { calculateDaysRemaining(new Date(), task.due_date) }
                      </IconButton>
                    days
                    </Box>
                    :
                    'no due date'
                }
              </TableCell>

              <TableCell>
                <IconButton size='small' sx={{ width: 20, height: 20, }}>
                  <DeleteOutline />
                </IconButton>
                <IconButton size='small' sx={{ width: 20, height: 20, ml: 1 }}>
                  <Edit />
                </IconButton>
              </TableCell>

            </TableRow>)
            }
          </TableBody>

        </Table>
      </TableContainer>


      {/* confirmation alert to delete sprint */}
      <AlertDialog
        open={openDialog}
        title={'Are you sure you?'}
        toggleDialog={toggleDialog}
        toggleConfirm={handleDeleteTasks}
      />
    </>
  );
}
