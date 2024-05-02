import { Box, Button, Chip, Divider, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import QuillEditor from '../quill/QuillEditor';
import TaskAssignDropdown from './TaskAssignDropdown';
import SelectDropdown from '../common/SelectDropdown';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useUtils } from '../../utils/useUtils';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { getProjectById as getProjectByIdAPI } from '../../reducers/project/projectSlice';
import { selectUser } from '../../reducers/auth/authSlice';
import PolylineIcon from '@mui/icons-material/Polyline';
import FlagIcon from '@mui/icons-material/Flag';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { selectTeam } from '../../reducers/team/teamSlice';

const priorityList = [{name: 'low', color: 'silver'},{name: 'medium', color: 'blue'},{name: 'high', color: 'gold'},{name: 'urgent', color: 'red'}];
const taskType = ['bug', 'feature', 'enhancement'];

export default function CreateTask({ project, handleCreateTask, isLoading }) {

  const [priority, setPriority] = useState({});
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState({});
  const [description, setDescription] = useState('');
  const [assigns, setAssigns] = useState([]);
  const [dueDate, setDueDate] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const { formatDate } = useUtils();
  const currentLoginUser = useSelector(selectUser);
  const currentTeam = useSelector(selectTeam);

  const getMinDueDate = async()  => {
    const project_start_date = project.start_date;
    const sprint_start_date = project.sprints && project.sprints[0].start_date;
    if(sprint_start_date) return dayjs(sprint_start_date);
    if(project_start_date) return dayjs(project_start_date);
    return dayjs(formatDate(new Date()));
  };
   
  const handleTagInputChange = (event) => {
    setTagInput(event.target.value);
  };

  const handleKeyDown = (event) => {
    if(tags.includes(tagInput)) return;
    if (event.key === 'Enter' && tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };


  return (
    <Box padding={3} boxShadow={1} bgcolor='#fff'>
    
      <Box display='flex' columnGap={5}>
        <TextField 
          onChange={e => setTitle(e.target.value)}
          fullWidth 
          label="Task title *"
          variant="outlined"
        />

        <Box display='flex' columnGap={3}>
          {/* priority dropdown */}
          <FormControl sx={{minWidth: 100}}>
            <InputLabel id="demo-simple-select-autowidth-label">Priority</InputLabel>
            <Select
              labelId="demo-simple-select-autowidth-label"
              id="demo-simple-select-autowidth"
              value={priority}
              onChange={ e => setPriority(e.target.value)}
              fullWidth
              label="Priority"
            >
              {priorityList.map(item => <MenuItem value={item} key={item.name}>{item.name}</MenuItem>)}
            </Select>
          </FormControl>

          {/* type dropdown */}
          <SelectDropdown 
            title='Task type'
            width={120}
            list={taskType}
            func={setType}
            value={type}
          />

 
          <FormControl sx={{minWidth: 100}}>
            <InputLabel id="demo-simple-select-autowidth-label">Status</InputLabel>
            <Select
              labelId="demo-simple-select-autowidth-label"
              id="demo-simple-select-autowidth"
              value={status}
              onChange={ e => setStatus(e.target.value)}
              fullWidth
              label="Priority"
            >
              {
                (project.sprints && project.sprints[0] && project.sprints[0].status) && project.sprints[0].status.map(status => <MenuItem value={status} key={status.name} sx={{ display: 'flex', alignItems:'center' }}>
                  <FlagIcon sx={{ color: status.color, mr: 1}} /> {status.name}
                </MenuItem>)
              }

              <Divider />
              <MenuItem value={null}>
                <NotInterestedIcon sx={{ mr: 1 }} /> clear
              </MenuItem>
              {/* {list.map(item => <MenuItem value={item} key={item}>{item}</MenuItem>)} */}
            </Select>
          </FormControl>

        </Box>
      </Box>

      {/* assign dropdown */}
      <Box my={2} display='flex' justifyContent='space-between'>
        <Box>
          <Typography  display='block' color='#565656' variant='body'> Assignees </Typography>
          <TaskAssignDropdown
            setAssigns={setAssigns}
            assigns={assigns}
          />
        </Box>

        <Box>
          <Typography mb={0.5} display='block' color='#565656' variant='body'> Due date </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
              sx={{width: 150}}
              onChange={e => setDueDate(formatDate(e.$d))} 
            />
            {/* minDate={getMinDueDate()} */}
          </LocalizationProvider>
        </Box>
      </Box>
      
      <Box my={2}>

        <Typography fontSize={15} display='block' mb={1} variant='body' color='#656f7d'> 
              Tags
        </Typography>

        <Box display='flex' alignItems={'center'} columnGap={1}>
          {tags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleRemoveTag(tag)}
              style={{ marginRight: 5 }}
            />
          ))}
          <TextField
            label="Add Tag"
            variant="outlined"
            size="small"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleKeyDown}
            sx={{ display: 'block', mt: 1 }}
          />
        </Box>
      </Box>
        
      <Box height='200px'>
        <Typography display='block' mb={1} variant='body' color='#565656'> 
        Description
        </Typography>

        <QuillEditor
          value={description}
          func={setDescription}
        />
      </Box>


      <br/>
      <br/>
      <br/>
      <br/>
      <br/>

      <Button
        sx={{ mt: 2, float:'right' }}
        disabled={isLoading}
        variant='outlined'
        startIcon={<PolylineIcon />}
        onClick={() => handleCreateTask({
          priority,
          title,
          status,
          description,
          assigns,
          tags,
          due_date: dueDate,
          task_type: type,
          createor: currentLoginUser._id,
          team_id: currentTeam._id
        })}
      >
        Create
      </Button>
    
      <br/>
      <br/>
      
    </Box>
  );
}
