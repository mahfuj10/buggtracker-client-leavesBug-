import { Adjust, ChatBubble, Flag, KeyboardArrowDown, KeyboardArrowUp, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import moment from 'moment';
import React from 'react';
import { useDispatch } from 'react-redux';
import { setTask } from '../../../reducers/project/projectSlice';

export default function BoardTaskList({ tasks, moveTask, toggleUpdateDrawer = () => {} }) {
  
  const dispatch = useDispatch();

  return (
    <>
      {
        tasks.map((task, i) => (
          <Box
            key={`${task._id}-${i}`}
            p={1}
            onClick={() => {
              toggleUpdateDrawer(),
              dispatch(setTask(task));
            }}
            mt={2}
            className='cursor-pointer'
            borderRadius={1}
            boxShadow={'0 2px 2px -2px gray'}
            borderBottom={i % 3 === 2 ? '1px solid #005353' : ''}
            bgcolor={i % 3 === 2 ? 'rgba(135, 206, 235, 0.2)' : ''}
            position={'relative'}
            sx={{
              ':hover':{
                '.navigate-icons':{
                  opacity: 1,
                  transition: '0.5s'
                }
              }
            }}
          >
            <Box 
              className='navigate-icons'
              position={'absolute'}
              right={0}
              onClick={e => e.stopPropagation()}
              sx={{ opacity: 0 }}
            >
              <IconButton size='small' onClick={() => moveTask('prev', task)}>
                <NavigateBefore fontSize='12px'  />
              </IconButton>      
           
              <IconButton size='small' onClick={() => moveTask('next', task)}>
                <NavigateNext fontSize='12px'  />
              </IconButton>      
            </Box>

            <Typography variant='h6' className='text-break'>
              {task.title}
            </Typography>
                                  
            <Typography
              variant='body2'
              color={'gray'}
              className='text-break'
              fontSize={12}
            >
              {task.createor.name}, {moment(task.createdAt).fromNow()}
            </Typography>

            <div 
              className='text-break-task-description'
              style={{fontSize: 12, lineHeight: 1.5, textAlign:'justify'}}
              dangerouslySetInnerHTML={{ __html: task.description }} 
            />

            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'space-between'}
            >
              {
                task.task_type && <Typography
                  variant='body2'
                  textTransform={'uppercase'}
                  color={task.status.color}
                >
                    #{task.task_type}
                </Typography>
              }

              <Box 
                display={'flex'} 
                onClick={e => e.stopPropagation()} 
                className='navigate-icons'
                sx={{ opacity: 0 }}
              >
                <IconButton size='small' onClick={() => moveTask('down', task)}>
                  <KeyboardArrowDown fontSize='12px'  />
                </IconButton>      
           
                <IconButton size='small' onClick={() => moveTask('up', task)}>
                  <KeyboardArrowUp fontSize='12px' />
                </IconButton>      
              </Box>

              <Box
                width={'100%'} 
                display={'flex'}
                justifyContent={'end'} 
                alignItems='center'
                columnGap={1}
              >
                {
                  task.status && <Tooltip arrow title={task.status.name}>
                    <IconButton size='small'>
                      <Adjust sx={{color: task.status.color}} fontSize='12px' /> 
                    </IconButton>
                  </Tooltip>
                }
                {
                  task.priority && <IconButton size='small'>
                    <Flag sx={{color: task.priority.color}} fontSize='12px' /> 
                  </IconButton>
                }
                <IconButton size='small'>
                  <ChatBubble fontSize='12px' /> 
                  <Typography ml={0.5} mt={-0.4}>1</Typography>
                </IconButton>
              </Box>
            </Box>
          </Box>
        ))
      }
    </>
  );
}
