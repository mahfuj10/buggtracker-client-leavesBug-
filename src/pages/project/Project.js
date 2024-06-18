import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectById, updateProjectSprint } from '../../reducers/project/projectSlice';
import { Box, Divider} from '@mui/material';
import Loader from '../../components/common/Loader/Loader';
import ProjectHeader from '../../components/project/ProjectHeader';
import ProjectSprints from '../../components/project/sprint/ProjectSprints';
import AddTaskDrawer from '../../components/task/AddTaskDrawer';
import socket from '../../utils/socket';
import { useSelector } from 'react-redux';
import { PROJECT } from '../../utils/path';
import { selectTeam, setTeam } from '../../reducers/team/teamSlice';
import { NEW_TASK, PROJECT_DELETED, PROJECT_UPDATED, TASK_DELETED, TASK_UPDATED } from '../../utils/socket-events';
import { updateTask } from '../../reducers/task/taskSlice';
import BoardTaskContainer from '../../components/task/BoardTaskContainer/BoardTaskContainer';
import UpdateTaskDrawer from '../../components/task/update/UpdateTaskDrawer';
import ListTaskContainer from '../../components/task/ListTaskContainer/ListTaskContainer';
import Calendar from '../../components/Calendar/Calendar';
import ProjectNotes from '../../components/ProjectNotes/ProjectNotes';
import Whiteboard from '../../components/whiteboard/Whiteboard';

