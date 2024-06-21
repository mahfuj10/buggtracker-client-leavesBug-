import { Avatar, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import FlagIcon from '@mui/icons-material/Flag';
import React, { useEffect, useState } from 'react';
import { Adjust, ChatBubbleOutline } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { selectDragging, setTask } from '../../../reducers/project/projectSlice';
import { Draggable } from 'react-beautiful-dnd';
import { useUtils } from '../../../utils/useUtils';
import { getCommentCount as getCommentCountAPI } from '../../../reducers/comment/commentSlice';


export default function TaskTable({ tasks, toggleUpdateTaskDrawer = () => { } }) {
  const cells = ['Name', 'Assignee', 'Due date', 'Priority', 'Status', 'Comments'];
  const [commentCounts, setCommentCounts] = useState({});

  const isDragging = useSelector(selectDragging);
  const dispatch = useDispatch();
  
  const { displayDueDate } = useUtils();

  useEffect(() => {
    const fetchAllCommentCounts = async () => {
      const counts = {};
      for (const task of tasks) {
        try {
          const response = await dispatch(getCommentCountAPI(task._id));
          counts[task._id] = response ? response.count : 0;
        } catch (err) {
          console.error(err);
          counts[task._id] = 0;
        }
      }
      setCommentCounts(counts);
    };

    fetchAllCommentCounts();
  }, [tasks, dispatch]);

  return (
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
          {(tasks || []).map((task, index) => (
            <Draggable
              draggableId={task._id.toString()}
              key={`${task._id}-${index}`}
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
                    toggleUpdateTaskDrawer();
                    dispatch(setTask(task));
                  }}
                >
                  <TableCell component="th" scope="row">
                    {task.title}
                  </TableCell>

                  <TableCell align="right">
                    <span style={{ display: 'flex', alignItems: 'center', columnGap: '5px' }}>
                      {
                        task.assigns.map((assign) => assign && (
                          <Tooltip key={assign._id} arrow title={assign.name}>
                            <Avatar
                              sx={{ width: 25, height: 25 }}
                              alt={assign.name}
                              src={assign.photoURL}
                            />
                          </Tooltip>
                        ))
                      } 
                    </span>
                  </TableCell>

                  <TableCell align="left" sx={{ fontSize: 13, color: '#656f7d' }}>
                    {displayDueDate(task.due_date)}
                  </TableCell>

                  <TableCell align="left">
                    { task.priority ? <Box 
                      display={'flex'}
                      color={'#656f7d'} 
                      alignItems={'center'}
                      columnGap={'5px'}
                      textTransform={'uppercase'}
                    >
                      <FlagIcon sx={{ fontSize: 18, color: task.priority.color }} /> {task.priority.name}
                    </Box> 
                      :
                      <Box color={'#656f7d'}>Not Added</Box> 
                    }
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
                    <span style={{ display: 'flex', alignItems: 'center', columnGap: '5px' }}>
                      <ChatBubbleOutline fontSize="13px" sx={{ color: '#656f7d' }} />
                      <span style={{ fontSize: 13, color: '#656f7d' }}>
                        {commentCounts[task._id] || 0}
                      </span>
                    </span>
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
                {/* <Add fontSize='12px' /> Add Task */}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
