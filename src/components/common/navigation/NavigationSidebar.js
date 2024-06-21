import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import WidgetsIcon from '@mui/icons-material/Widgets';
import RocketIcon from '@mui/icons-material/Rocket';
import MapsUgcIcon from '@mui/icons-material/MapsUgc';
import SettingsIcon from '@mui/icons-material/Settings';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import NavigationItem from './NavigationItem';
import BugReportIcon from '@mui/icons-material/BugReport';
import { useSelector } from 'react-redux';
import { selectTeam } from '../../../reducers/team/teamSlice';
import { Avatar, Chip, Tooltip, Typography } from '@mui/material';
import NavigationTeamSelectDropdown from './NavigationTeamSelectDropdown';
import NavigationProjectList from './NavigationProjectList';
import { CHAT, HELP_CENTER, LOGIN, ME, OVERVIEW, RELEASES, REPORTS, SETTING } from '../../../utils/path';
import { selectUser, setClientInnerWidth, signOut } from '../../../reducers/auth/authSlice';
import { Logout } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';


const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));
 

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);
 
const nav_items = [
  {
    title: 'Overview',
    icon: WidgetsIcon,
    path: OVERVIEW
  },
  
  {
    title: 'Reports',
    icon: BugReportIcon,
    path: REPORTS
  },
  {
    title: 'Releases',
    icon: RocketIcon,
    path: RELEASES
  },
  {
    title: 'Messages',
    icon: MapsUgcIcon,
    path: CHAT
  },
  {
    title: 'Settings',
    icon: SettingsIcon,
    path:SETTING
  },
  {
    title: 'Help Center',
    icon: SupportAgentIcon,
    path: HELP_CENTER
  }
];

export default function NavigationSidebar() {

  const [open, setOpen] = useState(true);
  
  const currentTeam = useSelector(selectTeam);
  const currentLoginUser = useSelector(selectUser);
  const drawer = useRef(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (drawer.current) {
      dispatch(setClientInnerWidth(drawer.current.clientWidth));
    }
  },[open]);

  const handleDrawer = () => {
    setOpen(!open);
  };

  const handleSignOut = () => {
    dispatch(signOut());
    localStorage.setItem('team_id', '');
    navigate(LOGIN);
  };
  
  return (
    <Box>
      <Drawer ref={drawer} variant="permanent" open={open}>
        
        <Box display='flex' justifyContent='end'>
          <IconButton size='small' onClick={handleDrawer}>
            {!open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>

        <DrawerHeader sx={{display:'flex', justifyContent:'center', mt: -2}}>
          <Box 
            visibility={!open ? 'hidden' : 'visible'} 
            sx={{ transition:'0.2s', }} 
            display='flex'
            alignItems='center' 
            justifyContent='center'
            columnGap={1}
          >
            {
              currentTeam.logo && <img alt='logo' src={currentTeam.logo} style={{ borderRadius: 5}} width={60} />
            }
            <Box>
              <Tooltip title={currentTeam.name}>
                <Typography variant='body1' fontWeight='bold'>
                  {
                    currentTeam.name?.length > 15 
                      ?
                      `${currentTeam.name.slice(0,14)}...` 
                      :
                      currentTeam.name
                  }
                </Typography>
              </Tooltip>
              <NavigationTeamSelectDropdown />
            </Box>
          </Box>
            
        </DrawerHeader>
        

        <Box mt={5} display='flex' flexDirection='column' justifyContent='space-between' height='100%'>

          <List>
            {
              nav_items.slice(0,4).map(item => <NavigationItem open={open} item={item} key={item.title} />)
            }
          </List>

          <List>
            <NavigationProjectList open={open} />
          </List>
 

          <List sx={{ mb: 2 }}>
            {
              nav_items.slice(4,6).map(item => <NavigationItem open={open} item={item} key={item.title} />)
            }

            <Chip
              avatar={<Avatar 
                onClick={() => navigate(ME)}
                className='cursor-pointer'
                alt={currentLoginUser.name}
                src={currentLoginUser.photoURL} 
              />}
              onDelete={handleSignOut}
              label={currentLoginUser.name}
              deleteIcon={<Logout />}
              variant="outlined"
              sx={{ ml: 2.5, mt: 1 }}
            />
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
