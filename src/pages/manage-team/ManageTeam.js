import React from 'react';
import { Box, Grid } from '@mui/material';
import NavigationTopbar from '../../components/common/navigation/NavigationTopbar';
import TeamProfile from '../../components/setting/manage-team/TeamProfile';
import TeamMembers from '../../components/setting/manage-team/TeamMembers';
import TeamAdmins from '../../components/setting/manage-team/TeamAdmins';

export default function ManageTeam() {
  
  return (
    <Box width={'100%'}>
    
      <NavigationTopbar />

      <Grid container p={2} bgcolor={'white'} spacing={2}>
        
        <Grid item xs={6}>
          <TeamProfile />
        </Grid>
        
        <Grid item xs={6}>
          
        </Grid>

      </Grid>

      <Box>
        <TeamMembers />
      </Box>

    </Box>
  );
}
