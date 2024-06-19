import { Box, Grid, Typography } from '@mui/material';
import React from 'react';
import NavigationTopbar from '../../components/common/navigation/NavigationTopbar';
import MyTeams from '../../components/Overview/MyTeams';
import MyProjects from '../../components/Overview/MyProjects';
import MyTasks from '../../components/Overview/MyTasks';
import Me from '../../components/Overview/Me';

export default function Overview() {
  return (
    <Box width={'100%'}>
      <NavigationTopbar />

      <Box m={2}>

        <Grid container spacing={2}>
        
          <Grid item xs={8}>
            <MyTeams />
          </Grid>
          
          <Grid item xs={4}>
            <Me />
          </Grid>

          <Grid item xs={7}>
            <MyProjects />
          </Grid>

          <Grid item xs={5}>
            <MyTasks />
          </Grid>

          

        </Grid>



      </Box>
      <Typography variant='h6' m={2}>Coming soon..</Typography>
    </Box>
  );
}
