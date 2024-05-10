import React, { useEffect, useState } from 'react';
import { deleteProjectSprint, getProjectById, selectProject, selectSprint, setProject, setSprint, updateProject, updateProjectSprint } from '../../../reducers/project/projectSlice';
import { useParams } from 'react-router';
import Loader from '../../../components/common/Loader/Loader';
import { useDispatch } from 'react-redux';
import { Box, Button, Chip, Grid, IconButton, LinearProgress, TextField, Typography } from '@mui/material';
import NavigationTopbar from '../../../components/common/navigation/NavigationTopbar';
import { Add, Check, DeleteOutline, SelectAll, Send } from '@mui/icons-material';
import { useUtils } from '../../../utils/useUtils';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import FlagIcon from '@mui/icons-material/Flag';
import CloseIcon from '@mui/icons-material/Close';
import AddSprintFormDrawer from '../../../components/project/sprint/AddSprintFormDrawer';
import socket from '../../../utils/socket';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AlertDialog from '../../../components/common/AlertDialog';
import DeleteProjectDialog from '../../../components/project/DeleteProjectDialog';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ManageProjectTasksTable from '../../../components/manage-project/ManageProjectTasksTable';
import { useSelector } from 'react-redux';

const btn = {
  boxShadow: 0,
  borderRadius: 0.5
};

