import React, { useState } from 'react';
import { Box, CircularProgress, Grid, IconButton, Typography } from '@mui/material';
import CreateProject from '../../components/project/CreateProject';
import ProjectFlowStepper from '../../components/project/ProjectFlowStepper';
import CreateProjectSprint from '../../components/project/sprint/CreateProjectSprint';
import CheckIcon from '@mui/icons-material/Check';
import CreateTask from '../../components/task/CreateTask';
import { Close } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../reducers/auth/authSlice';
import { addProjectSprint, createProject as createProjectAPI, getProjectById as getProjectByIdAPI, updateProject, updateProjectSprint}  from '../../reducers/project/projectSlice';
import { createTask } from '../../reducers/task/taskSlice';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getTeamById, selectTeam, updateTeam } from '../../reducers/team/teamSlice';
import NavigationTopbar from '../../components/common/navigation/NavigationTopbar';
import socket from '../../utils/socket';

const iconBtnStyle = {
  width: '30px',
  height: '30px',
  position: 'absolute'
};

export default function Create() {

  const [selectedStep, setSelectedStep] = useState('create project'); // create project -> add project sprint -> create task -> complete
  const [activeStep, setActiveStep] = useState(-1);
  const [isPreviewScreenOpen, setIsPreviewScreenOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState(['You can create a single sprint and task for a project.']);
  
  const [createdProjectId, setCreatedProjectId] = useState('');
  const [project, setProject] = useState({});
  
  const dispatch = useDispatch();
  const currentLoginUser = useSelector(selectUser);
  const currentTeam = useSelector(selectTeam);

  
  const handleCreateProject = async(projectData) => {
    try { 
      const data = {
        project_name: projectData.projectName,
        description: projectData.description,
        start_date: projectData.startDate,
        target_end_date: projectData.targetEndDate,
        team_id: currentTeam._id
      };
  
      if(!data.project_name) return;
      if(data.target_end_date && !data.start_date) return alert('select start date');
      if(data.start_date && data.target_end_date) {
        if( new Date(data.start_date) > new Date(data.target_end_date)) return alert('target date is bigger than start date.');
      }

      setIsLoading(true);
      setMessages(prev => [...prev, 'Creating project...']);

      const res = await dispatch(createProjectAPI(data));
      const updated_team = await dispatch(getTeamById(currentTeam._id));
      
      // save project id into team.projects collection
      await dispatch(updateTeam(currentTeam._id, {
        projects: [...updated_team.projects, res._id]
      }));
      
      setSelectedStep('add project sprint');
      setActiveStep(1);
      setCreatedProjectId(res._id);
      setMessages(prev => [...prev, 'Project created successfully.']);
    }catch(err){
      console.error(err);
      setMessages(prev => [...prev, err?.message]);
    }
    setIsLoading(false);
  };

  const handleAddSprint = async(sprintData) => {
    try {
      const data = {
        start_date: sprintData.startDate,
        target_end_date: sprintData.targetEndDate,
        status: sprintData.allStatus,
        name: sprintData.sprintName
      };
      
      if(data.status.length < 1) return alert('add status');
      
      const project = await getProjectById(createdProjectId);
      
      if(project.start_date && data.start_date){
        if(new Date(project.start_date) > new Date(data.start_date)) return alert('Sprint start date have to higher.');
      }

      if(data.target_end_date && data.start_date){
        if(new Date(data.target_end_date) < new Date(data.start_date)) return alert('target end date should bigger than start date');
      }

      setIsLoading(true);
      setMessages(prev => [...prev, 'Adding sprint into project.']);

      const updated_project = await dispatch(addProjectSprint(project._id, data));

      // send the updated project to all 
      socket.emit('project_updated', updated_project);

      setProject(updated_project);
      setActiveStep(2);
      setSelectedStep('create task');
      setMessages(prev => [...prev, 'Sprint added succesfully.']);
    }catch(err){
      setMessages(prev => [...prev, err?.message]);
    }
    setIsLoading(false);
  };

  const handleCreateTask = async(task) => {
    try{
      if(!task.title?.trim()) return;

      setIsLoading(true);
      setMessages(prev => [...prev, 'Task creating...']);
      console.log(task);
      const res = await dispatch(createTask(currentTeam.name, task));
      
      const project_sprint = project.sprints && project.sprints[0];
      
      await dispatch(updateProjectSprint(project_sprint._id, {
        tasks: [...project_sprint.tasks, res._id]
      }));

      setActiveStep(3);
      setSelectedStep('complete');
      setMessages(prev => [...prev, 'Task creating complete.']);
      setMessages(prev => [...prev, '🎉 Congratulation, successfully created project']);
    }catch(err){
      console.error(err);
      setMessages(prev => [...prev, err?.message]);
    }
    setIsLoading(false);
  };

  const getProjectById = async(id) => {
    try{
      if(!id) return;
      const project = await dispatch(getProjectByIdAPI(id));
      return project;
    }catch(err){
      return {};
    }
  };

  const handleReset = () => {
    setActiveStep(-1);
    setMessages(['⟳ reset']);
    setMessages(prev => [...prev, 'create another project.']);
    setSelectedStep('create project');
  };


  const getClass = (step) => {
    if(selectedStep === step || selectedStep === '') {
      return { opacity: 1 , transition: '0.5s'};
    }
    return { opacity: 0.4, pointerEvent:'none', transition: '0.5s' };
  };

  return (
    <Box>
      <NavigationTopbar />
      <Box m={2}>
        <Box>
          <ProjectFlowStepper
            func={handleReset}
            activeStep={activeStep}
          />
        </Box>

        <Grid container marginTop={4}>
        
          <Grid item xs={6} sx={getClass('create project')}>
            <IconButton size='small'  sx={iconBtnStyle}>
              { (selectedStep !== 'create project'  && activeStep > -1) ? <CheckIcon color='success' /> : '1' }
            </IconButton>

            <CreateProject
              isLoading={isLoading}
              handleCreateProject={handleCreateProject}
            />
          </Grid>
        
          <Grid item xs={6} sx={getClass('add project sprint')}>
            <IconButton size='small'  sx={iconBtnStyle}>
              { (selectedStep !== 'add project sprint' && activeStep > 1) ? <CheckIcon color='success' /> : '2' }
            </IconButton>

            <CreateProjectSprint  
              handleAddSprint={handleAddSprint}
              isLoading={isLoading}
            />
          </Grid>

          <Grid item  xs={isPreviewScreenOpen ? 8 : 11} mt={5} sx={getClass('create task')}>
            <IconButton size='small'  sx={iconBtnStyle}>
              { (selectedStep !== 'create task' && activeStep > 2) ? <CheckIcon color='success' /> : '3' }
            </IconButton>

            <CreateTask 
              project={project}
              handleCreateTask={handleCreateTask}
              isLoading={isLoading}
            />
          </Grid>

          {
            isPreviewScreenOpen &&
          <Grid item xs={4}>
            <Box boxShadow={1} minHeight={250} maxHeight={250} overflow='scroll' bgcolor='black' padding={1}>
              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Typography borderBottom='1px dotted white' variant='caption' color='white'>
                preview
                </Typography>
                <IconButton size='small' onClick={() => setIsPreviewScreenOpen(false)}>
                  <Close color='primary'  />
                </IconButton>
              </Box>

              {
                messages.map((msg, i) =>  <Typography display='flex' alignItems='center' columnGap={1} key={i} variant='caption' color='white'>
                  {isLoading && <CircularProgress sx={{color:'white'}} size={10} />}
                  {msg}
                </Typography>)
              }
            </Box>
          </Grid>
          }

          {
            !isPreviewScreenOpen &&  <Grid item xs={0.5}>
              <IconButton
                sx={{ bgcolor: 'white'}}
                onClick={()=> setIsPreviewScreenOpen(true)}
              >
                <VisibilityIcon />
              </IconButton>
            </Grid>
          }
 
        </Grid>

      </Box>
    </Box>
  );
}
