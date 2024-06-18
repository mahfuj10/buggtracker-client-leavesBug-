import { Add, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { Box, Chip, Divider, IconButton, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setTask } from '../../reducers/project/projectSlice';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const chipStyle = {
  borderRadius: 0,
  border: '1px solid #e0e0e0',
  bgcolor:'white',
  fontWeight:'bold',
};

export default function Calendar({
  toggleAddTaskDrawer = () => {},
  toggleUpdateTaskDrawer = () => {},
  selectDueDate = () => {},
  tasks = []
}) {

  const [firstDayofMonth, setFirstDayofMonth] = useState(0);
  const [lastDateofMonth, setLastDateofMonth] = useState(0);
  const [currMonth, setCurrMonth] = useState(new Date().getMonth());
  const [currYear, setCurrYear] = useState(new Date().getFullYear());
  const [openMonthDatePicker, setOpenMonthDatePicker] = useState(false);
  const [openYearDatePicker, setOpenYearDatePicker] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    renderCalendar(currMonth, currYear);
  }, []);

  function renderCalendar(currMonth, currYear) {
    const firstDayofMonthIndex = new Date(currYear, currMonth, 1).getDay(); // getting first day of month
    const lastDateofMonthIndex = new Date(currYear, currMonth + 1, 0).getDate(); // getting last date of month
    // const lastDayofMonthIndex = new Date(currYear, currMonth, lastDateofMonth).getDay(); // getting last day of month
    // const lastDateofLastMonthIndex = new Date(currYear, currMonth, 0).getDate(); // getting last date of previous month
  
    setFirstDayofMonth(firstDayofMonthIndex);
    setLastDateofMonth(lastDateofMonthIndex);
  }
  
  const getFirstDayofMonthDates = () => {
    const daysInPrevMonth = new Date(currYear, currMonth, 0).getDate();

    return Array.from({ length: firstDayofMonth }, (_, i) => daysInPrevMonth - firstDayofMonth + i + 1);
  };
  
  const isWeekend = (day) => {
    const dayOfWeek = (day < 10) ? `0${day}` : day;
    const date = new Date(`${currYear}-${currMonth+1}-${dayOfWeek}`);
    const weekDay = weekDays[date.getDay()];
    return weekDay === 'Saturday' || weekDay === 'Sunday';
  };

  function nextMonth() {
    if(currMonth === 11){
      setCurrMonth(0);
      setCurrYear(currYear+1);
      renderCalendar(0, currYear + 1);
    } else {
      setCurrMonth(currMonth + 1);
      renderCalendar(currMonth + 1, currYear);
    }
  }

  function prevMonth() {
    if (currMonth === 0) {
      setCurrMonth(11);
      setCurrYear(currYear - 1);
      renderCalendar(11, currYear - 1);
    } else {
      setCurrMonth(currMonth - 1);
      renderCalendar(currMonth - 1, currYear);
    }
  }

  const getTasksByDate = (day) => {
    if(!tasks.length) return [];

    const formatedDay = day < 10 ? `0${day}` : day;
    const formatedCurrMonth = (currMonth+1) < 10 ? `0${currMonth+1}` : currMonth+1;

    const date = `${currYear}-${formatedCurrMonth}-${formatedDay}`;
    const tasksWhichHasDueDate = tasks.filter(task => task.due_date != null);

    if(!tasksWhichHasDueDate.length) return [];

    return tasksWhichHasDueDate.filter(task => task.due_date.split('T')[0] === date);
  };

  const handleSelectDueDate = (day) => {
    const formatedDay = day < 10 ? `0${day}` : day;
    const formatedCurrMonth = (currMonth+1) < 10 ? `0${currMonth+1}` : currMonth+1;

    selectDueDate(`${currYear}-${formatedCurrMonth}-${formatedDay}`);
  };

  const getStyle = day => {
    const date = new Date();
    
    if(day === date.getDate() && currMonth === date.getMonth() && currYear === date.getFullYear()){
      return {
        position: 'relative',
        ':hover .add-task-btn': {
          opacity: 1,
        },
        border: '1px solid #005353'
      };
    } else {
      return {
        position: 'relative',
        ':hover .add-task-btn': {
          opacity: 1,
        },
        borderRight: '1px solid #e0e0e0',
        borderBottom: '1px solid #e0e0e0'
      };
    }
  };

  const toggleOpenMonthDatePicker = () => {
    setOpenMonthDatePicker(!openMonthDatePicker);
  };

  const toggleOpenYearDatePicker = () => {
    setOpenYearDatePicker(!openYearDatePicker);
  };

  return (
    <Box mb={2}>

      <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>

        <Box display={'flex'} alignItems={'center'}> 
          <Box>
            <IconButton onClick={prevMonth}>
              <NavigateBefore />
            </IconButton>

            <IconButton onClick={nextMonth}>
              <NavigateNext />
            </IconButton>
          </Box>

          <Typography variant='body2' fontWeight={'bold'}>
            {months[currMonth]} {currYear}
          </Typography>
        </Box>

        <Box display={'flex'} columnGap={2} mr={1}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              open={openYearDatePicker} 
              onClose={toggleOpenYearDatePicker} 
              views={['year']} 
              sx={{ visibility: 'hidden', position:'absolute' }}
              onChange={e => {
                setCurrYear(e.$y);
                renderCalendar(currMonth, e.$y);
              }}
            />

            <DatePicker 
              open={openMonthDatePicker}
              onClose={toggleOpenMonthDatePicker}
              views={['month']}
              sx={{ visibility: 'hidden', position:'absolute' }}
              onChange={e => {
                setCurrMonth(e.$M);
                renderCalendar(e.$M, currYear);
              }}
            />
          </LocalizationProvider>

          <Chip
            size='small'
            sx={chipStyle}
            label={months[currMonth]} 
            className='cursor-pointer'
            onClick={toggleOpenMonthDatePicker}
          />

          <Chip size='small'
            sx={chipStyle}
            label={currYear} 
            className='cursor-pointer'
            onClick={toggleOpenYearDatePicker}
          />
        </Box>

      </Box>

      <Divider />

      <Box maxWidth={1013}>
      
        <Box display={'flex'}>
          {
            weekDays.map((day,i) => <Box 
              key={day}
              width={143.6}
              height={140}
              borderRight={'1px solid #e0e0e0'}
              borderBottom={'1px solid #e0e0e0'}
              bgcolor={(i === 0 || i === 6) ? '#f5f7fd' : ''}
              display={'flex'} 
              justifyContent={'center'}
              alignItems={'center'}
            >
              {day}
            </Box>)
          }
        </Box>

        <Box display={'flex'} flexWrap={'wrap'}>
          {
            getFirstDayofMonthDates().map((first,i) => <Box
              key={first}
              width={143.6} 
              height={140}
              borderRight={'1px solid #e0e0e0'}
              borderBottom={'1px solid #e0e0e0'}
              display={'flex'} 
              justifyContent={'end'}
              alignItems={'end'}
              bgcolor={(i === 0 || i === 6) ? '#f5f7fd' : ''}
            >
              <Box p={1} sx={{ opacity: 0.3 }}>
                {first}
              </Box>
            </Box>)
          }
          {Array.from({ length: lastDateofMonth }, (_, i) => i + 1).map((day) => (
            <Box
              key={day}
              width={143.6} 
              height={140}
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'space-between'}
              bgcolor={isWeekend(day) ? '#f5f7fd' : ''}
              sx={getStyle(day)}
            >
              <Box
                p={1}
                overflow={'auto'}
                maxHeight={100}
                sx={{
                  '&::-webkit-scrollbar': {
                    width: '0.4em',
                  },
                  '&::-webkit-scrollbar-track': {
                    boxShadow: 'inset 0 0 6px rgba(0,0,0,0.1)',
                    webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.1)',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,.2)',
                    outline: '1px solid slategrey',
                  },
                }}
              >
                {
                  getTasksByDate(day).map((task) => (
                    <Box 
                      key={task._id}
                      bgcolor={'#dbdee2'}
                      mb={0.5} p={0.5} 
                      onClick={()=> {
                        toggleUpdateTaskDrawer(),
                        dispatch(setTask(task));
                      }}
                      borderLeft={`2px solid ${task.status.color}`}
                      className='cursor-pointer'
                    >
                      <Typography 
                        className='text-break'
                        variant='caption'
                        fontSize={10}
                      >
                        {task.title}
                      </Typography>
                    </Box>
                  ))
                }
              </Box>
              <Box display={'flex'} justifyContent={'end'} alignItems={'center'} p={1}>
                <IconButton
                  size='small'
                  className='add-task-btn'
                  sx={{
                    borderRadius: 1,
                    backgroundColor: '#005353',
                    color: 'white',
                    width: 25,
                    height: 20,
                    transition: '0.2s',
                    opacity: 0,
                    mr: 1,
                    ':hover': {
                      backgroundColor: '#005353',
                    },
                  }}
                  onClick={() => {
                    toggleAddTaskDrawer(),
                    handleSelectDueDate(day);
                  }}
                >
                  <Add fontSize='12px' />
                </IconButton>
                {day}
              </Box>
            </Box>
          ))}
      
        </Box>

      </Box>

    </Box>
  );
}
