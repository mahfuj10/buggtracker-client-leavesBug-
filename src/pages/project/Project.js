import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectById, selectProject, selectSprint, setProject, setSprint } from '../../reducers/project/projectSlice';
import { Box,  Divider} from '@mui/material';
import Loader from '../../components/common/Loader/Loader';
import ProjectHeader from '../../components/project/ProjectHeader';
import ProjectSprints from '../../components/project/sprint/ProjectSprints';
import AddTaskDrawer from '../../components/task/AddTaskDrawer';
import socket from '../../utils/socket';
import ListTaskContainer from '../../components/task/ListTaskContainer';
import { useSelector } from 'react-redux';
import { PROJECT } from '../../utils/path';
import { selectTeam, setTeam } from '../../reducers/team/teamSlice';
import { NEW_TASK, PROJECT_DELETED, PROJECT_UPDATED } from '../../utils/socket-events';


export default function Project() {

  const [isLoading, setIsLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);

  const { id } = useParams();
  const currentSprint = useSelector(selectSprint);
  const currentProject = useSelector(selectProject);
  const currentTeam = useSelector(selectTeam);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    
    const getProject = async() => {
      try {
        setIsLoading(true);

        const res = await dispatch(getProjectById(id));
        
        dispatch(setProject(res));
        if(res && res.sprints){
          dispatch(setSprint(res.sprints[0]));
        }

      }catch(err){
        console.log(err);
      }
      setIsLoading(false);
    };

    getProject();

  }, [id]);

  useEffect(()=> {

    socket.on(PROJECT_UPDATED, (updated_project) => {
      console.log('from socket.io updated_project {Project.js}', updated_project);

      if(updated_project._id === id){
        dispatch(setProject(updated_project));
        const sprintIds = updated_project.sprints.map(sprint => sprint._id);

        if(!sprintIds.includes(currentSprint && currentSprint._id) && updated_project.sprints && updated_project.sprints[0]){
          dispatch(setSprint(updated_project.sprints[0]));
        }
      }
    });

    socket.on(PROJECT_DELETED, ({ projectId }) => {
      const projectIndex = currentTeam.projects.findIndex(project => project._id === projectId);
      const reminingProjects = currentTeam.projects.filter(project => project._id !== projectId);

      dispatch(setTeam({...currentTeam, projects: reminingProjects}));

      if(id === projectId){
        navigate(`${PROJECT}/${projectIndex > 0 ? currentTeam.projects[projectIndex -1]._id : currentTeam.projects[projectIndex]._id}`);
      } 
    });

  },[socket]);

  const toggleDrawer = () =>{
    setOpenDrawer(!openDrawer);
  };

  if(isLoading) {
    return <Loader />;
  }
  
  return (
    <Box bgcolor='white' width='100%'>
      
      {/* header */}
      <ProjectHeader  />

      {/* project sprints */}
      <Box px={2} pt={0.5}>
        <ProjectSprints  />
      </Box>
      <Divider />

      {/* showing task */}
      <ListTaskContainer
        toggleDrawer={toggleDrawer}
      />

      

      {/* add task form */}
      <AddTaskDrawer 
        open={openDrawer}
        toggleDrawer={toggleDrawer}
      />
    </Box>
  );
}
