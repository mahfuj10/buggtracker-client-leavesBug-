import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { initAuthListener, selectIsInitialized, selectUser } from './reducers/auth/authSlice';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import PrivateRoute from './components/private/PrivateRoute';
import { LOGIN, REGISTER, HOME, RESET_PASSWORD, CREATE_TEAM, PENDING_INVITE, CREATE_PROJECT, PROJECT, SETTING, ME, MANAGE_PROJECT } from './utils/path';
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
import A from './components/task/ListTaskContainer.js';

function App() {

  const isInitialized = useSelector(selectIsInitialized);
  const currentTeam = useSelector(selectTeam);
  const currentLoginUser = useSelector(selectUser);
  
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = initAuthListener(dispatch);
     
    return unsubscribe;
  },[dispatch]);

  useEffect(() => {
    if(currentTeam.name){
      socket.emit('joinRoom', currentTeam.name);
    }

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    return () => {

    };

  }, [currentTeam]);

  useEffect(() => {
    socket.on('update_team', (team) => {
      dispatch(setTeam(team));
    });

    return () => {
      socket.off('update_team');
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
          <Route path={'a'} element={<A /> } />
          <Route path={`${PROJECT}/:id`} element={<Project /> } />
          <Route path={SETTING} element={<Setting /> } />
          <Route path={ME} element={<Me /> } />
          <Route path={`${MANAGE_PROJECT}/:id`} element={<ManageProject /> } />
        </Route>
        <Route path={CREATE_TEAM} element={<PrivateRoute><CreateTeam /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}
 
export default App;
