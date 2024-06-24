import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { initAuthListener, selectIsInitialized, selectUser, setAdmin, setUser } from './reducers/auth/authSlice';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import PrivateRoute from './components/private/PrivateRoute';
import { LOGIN, REGISTER, HOME, RESET_PASSWORD, CREATE_TEAM, PENDING_INVITE, CREATE_PROJECT, PROJECT, SETTING, ME, MANAGE_PROJECT, MANAGE_TEAM, CHAT, OVERVIEW, REPORTS, HELP_CENTER, RELEASES } from './utils/path';
import socket from './utils/socket.js';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import CreateTeam from './pages/team/Create.js';
import CreateProject from './pages/project/Create.js';
import Project from './pages/project/Project.js';
import Invite from './pages/invite/Invite.js';
import Loader from './components/common/Loader/Loader.js';
import { getTeamById, selectTeam, setTeam } from './reducers/team/teamSlice.js';
import Setting from './pages/setting/Setting.js';
import Me from './pages/setting/me/Me.js';
import ManageProject from './pages/setting/manage-project/ManageProject.js';
import { REMOVE_MEMBER_FROM_TEAM, TEAM_DELETED, TEAM_UPDATED } from './utils/socket-events.js';
import ManageTeam from './pages/manage-team/ManageTeam.js';
import Chat from './pages/chat/Chat.js';
import Overview from './pages/overview/Overview.js';
import Reports from './pages/Reports/Reports.js';
import Releases from './pages/releases/Releases.js';
import HelpCenter from './pages/help-center/HelpCenter.js';

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
    socket.on(TEAM_UPDATED, (team) => {
      const initialTeamId = localStorage.getItem('team_id');

      if(initialTeamId === team._id){
        dispatch(setTeam(team));
      }

      if(!initialTeamId){
        dispatch(setTeam(team));
      }

      if((team.admins || []).findIndex(admin => admin._id === currentLoginUser._id) !== -1){
        dispatch(setAdmin(true));
      } else {
        dispatch(setAdmin(false));
      }
    });
    
    if(currentLoginUser){
      const userId = `${currentLoginUser.email}_A`;
      socket.emit('userId', userId);
    }

    socket.on(REMOVE_MEMBER_FROM_TEAM, (data) => {
      if(currentLoginUser?._id === data.userId){
        const remining_teams = currentLoginUser.teamJoined.filter(team => team._id !== data.teamId);
        if(!remining_teams.length){
          localStorage.removeItem('team_id');
          location.reload();
        } else {
          localStorage.setItem('team_id', remining_teams[0]._id);
          fetchTeam(remining_teams[0]._id);   
        }
        dispatch(setUser({
          ...currentLoginUser,
          teamJoined: remining_teams
        }));
      }
    });

    socket.on(TEAM_DELETED, data => {
      if(currentLoginUser){
        const remining_teams = currentLoginUser.teamJoined.filter(team => team._id !== data.teamId);
        if(!remining_teams.length){
          localStorage.removeItem('team_id');
          dispatch(setTeam({}));
          
        } else {
          localStorage.setItem('team_id', remining_teams[0]._id);
          fetchTeam(remining_teams[0]._id);          
        }
        dispatch(setUser({
          ...currentLoginUser,
          teamJoined: remining_teams
        }));
      }
    });

    return () => {
      socket.off(TEAM_UPDATED);
      socket.off(TEAM_DELETED);
      socket.off(REMOVE_MEMBER_FROM_TEAM);
    };
  }, [socket, currentLoginUser]);


  const fetchTeam = async(teamId) => {
    const team = await dispatch(getTeamById(teamId));
    dispatch(setTeam(team));
  };

  if(!isInitialized){
    return <Loader />;
  }

  // console.log('currentLoginUser', currentLoginUser);
  // console.log('currentTeam', currentTeam);
  
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
          <Route path={CHAT} element={<Chat /> } />
          <Route path={`${MANAGE_PROJECT}/:id`} element={<ManageProject /> } />
          <Route path={`${MANAGE_TEAM}/:id`} element={<ManageTeam /> } />
          <Route path={OVERVIEW} element={<Overview /> } />
          <Route path={REPORTS} element={<Reports /> } />
          <Route path={RELEASES} element={<Releases /> } />
          <Route path={HELP_CENTER} element={<HelpCenter /> } />
        </Route>
        <Route path={CREATE_TEAM} element={<PrivateRoute><CreateTeam /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}
 
export default App;
