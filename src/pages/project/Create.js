import React, { useEffect, useState } from 'react';
import { Box, Button,InputLabel, FormControl, MenuItem,Select, IconButton, Typography } from '@mui/material';
import CreateProject from '../../components/project/CreateProject';
import ProjectFlowStepper from '../../components/project/ProjectFlowStepper';
import CheckIcon from '@mui/icons-material/Check';
import { Add, DeleteOutline } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../reducers/auth/authSlice';
import { createProject as createProjectAPI }  from '../../reducers/project/projectSlice';
import { getTeamById, selectTeam, updateTeam } from '../../reducers/team/teamSlice';
import NavigationTopbar from '../../components/common/navigation/NavigationTopbar';
import socket from '../../utils/socket';
import { NEW_TASK, PROJECT_UPDATED, TEAM_UPDATED } from '../../utils/socket-events';
import AddSprintFormDrawer from '../../components/project/sprint/AddSprintFormDrawer';
import AddTaskDrawer from '../../components/task/AddTaskDrawer';
import { sendNotification } from '../../components/Notification/Notification';
import { NOTIFICATION_IMAGE } from '../../utils/notification-images';
import { PROJECT } from '../../utils/path';


const iconBtnStyle = {
  width: '30px',
  height: '30px',
  position: 'absolute'
};

export default function Create() {

  const [project, setProject] = useState({});
  const [sprint, setSprint] = useState({});
  const [selectedStep, setSelectedStep] = useState('create project'); // create project -> add project sprint -> create task -> complete
  const [activeStep, setActiveStep] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [sprintDrawerOpen, setSprintDrawerOpen] = useState(false);
  const [taskDrawerOpen, setOpenTaskDrawer] = useState(false);
  
  const dispatch = useDispatch();
  const currentLoginUser = useSelector(selectUser);
  const currentTeam = useSelector(selectTeam);

  useEffect(() => {
    socket.on(PROJECT_UPDATED, (updatedProject) => {
      setProject(updatedProject);
      setActiveStep(2);
      if(updatedProject.sprints?.length && !sprint._id){
        setSprint(updatedProject.sprints[0]);
      }
    }); 

    return () => {
      socket.off(PROJECT_UPDATED);
    };
  }, [socket]);

 

  useEffect(() => {
    socket.on(NEW_TASK, async({ task, sprintId }) => {

      const sprintIndex = project.sprints?.findIndex(sprint => sprint._id === sprintId);

      if (sprintIndex !== -1 && project && project._id) {
        const updatedSprints = [...project.sprints];
        updatedSprints[sprintIndex] = {
          ...updatedSprints[sprintIndex],
          tasks: [...updatedSprints[sprintIndex].tasks, task]
        };
        const sprint = updatedSprints.find(sprint => sprint._id === sprintId);

        setProject({ ...project, sprints: updatedSprints });
          
        if(sprint._id === sprintId){
          setSprint(sprint);
        }
      }
    });

    return () => {
      socket.off(NEW_TASK);
    };
  },[socket, project, sprint]);
  
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
      const team = await dispatch(getTeamById(currentTeam._id));
      
      // save project id into team.projects collection
      const updated_team = await dispatch(updateTeam(currentTeam._id, {
        projects: [...team.projects, created_project._id]
      }));
      
      socket.emit(TEAM_UPDATED, updated_team);

      setProject(created_project);
      setSelectedStep('add project sprint');
      setActiveStep(1);

      sendNotification(dispatch, 
        currentTeam._id, 
        currentTeam.members.map(member => member._id),
        [currentLoginUser._id],
        NOTIFICATION_IMAGE,
        `${currentLoginUser.name} created new project '${created_project.project_name}' in ${currentTeam.name}`,
        `${PROJECT}/${created_project._id}`
      );
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
    setProject({});
    setSprint({});
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
        visibility={project._id ? 'visible' : 'hidden'} 
        boxShadow={1} 
        bgcolor={'white'} 
        mt={2} 
        px={2}
        pb={2}
        pt={4}
      >

        <Box display={'flex'} flexWrap={'wrap'} alignItems={'center'} columnGap={2} mb={2}>
          {
            (project.sprints || []).map(sprint => <Box
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
          project._id && <AddSprintFormDrawer
            open={sprintDrawerOpen} 
            project_id={project._id} 
            project_start_date={project.start_date} 
            toggleDrawer={toggleSprintDrawer} 
          />}
      </Box>

      <Box 
        visibility={ project.sprints && project.sprints.length ? 'visible' : 'hidden'}
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
            value={sprint}
            label="Sprint"
            size='small'
            onChange={e => setSprint(e.target.value)}
          >
            {
              (project.sprints || []).map(sprint =>
                <MenuItem key={sprint._id} value={sprint}>{sprint.name}</MenuItem>
              )
            }
          </Select>
        </FormControl>


        <Box my={2}>
          {
            (sprint.tasks || []).map(task => <Typography
              key={task._id}
              p={1}
              mb={1}
              borderLeft={'2px solid #656f7d'}
              bgcolor={'#e0e0e0'}
            >
              {task.title}
            </Typography>)
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
        
        {
          sprint._id &&
        <AddTaskDrawer
          open={taskDrawerOpen}
          toggleDrawer={toggleTaskDrawer}
          sprint={sprint}
          project={project}
        />
        }
      </Box>
 
    </Box>
  );
}
