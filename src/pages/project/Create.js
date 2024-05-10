import React, { useEffect, useState } from 'react';
import { Box, Button,InputLabel, FormControl, MenuItem,Select, IconButton, Typography } from '@mui/material';
import CreateProject from '../../components/project/CreateProject';
import ProjectFlowStepper from '../../components/project/ProjectFlowStepper';
import CheckIcon from '@mui/icons-material/Check';
import { Add, DeleteOutline } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../reducers/auth/authSlice';
import { createProject as createProjectAPI, selectProject, selectSprint, setProject, setSprint}  from '../../reducers/project/projectSlice';
import { getTeamById, selectTeam, updateTeam } from '../../reducers/team/teamSlice';
import NavigationTopbar from '../../components/common/navigation/NavigationTopbar';
import socket from '../../utils/socket';
import { PROJECT_UPDATED, TEAM_UPDATED } from '../../utils/socket-events';
import AddSprintFormDrawer from '../../components/project/sprint/AddSprintFormDrawer';
import AddTaskDrawer from '../../components/task/AddTaskDrawer';


const iconBtnStyle = {
  width: '30px',
  height: '30px',
  position: 'absolute'
};

export default function Create() {

  const [selectedStep, setSelectedStep] = useState('create project'); // create project -> add project sprint -> create task -> complete
  const [activeStep, setActiveStep] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [sprintDrawerOpen, setSprintDrawerOpen] = useState(false);
  const [taskDrawerOpen, setOpenTaskDrawer] = useState(false);
  
  const dispatch = useDispatch();
  const currentLoginUser = useSelector(selectUser);
  const currentTeam = useSelector(selectTeam);
  const currentProject = useSelector(selectProject);
  const currentSprint = useSelector(selectSprint);

  useEffect(() => {

    socket.on(PROJECT_UPDATED, (project) => {
      dispatch(setProject(project));
      setActiveStep(2);
    }); 

    return () => {
      socket.off(PROJECT_UPDATED);
    };

  }, [socket]);


  useEffect(() => {
    dispatch(setProject({}));
    dispatch(setSprint({}));
  }, []);
  
  const handleCreateProject = async(projectData) => {
    try { 
      const data = {
        project_name: projectData.projectName,
        description: projectData.description,
        start_date: projectData.startDate,
        target_end_date: projectData.targetEndDate,
        team_id: currentTeam._id,
        creator: currentLoginUser._id
      };
  
      if(!data.project_name) return;
      if(data.target_end_date && !data.start_date) return alert('select start date');
      if(data.start_date && data.target_end_date) {
        if( new Date(data.start_date) > new Date(data.target_end_date)) return alert('target date is bigger than start date.');
      }

      setIsLoading(true);

      const created_project = await dispatch(createProjectAPI(data));
      const updated_team = await dispatch(getTeamById(currentTeam._id));
      
      // save project id into team.projects collection
      const res = await dispatch(updateTeam(currentTeam._id, {
        projects: [...updated_team.projects, created_project._id]
      }));
      
      socket.emit(TEAM_UPDATED, res);

      dispatch(setProject(created_project));
      setSelectedStep('add project sprint');
      setActiveStep(1);
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };

  const toggleSprintDrawer = () => {
    setSprintDrawerOpen(!sprintDrawerOpen);
  };
  
  const toggleTaskDrawer = () => {
    setOpenTaskDrawer(!taskDrawerOpen);
  };

  const handleReset = () => {
    setActiveStep(-1);
    setSelectedStep('create project');
    dispatch(setProject({}));
    dispatch(setSprint({}));
  };

  const getClass = (step) => {
    if(selectedStep === step || selectedStep === '') {
      return { opacity: 1 , transition: '0.5s'};
    }
    return { opacity: 0.4, pointerEvents:'none', transition: '0.5s' };
  };

  return (
    <Box width={'100%'}>
     
      
      <NavigationTopbar />

      <br />

      <ProjectFlowStepper
        func={handleReset}
        activeStep={activeStep}
      />

      <Box mt={1} sx={getClass('create project')}>

        <IconButton size='small'  sx={iconBtnStyle}>
          { (selectedStep !== 'create project'  && activeStep > -1) ? <CheckIcon color='success' /> : '1' }
        </IconButton>

        <CreateProject
          isLoading={isLoading}
          handleCreateProject={handleCreateProject}
        />
      </Box>

      
      <Box 
        sx={{ transition: '0.2s' }} 
        visibility={currentProject._id ? 'visible' : 'hidden'} 
        boxShadow={1} 
        bgcolor={'white'} 
        mt={2} 
        px={2}
        pb={2}
        pt={4}
      >

        <Box display={'flex'} flexWrap={'wrap'} alignItems={'center'} columnGap={2} mb={2}>
          {
            (currentProject?.sprints || []).map(sprint => <Box
              key={sprint._id} 
              border={'1px solid #0000001f'} 
              columnGap={1} p={1} 
              borderRadius={1} 
              display={'flex'} 
              alignItems={'center'}
            >
              <Typography>{sprint.name}</Typography>
              
              <IconButton>
                <DeleteOutline />
              </IconButton>
            </Box>)
          }
        </Box>

        <Button 
          variant='outlined' 
          sx={{ borderRadius: 0 }}
          startIcon={<Add />}
          onClick={toggleSprintDrawer}
          color='success'
        >
            Add Sprint
        </Button>

        {
          currentProject._id && <AddSprintFormDrawer
            open={sprintDrawerOpen} 
            project_id={currentProject._id} 
            project_start_date={currentProject.start_date} 
            toggleDrawer={toggleSprintDrawer} 
          />}
      </Box>

      <Box 
        visibility={ currentProject.sprints && currentProject.sprints.length ? 'visible' : 'hidden'}
        sx={{ transition: '0.2s' }}
        boxShadow={1}
        bgcolor={'white'}
        mt={2}
        px={2}
        pb={2}
        pt={4}
      >
       
        <FormControl fullWidth>
          <InputLabel>Select Sprint</InputLabel>
          <Select
            value={currentSprint}
            label="Sprint"
            size='small'
            onChange={e => dispatch(setSprint(e.target.value))}
          >
            {
              (currentProject.sprints || []).map(sprint =>
                <MenuItem key={sprint._id} value={sprint}>{sprint.name}</MenuItem>
              )
            }
          </Select>
        </FormControl>


        <Box my={3}>
          {
            (currentSprint.tasks || []).map(task => <Typography key={task._id}>{task.title}</Typography>)
          }
        </Box>

        <Button
          variant='outlined' 
          color='success'
          startIcon={<Add />}
          onClick={toggleTaskDrawer}
          sx={{ borderRadius: 0 }}
        >
          Add task
        </Button>

        <AddTaskDrawer
          open={taskDrawerOpen}
          toggleDrawer={toggleTaskDrawer}
        />

      </Box>
 
    </Box>
  );
}
