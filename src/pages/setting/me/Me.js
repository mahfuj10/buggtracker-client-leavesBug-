import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../reducers/auth/authSlice';
import { Avatar, Box, Grid, InputBase, TextField, Typography } from '@mui/material';
import NavigationTopbar from '../../../components/common/navigation/NavigationTopbar';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useUtils } from '../../../utils/useUtils';
import PersonalDetails from '../../../components/setting/me/PersonalDetails';
import TeamJoined from '../../../components/setting/me/TeamJoined';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { selectTeam } from '../../../reducers/team/teamSlice';
import TeamInvited from '../../../components/setting/me/TeamInvited';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});
  

export default function Me() {

  const [tabPanel, setTabPanel] = React.useState('1');

  const currentLoginUser = useSelector(selectUser);
  const currentTeam = useSelector(selectTeam);

  const handleChangeTabPanel = (event, newValue) => {
    setTabPanel(newValue);
  };

  return (
    <Box width={'100%'} bgcolor={'white'}>
      
      <NavigationTopbar />
      

      <Box p={2}>

        <PersonalDetails />
       
        <TabContext value={tabPanel}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
           
            <TabList onChange={handleChangeTabPanel} aria-label="lab API tabs example">
              <Tab label="Team Joined" value="1" />
              <Tab label="Team Invited" value="2" />
            </TabList>

          </Box>
          
          

          <TabPanel value="1" sx={{ mt: -3}}>
            <Typography mt={1} display={'block'} variant='caption'>
              Group creator can not leave team untill they tranfer ownership
            </Typography>

            <TeamJoined  />
          </TabPanel>
          
          <TabPanel value="2">
            <TeamInvited />
          </TabPanel>
        </TabContext>
      
      </Box>
        
    </Box>
  );
}
