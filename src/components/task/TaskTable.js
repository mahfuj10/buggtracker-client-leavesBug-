import { Avatar, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import FlagIcon from '@mui/icons-material/Flag';
import React, { useState } from 'react';
import { Add, Adjust, ChatBubbleOutline } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { selectDragging, selectSprint, setTask } from '../../reducers/project/projectSlice';
import UpdateTaskDrawer from './update/UpdateTaskDrawer';
import { Draggable } from 'react-beautiful-dnd';


export default function TaskTable({ status }) {
  const cells = ['Name', 'Assignee', 'Due date', 'Priority', 'Status', 'Comments'];

  const sprint = useSelector(selectSprint);
  const isDragging = useSelector(selectDragging);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false); // for update task drawer

  const toggleDrawer = () => {
    setOpen(!open);
  };
 
  return (
    <>
      <TableContainer component={Box}>
        <Table  aria-label="simple table">
          <TableHead>
            <TableRow>
              {
                cells.map((cell) => (
                  <TableCell
                    sx={{
                      fontSize: 12,
                      color: '#656f7d',
                    }}
                    key={cell}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      columnGap={0.2}
                      className="task_cell_container cursor-pointer"
                    >
                      {cell}
                      <SwapVertIcon className="sort_icon" fontSize="12px" />
                    </Box>
                  </TableCell>
                ))
              }
            </TableRow>
          </TableHead>

          <TableBody>
            {(sprint.tasks || [])
              .filter(
                (task) => task.status?.name === status.name
              )
              .map((task, index) => (
                <Draggable
                  draggableId={task._id.toString()}
                  key={task._id}
                  index={index}
                >
                  {(provided) => (
                    <TableRow
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      className="cursor-pointer"
                      onClick={() => {
                        toggleDrawer();
                        dispatch(setTask(task));
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {task.title}
                      </TableCell>

                      <TableCell align="right">
                        <Box display="flex" alignItems="center" columnGap={0.5}>
                          {task.assigns.map((assign) => (
                            <Avatar
                              key={assign._id}
                              sx={{ width: 25, height: 25 }}
                              alt={assign.name}
                              src={assign.photoURL}
                            />
                          ))}
                        </Box>
                      </TableCell>

                      <TableCell align="left" sx={{ fontSize: 13, color: '#656f7d' }}>
                            Jun 26
                      </TableCell>

                      <TableCell align="left">
                        <Box display="flex" alignItems="center" columnGap={0.5}>
                          <FlagIcon fontSize="13px" /> {task.priority && task.priority.name}
                        </Box>
                      </TableCell>

                      <TableCell align="left">
                        <Button
                          startIcon={<Adjust />}
                          sx={{
                            boxShadow: 0,
                            py: 0.2,
                            px: 1,
                            fontSize: 10,
                            backgroundColor: task.status.color,
                          }}
                          variant="contained"
                          size="small"
                          className="pointer-events-none"
                        >
                          {task.status.name}
                        </Button>
                      </TableCell>

                      <TableCell align="left">
                        <Box display="flex" alignItems="center" columnGap={0.5}>
                          <ChatBubbleOutline fontSize="13px" sx={{ color: '#656f7d' }} />
                          <span style={{ fontSize: 13, color: '#656f7d' }}>2</span>
                        </Box>
                      </TableCell>
                      {provided.placeholder}
                    </TableRow>
                  )}
                </Draggable>
              ))}

            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 }, opacity: isDragging ? 0 : 1, transition:'0.5s' }}
            >
              <TableCell component="th" scope="row">
                <Typography 
                  className='cursor-pointer'
                  fontSize={12}
                  display='flex'
                  alignItems='center'
                  columnGap={0.5}
                  color='#656f7d'
                  mt={-1}
                >
                  <Add fontSize='12px' /> Add Task
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* update task drawer */}
      <UpdateTaskDrawer 
        open={open} 
        toggleDrawer={toggleDrawer}
      />
    </>
  );
}