export default function Project() {

  const [isLoading, setIsLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [project, setProject] = useState({});
  const [sprint, setSprint] = useState({});
  const [previewScreen, setPreviewScreen] = useState('list');
  const [openUpdateDrawer, setOpenUpdateDrawer] = useState(false); // for update task drawer
  const [dueDate, setDueDate] = useState('');

  const { id } = useParams();

  const currentTeam = useSelector(selectTeam);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    
    const getProject = async() => {
      try {
        setIsLoading(true);

        const res = await dispatch(getProjectById(id));
        
        setProject(res);
        if(res && res.sprints){
          selectSprint(res.sprints[0]);
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
      if(project && id === updated_project._id){
        setProject(updated_project);
        const sprintIds = updated_project.sprints.map(sprint => sprint._id);

        if(!sprintIds.includes(sprint?._id) && updated_project.sprints && updated_project.sprints[0]){
          selectSprint(updated_project.sprints[0]);
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

    socket.on(TASK_UPDATED, async({ task, sprintId }) => {
      const sprintIndex = project.sprints.findIndex(sprint => sprint._id === sprintId);

      if (sprintIndex !== -1) {
        const updatedSprints = [...project.sprints];
        const taskIndex = updatedSprints[sprintIndex].tasks.findIndex(({_id}) => _id === task._id);

        updatedSprints[sprintIndex].tasks[taskIndex] = task;

        setProject({ ...project, sprints: updatedSprints });
      }
    });

    socket.on(NEW_TASK, async({ task, projectId, sprintId }) => {
      if (id === projectId){
        const sprintIndex = project.sprints.findIndex(sprint => sprint._id === sprintId);
  
        if (sprintIndex !== -1) {
          const updatedSprints = [...project.sprints];
          updatedSprints[sprintIndex] = {
            ...updatedSprints[sprintIndex],
            tasks: [...updatedSprints[sprintIndex].tasks, task]
          };


          setProject({ ...project, sprints: updatedSprints });

          if(sprint._id === sprintId){
            setSprint({...updatedSprints[sprintIndex]});
          }
        }
      }
    });

    socket.on(TASK_DELETED, (data) => {
      if(data.projectId === project._id) {

        const remainingTasks = sprint.tasks.filter(task => !data.taskIds.includes(task._id));
        const sprintIndex = project.sprints.findIndex(sprint => sprint._id === data.sprintId);

        if (sprintIndex !== -1) {
          const updatedSprints = [...project.sprints];
          
          updatedSprints[sprintIndex] = {
            ...updatedSprints[sprintIndex],
            tasks: remainingTasks
          };
    
          setProject({ ...project, sprints: updatedSprints });

          if(sprint._id === data.sprintId){
            setSprint({...updatedSprints[sprintIndex] });
          }
        }
      }
      console.log('task del from socket', data);
    });
  
    return () => {
      socket.off(NEW_TASK);
      socket.off(PROJECT_DELETED);
      socket.off(PROJECT_UPDATED);
      socket.off(TASK_DELETED);
      socket.off(TASK_UPDATED);
    };

  },[socket, isLoading, sprint]);

  const rearangeArr = (arr, sourceIndex, destIndex) => {
    const arrCopy = [...arr];
    const [removed] = arrCopy.splice(sourceIndex, 1);
    arrCopy.splice(destIndex, 0, removed);

    return arrCopy;
  };

  const updateSprintStatusPosition = (source, destination, sprintId) => {
    const sprintIndex = project.sprints.findIndex(sprint => sprint._id === sprintId);
  
    if (sprintIndex !== -1) {
      const updatedSprints = [...project.sprints];
      updatedSprints[sprintIndex] = {
        ...updatedSprints[sprintIndex],
        status: rearangeArr(sprint.status, source.index, destination.index)
      };
      const updated_sprint = updatedSprints.find(sprint => sprint._id === sprintId);

      setProject({ ...project, sprints: updatedSprints });
      selectSprint(updated_sprint);
    }
  };

  const updateSprintTaskStatus = async(taskIndex, status, sprintId) => {
    const sprintIndex = project.sprints.findIndex(s => s._id === sprintId);

    if (sprintIndex !== -1) {

      const task = sprint.tasks[taskIndex];
      await dispatch(updateTask(task._id, { status }));

      const updatedTasks = [...sprint.tasks];
      updatedTasks[taskIndex] = {...updatedTasks[taskIndex], status };

      selectSprint({
        ...sprint,
        tasks: updatedTasks,
      });

      const updatedSprints = [
        ...project.sprints.slice(0, sprintIndex),
        {
          ...sprint,
          tasks: updatedTasks,
        },
        ...project.sprints.slice(sprintIndex + 1)
      ];

      setProject({
        ...project,
        sprints: updatedSprints,
      });

      await dispatch(updateProjectSprint(sprint._id, {
        tasks: updatedTasks.map(task => task._id)
      }));
    }
  };

  const updateSprintTaskPostion = async(source, destination, sprintId) => {
    const sprintIndex = project.sprints.findIndex(sprint => sprint._id === sprintId);
  
    if (sprintIndex !== -1) {
      const tasks = rearangeArr(sprint.tasks.filter(task => task.status && task.status.name), source.index, destination.index);

      const noStatusTasks = sprint.tasks.filter(task => !task.status);

      const updatedSprints = [...project.sprints];
      
      updatedSprints[sprintIndex] = {
        ...updatedSprints[sprintIndex],
        tasks: [...tasks, ...noStatusTasks]
      };

      selectSprint({
        ...sprint,
        tasks: [...tasks, ...noStatusTasks]
      });
    
      setProject({ ...project, sprints: updatedSprints });

      await dispatch(updateProjectSprint(sprint._id, {
        tasks: sprint.tasks.map(task => task._id)
      }));
    }
  };

  const onDragEnd = async(result) => {
    const { source, destination } = result;

    if (!destination) return; 

    if (destination.droppableId === 'Parent') {
      updateSprintStatusPosition(source, destination, sprint._id);
      
      await dispatch(updateProjectSprint(sprint._id, {
        status: rearangeArr(sprint.status, source.index, destination.index)
      }));
      
    } else if (destination.droppableId !== source.droppableId) {
      const taskIndex = sprint.tasks.findIndex(task => task._id === result.draggableId);
      const status = sprint.status.find(status => status._id === result.destination.droppableId);

      if (taskIndex !== -1 && status) {
        updateSprintTaskStatus(taskIndex, status, sprint._id);
      }
  
    } else {
      updateSprintTaskPostion(source, destination, sprint._id);
    }

  };

  const selectSprint = (selectedSprint) => {
    setSprint(selectedSprint);
    localStorage.setItem('sprint_id', selectedSprint._id);
  };

  const toggleAddTaskDrawer = () =>{
    setOpenDrawer(!openDrawer);
  };

  const updateSprint = updatedSprint => {
    setSprint(updatedSprint);
  };

  const toggleUpdateTaskDrawer = () => {
    setOpenUpdateDrawer(!openUpdateDrawer);
  };

  const selectPreviewScreen = (screen) => {
    setPreviewScreen(screen);
  };

  const selectDueDate = (date) => {
    setDueDate(date);
  };

  if(isLoading) {
    return <Loader />;
  }
  
  return (
    <Box bgcolor='white' width={'100%'} height={'100vh'} sx={{overflowX:'hidden'}}>
      
      {/* header */}
      <ProjectHeader 
        project={project} 
        previewScreen={previewScreen}
        selectPreviewScreen={selectPreviewScreen} 
      />

      {/* project sprints */}
      <Box px={2} pt={0.5}>
      
        <ProjectSprints 
          project={project}  
          sprint={sprint}
          selectSprint={selectSprint}
        />
      
      </Box>
      
      <Divider />

      {/* showing task */}
         
      {previewScreen === 'board' && <BoardTaskContainer 
        sprint={sprint}
        toggleAddTaskDrawer={toggleAddTaskDrawer} 
        toggleUpdateTaskDrawer={toggleUpdateTaskDrawer}
        updateSprint={updateSprint}
      />}

      {previewScreen === 'list' && <ListTaskContainer
        sprint={sprint}
        onDragEnd={onDragEnd}
        toggleAddTaskDrawer={toggleAddTaskDrawer}
        toggleUpdateTaskDrawer={toggleUpdateTaskDrawer}
      />}

      {previewScreen === 'calendar' && <Calendar 
        toggleAddTaskDrawer={toggleAddTaskDrawer}
        toggleUpdateTaskDrawer={toggleUpdateTaskDrawer}
        tasks={sprint.tasks}
        selectDueDate={selectDueDate}
      />}

      {previewScreen === 'notes' && <ProjectNotes />}

      {previewScreen === 'whiteboard' && <Whiteboard />}

      

      {/* add task form */}
      { project && sprint && <AddTaskDrawer 
        sprint={sprint}
        project={project}
        open={openDrawer}
        toggleDrawer={toggleAddTaskDrawer}
        dueDate={dueDate}
      />}

      {/* update task drawer */}
      {sprint && <UpdateTaskDrawer
        open={openUpdateDrawer} 
        toggleDrawer={toggleUpdateTaskDrawer}
        sprint={sprint}
      />}
    </Box>
  );
}