export default function ManageProject() {
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCRUDLoading, setIsCRUDLoading] = useState(false);
  const [date, setDate] = useState({
    sprintStartDate: null,
    sprintTargetEndDate: null,
    projectStartDate: null,
    projectTargetEndDate: null
  });
  const [priority, setPriority] = useState({ name: '', color: 'black' });
  const [status, setStatus] = useState({ name: '', color: 'black' });
  const [typeInput, setTypeInput] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDeleteSprintDialog, setOpenDeleteSprintDialog] = useState(false);
  const [openDeleteProjectDialog, setOpenDeleteProjectDialog] = useState(false);

  const { id } = useParams();
  const dispatch = useDispatch();
  const project = useSelector(selectProject);
  const sprint = useSelector(selectSprint);
  
  const { getCreatedDate, formatDate, calculateDaysRemaining } = useUtils();

  useEffect(() => {
   
    const getProject = async() => {
      try {
        setIsLoading(true);

        const response = await dispatch(getProjectById(id));
        
        dispatch(setProject(response));
        
        if(response.sprints && response.sprints[0]){
          dispatch(setSprint(response.sprints[0]));
        }
      }catch(err){
        console.error(err);
      }
      setIsLoading(false);
    };

    getProject();
  }, [id]);

  useEffect(() => {
    socket.on('project_updated', (updated_project) => {
      if(updated_project._id === id){
        dispatch(setProject(updated_project));
        if(updated_project.sprints && updated_project.sprints[0]){
          dispatch(setSprint(updated_project.sprints[0]));
        }
      }
    });
  }, [socket]);

  if(isLoading) {
    return <Loader />;
  }

  const addPriority = () => {
    if(!priority.name.trim()) return;
    if(sprint && sprint.priorities.map(priority => priority.name).includes(priority.name)) return;

    dispatch(setSprint({
      ...sprint,
      priorities: [...sprint.priorities, priority]
    }));
    
    setPriority({
      ...priority,
      name: ''
    });
  };
  
  const removePriority = (index) => {
    const updatedPriorities = sprint.priorities.filter((_, i) => i !== index);
    dispatch(setSprint({ ...sprint, priorities: updatedPriorities }));
  };
    
  const addStatus = () => {
    if(!status.name.trim()) return;
    if(sprint && sprint.status.map(status => status.name).includes(status.name)) return;
    
    dispatch(setSprint({
      ...sprint,
      status: [...sprint.status, status]
    }));
        
    setStatus({
      ...status,
      name: ''
    });
  };
      
  const removeStatus = (index) => {
    const updatedStatus = sprint.status.filter((_, i) => i !== index);
    dispatch(setSprint({ ...sprint, status: updatedStatus }));
  };

  const deleteTaskType = (index) => {
    const updatedTaskTypes = sprint.task_types.filter((_, i) => i !== index);
    dispatch(setSprint({ ...sprint, task_types: updatedTaskTypes }));
  };

  const addTaskType = () => {
    if(sprint.task_types && sprint.task_types.includes(typeInput.toLowerCase())) return;

    dispatch(setSprint({
      ...sprint,
      task_types: [...sprint.task_types, typeInput.toLowerCase()]
    }));

    setTypeInput('');
  };
  
  const handleSprintNameChange = (e) => {
    dispatch(setSprint({ ...sprint, name: e.target.value }));
  };

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const toggleDeleteSprintDialog = () => {
    setOpenDeleteSprintDialog(!openDeleteSprintDialog);
  };

  const toggleDeleteProjectDialog = () => {
    setOpenDeleteProjectDialog(!openDeleteProjectDialog);
  };

  const getTotalTasks = () => {
    if (!project.sprints || project.sprints.length < 1) {
      return 0;
    }
    const taskLengths = project.sprints.map(sprint => sprint.tasks?.length || 0);
    const sum = taskLengths.reduce((total, length) => total + length, 0);

    return sum;
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const updatedStatus = [...sprint.status];

    const [draggedStatus] = updatedStatus.splice(source.index, 1);

    updatedStatus.splice(destination.index, 0, draggedStatus);

    dispatch(setSprint({
      ...sprint,
      status: updatedStatus,
    }));
  };

  const handleSave = async() => {
    try {
      setIsCRUDLoading(true);

      await dispatch(updateProject(project._id, { // will return prev project
        project_name: project.project_name,
        start_date: project.start_date,
        target_end_date: project.target_end_date,
      }));

      if(sprint && sprint._id){
        await dispatch(updateProjectSprint(sprint._id, {
          name: sprint.name,
          status: sprint.status,
          priorities: sprint.priorities,
          task_types: sprint.task_types,
          start_date: sprint.start_date,
          target_end_date: sprint.target_end_date,
          is_complete: Boolean(sprint.is_complete)
        }));
      }

      const updated_project = await dispatch(getProjectById(project._id));
      
      socket.emit('project_updated', updated_project);
    }catch(err){
      console.error(err);
    }
    setIsCRUDLoading(false);
  };

  const handleDeleteSprint = async() => {
    try {
      setIsCRUDLoading(true);
      toggleDeleteSprintDialog();

      const updated_project = await dispatch(deleteProjectSprint(sprint._id));

      socket.emit('project_updated', updated_project);
    }catch(err){
      console.error(err);
    }
    setIsCRUDLoading(false);
  };

   

  return (
    <Box width={'100%'}>
      <NavigationTopbar />
      <LinearProgress sx={{ height: 1.2, opacity: isCRUDLoading ? 1 : 0 }}  />

      <Grid container columnSpacing={2} bgcolor={'white'} mt={1}>
        <Grid item xs={6.7}>

          <Box p={2} display={'flex'} flexDirection={'column'} rowGap={3}>
           
            <TextField
              size='medium'
              defaultValue={project.project_name} 
              fullWidth
              label="Project Name *"
              variant="outlined"
              onChange={e => dispatch(setProject({...project, project_name: e.target.value}))}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box display='flex' columnGap={2}>
                <DesktopDatePicker
                  label='Start date'
                  onChange={e => {
                    setDate({...date, projectStartDate: formatDate(e.$d)}),
                    dispatch(setProject({...project, start_date: formatDate(e.$d)}));
                  }} 
                  disablePast
                  value={dayjs(project.start_date)}
                />

                <DesktopDatePicker 
                  disablePast
                  label='Target end date'
                  onChange={e => {
                    setDate({...date, projectTargetEndDate: formatDate(e.$d)}),
                    dispatch(setProject({...project, target_end_date: formatDate(e.$d)}));
                  }} 
                  minDate={dayjs(project.start_date)} 
                  value={dayjs(project.target_end_date)}
                />
              </Box>
            </LocalizationProvider>

            <Box display={'flex'} flexDirection={'column'} rowGap={1}>
              <Typography display={'block'} fontWeight='light' variant='caption' fontSize={15}>
               Created on {getCreatedDate(project.createdAt)}
              </Typography>

              {
                (project.start_date && project.target_end_date) && 
                <Typography display={'block'} fontWeight='light' variant='caption' fontSize={15}>
                  <b style={{color:'red'}}>{calculateDaysRemaining(project.start_date, project.target_end_date)}</b> days left to end.
                </Typography>
              }

              <Typography display={'block'} fontWeight='light' variant='caption' fontSize={15}>
                Total sprints assoicate this project <b>{project.sprints && project.sprints.length}</b>
              </Typography>

              <Typography display={'block'} fontWeight='light' variant='caption' fontSize={15}>
                Total tasks assoicate with all sprints <b>{getTotalTasks()}</b>
              </Typography>

            </Box>
            

            <Box display={'flex'} columnGap={1} justifyContent={'space-between'}>
              <Button
                disabled={isCRUDLoading}
                fullWidth
                startIcon={<SaveIcon />} 
                variant='outlined'
                sx={btn}
                onClick={handleSave}
              >
                  Save Info
              </Button>
              
              <Button 
                disabled={isCRUDLoading}
                fullWidth
                startIcon={<DeleteIcon />} 
                variant='contained'
                color='error'
                sx={btn}
                onClick={toggleDeleteProjectDialog}
              >
                  Delete project
              </Button>
            </Box>

          </Box>

          <ManageProjectTasksTable />
          <br />

        </Grid>

        <Grid item xs={5} p={2}>

          {/* sprint form */}

          <Box display={'flex'} mb={1} alignItems={'center'} flexWrap={'wrap'} gap={1}>
            {
              (project.sprints || []).map(item =>  <Box key={item._id}>
                <Chip
                  sx={{  px: 1, borderRadius: 2 }}
                  size='medium' 
                  className='cursor-pointer'
                  label={item.name}
                  icon={item._id === sprint._id ? <Check /> : <SelectAll /> }
                  variant="outlined"
                  onDelete={toggleDeleteSprintDialog}
                  deleteIcon={<DeleteOutline />}
                  onClick={() => dispatch(setSprint(item))}
                />
              </Box>)
            }
            <Chip 
              sx={{ px: 1, borderRadius: 2 }}
              size='medium'
              className='cursor-pointer'
              label={'Add Sprint'}
              onClick={toggleDrawer}
              icon={<Add />}
              variant='outlined'
            />
          </Box>

          {/* sprint update field */}
          {
            sprint && sprint._id &&
            <Box>
              <TextField 
                sx={{ my: 2 }}
                size='small'
                fullWidth 
                label="Sprint Name *"
                variant="outlined"
                value={sprint.name}
                onChange={handleSprintNameChange}
              />

              <Box>
                <Typography variant='body2' mb={1}>Priorities</Typography>
              
                <Box display={'flex'} alignItems={'center'} flexWrap={'wrap'} gap={2} mb={2}>
                  {
                    (sprint.priorities || []).map((priority,i) => <Button 
                      key={i}
                      sx={{ borderRadius: 1, borderColor: priority.color, color:'black', textTransform: 'none' }}
                      size='small'
                      label={priority.name}
                      startIcon={<FlagIcon sx={{ color: priority.color}} />}
                      variant='outlined'
                    >
                      {priority.name}
                      <CloseIcon onClick={() => removePriority(i)} sx={{ fontSize: 17, ml: 1 }} />
                    </Button>)
                  }
                </Box>

                <TextField
                  size='small'
                  value={priority.name}
                  onChange={(e) => setPriority({ ...priority, name: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && addPriority()}
                  InputProps={{
                    endAdornment: (
                      <Box display='flex' columnGap={1}>
                        <input
                          style={{
                            width:'40px',
                            height:'40px'
                          }} 
                          onChange={e => setPriority({...priority, color: e.target.value})}
                          type='color'
                        />

                        <IconButton onClick={addPriority}>
                          <Send />
                        </IconButton>
                      </Box>
                    )
                  }}
                />
              </Box>
           
              <DragDropContext onDragEnd={onDragEnd}>
                <Box mt={2}>
                  <Typography variant='body2' mb={1}>Status (dragging)</Typography>
                  <Droppable droppableId="status">
                    {(provided) => (
                      <Box
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        display={'flex'}
                        alignItems={'center'}
                        flexWrap={'wrap'}
                        gap={2}
                        mb={2}
                      >
                        {(sprint.status || []).map((item, index) => (
                          <Draggable key={`status-${index}`} draggableId={`status-${index}`} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Box
                                  size='small'
                                  border={1}
                                  label={item.name}
                                  borderColor={item.color}
                                  borderRadius={1}
                                  display={'flex'}
                                  alignItems={'center'}
                                  columnGap={0.5}
                                  paddingX={2}
                                  paddingY={0.7}
                                  textTransform={'uppercase'}
                                  fontSize={14}
                                  variant='outlined'
                                >
                                  <FlagIcon sx={{ color: item.color, fontSize: 17 }} />

                                  {item.name}

                                  <CloseIcon 
                                    onClick={() => removeStatus(index)}
                                    sx={{ fontSize: 17, ml: 1 }} 
                                  />
                                </Box>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>

                  <TextField
                    size='small'
                    value={status.name}
                    onChange={(e) => setStatus({ ...status, name: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && addStatus()}
                    InputProps={{
                      endAdornment: (
                        <Box display='flex' columnGap={1}>
                          <input
                            style={{
                              width:'40px',
                              height:'40px'
                            }} 
                            type='color'
                            onChange={e => setStatus({...status, color: e.target.value})}
                          />

                          <IconButton onClick={addStatus}>
                            <Send />
                          </IconButton>
                        </Box>
                      )
                    }}
                  />

                </Box>
              </DragDropContext>


              <Box mt={2}>
                <Typography variant='body2' mb={1}>Task types</Typography>

                <Box display={'flex'} alignItems={'center'} flexWrap={'wrap'} gap={2}>
                  {
                    (sprint.task_types || []).map((item, i) => <Chip 
                      key={item}
                      label={item}
                      size='small'
                      variant='outlined'
                      onDelete={() => deleteTaskType(i)}
                      sx={{ borderRadius: 1, px: 2, mr: 2 }}
                    />)
                  }
                </Box>

                <TextField
                  size='small'
                  sx={{ mt: 2 }}
                  value={typeInput}
                  onChange={(e) => setTypeInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTaskType()}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={addTaskType}>
                        <Send />
                      </IconButton>
                    )
                  }}
                />
              </Box>
             
              {/* sprint date */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box display='flex' gap={2} mt={2}>

                  <DesktopDatePicker
                    label='Start date'
                    onChange={e => dispatch(setSprint({...sprint, start_date: formatDate(e.$d)}))} 
                    disablePast
                    value={dayjs(sprint.start_date)}
                    minDate={dayjs(date.projectStartDate || formatDate(new Date()))}
                    maxDate={dayjs(date.projectTargetEndDate)}
                  />

                  <DesktopDatePicker 
                    disablePast
                    label='Target end date'
                    onChange={e => dispatch(setSprint({...sprint, target_end_date: formatDate(e.$d)}))} 
                    value={dayjs(sprint.target_end_date)}
                    minDate={dayjs(sprint.start_date || project.start_date)} 
                    maxDate={dayjs(date.projectTargetEndDate)}
                  />
                </Box>
              </LocalizationProvider> 

              <Box m={1} mb={2} display={'flex'} alignItems={'center'} columnGap={1}>
                <input 
                  style={{ display:'block' }}
                  onChange={e => dispatch(setSprint({...sprint, is_complete: e.target.checked }))} 
                  type="checkbox" defaultChecked={sprint.is_complete} />
              
                <label style={{ display:'block' }}> Is sprint complete ?</label>
              </Box>


            </Box>
          }


        </Grid>
      </Grid>


      {/* add sprint drawer */}
      <AddSprintFormDrawer
        open={openDrawer}
        project_id={project._id}
        toggleDrawer={toggleDrawer}
      />

      {/* confirmation alert to delete sprint */}
      <AlertDialog
        open={openDeleteSprintDialog}
        title={'Are you sure you?'}
        content="Once you delete the sprint all tasks assoicate with this sprint will be deleted also."
        toggleDialog={toggleDeleteSprintDialog}
        toggleConfirm={handleDeleteSprint}
      />

      {/* confirmation alert for delete project */}
      <DeleteProjectDialog
        open={openDeleteProjectDialog}
        toggleDialog={toggleDeleteProjectDialog}
      />
    </Box>
  );
}
