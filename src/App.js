import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { initAuthListener, selectIsInitialized, selectUser, setUser } from './reducers/auth/authSlice';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import PrivateRoute from './components/private/PrivateRoute';
import { LOGIN, REGISTER, HOME, RESET_PASSWORD, CREATE_TEAM, PENDING_INVITE, CREATE_PROJECT, PROJECT, SETTING, ME, MANAGE_PROJECT, MANAGE_TEAM } from './utils/path';
import socket from './utils/socket.js';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import CreateTeam from './pages/team/Create.js';
import CreateProject from './pages/project/Create.js';
import Project from './pages/project/Project.js';
import Invite from './pages/invite/Invite.js';
import Loader from './components/common/Loader/Loader.js';
import { selectTeam, setTeam } from './reducers/team/teamSlice.js';
import Setting from './pages/setting/Setting.js';
import Me from './pages/setting/me/Me.js';
import ManageProject from './pages/setting/manage-project/ManageProject.js';
import { TASK_DELETED, TEAM_UPDATED, USER_UPDATED } from './utils/socket-events.js';
import { selectProject, selectSprint, setProject, setSprint } from './reducers/project/projectSlice.js';
import ManageTeam from './pages/manage-team/ManageTeam.js';

function App() {

  const isInitialized = useSelector(selectIsInitialized);
  const currentTeam = useSelector(selectTeam);
  const currentLoginUser = useSelector(selectUser);
  const currentProject = useSelector(selectProject);
  const currentSprint = useSelector(selectSprint);
  
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = initAuthListener(dispatch);
     
    return unsubscribe;
  },[dispatch]);

  useEffect(() => {
    if(currentTeam.name){
      socket.emit('joinRoom', currentTeam.name, currentLoginUser.email);
    }

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    return () => {

    };

  }, [currentTeam]);

  useEffect(() => {
    socket.on(TEAM_UPDATED, (team) => {
      const initialTeamId = localStorage.getItem('team_id');
      if(initialTeamId === team._id){
        dispatch(setTeam(team));
      }
      if(!initialTeamId){
        dispatch(setTeam(team));
      }
    });
    
    socket.on(TASK_DELETED, (data) => {
      if(currentProject._id === data.projectId){
        console.log('1');
        if(currentSprint._id === data.sprintId){
          console.log('2');
          const remainingTasks = currentSprint.tasks.filter(task => !data.taskIds.includes(task._id));
          dispatch(setSprint({...currentSprint, tasks: remainingTasks}));
        } else {
          console.log('3');
          // const remainingTasks = currentSprint.tasks.filter(task => !data.taskIds.includes(task._id));
          // console.log(remainingTasks);
          // const sprintIndex = currentProject.sprints.findIndex(sprint => sprint._id === data.sprintId);
          // console.log(sprintIndex);
          // currentProject.sprints[sprintIndex] = {...currentProject.sprints[sprintIndex], tasks: remainingTasks};

          // dispatch(setProject({...currentProject}));
          // const sprintIndex = currentProject.sprints.findIndex(sprint => sprint._id === data.sprintId);
          // console.log(sprintIndex);
          // if (sprintIndex !== -1) {
          //   const updatedSprints = [...currentProject.sprints]; // Create a copy of the sprints array
          //   const remainingTasks = updatedSprints[sprintIndex].tasks.filter(task => !data.taskIds.includes(task._id));
          //   updatedSprints[sprintIndex] = { ...updatedSprints[sprintIndex], tasks: remainingTasks };
          //   dispatch(setProject({ ...currentProject, sprints: updatedSprints }));
          // } else {
          //   console.log('Sprint not found in current project');
          // }
        }
      }
      console.log('task del from socket', data);
    });

    return () => {
      socket.off('update_team');
      socket.off(TASK_DELETED);
    };
  }, [socket]);


  if(!isInitialized){
    return <Loader />;
  }

  console.log('currentLoginUser', currentLoginUser);
  console.log('currentTeam', currentTeam);
  
  return (
    <Router>
      <Routes>
        <Route path={LOGIN} element={<Login />} />
        <Route path={REGISTER} element={<Register />} />
        <Route path={RESET_PASSWORD} element={<ResetPassword />} />
        <Route path={`${PENDING_INVITE}/:path`} element={<Invite />} />
        <Route path={HOME} element={<PrivateRoute><Home /></PrivateRoute>}> 
          <Route path={CREATE_PROJECT} element={<CreateProject /> } />
          <Route path={`${PROJECT}/:id`} element={<Project /> } />
          <Route path={SETTING} element={<Setting /> } />
          <Route path={ME} element={<Me /> } />
          <Route path={`${MANAGE_PROJECT}/:id`} element={<ManageProject /> } />
          <Route path={`${MANAGE_TEAM}/:id`} element={<ManageTeam /> } />
        </Route>
        <Route path={CREATE_TEAM} element={<PrivateRoute><CreateTeam /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}
 
export default App;
