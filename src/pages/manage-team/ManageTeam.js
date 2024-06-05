import React, { useEffect, useState } from 'react';
import { Box, Grid, Button, Typography } from '@mui/material';
import NavigationTopbar from '../../components/common/navigation/NavigationTopbar';
import TeamProfile from '../../components/setting/manage-team/TeamProfile';
import TeamMembers from '../../components/setting/manage-team/TeamMembers';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getTeamById } from '../../reducers/team/teamSlice';
import Loader from '../../components/common/Loader/Loader';
import { Delete } from '@mui/icons-material';
import socket from '../../utils/socket';
import { TEAM_DELETED, TEAM_UPDATED_GLOBAL } from '../../utils/socket-events';
import TeamPendingMembers from '../../components/setting/manage-team/TeamPendingMembers';
import DeleteTeamDialog from '../../components/setting/me/DeleteTeamDialog';
import { SETTING } from '../../utils/path';
import { useSelector } from 'react-redux';
import { selectUser } from '../../reducers/auth/authSlice';

export default function ManageTeam() {
  
  const [team, setTeam] = useState({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentLoginUser = useSelector(selectUser);

  useEffect(() => {

    const fetchTeam = async() => {
      try{
        setIsLoading(true);

        const res = await dispatch(getTeamById(id));
        setTeam(res);
      }catch(err){
        console.error(err);
      }
      setIsLoading(false);
    };

    fetchTeam();
  },[id]);

  useEffect(() => {
    socket.on(TEAM_UPDATED_GLOBAL, updated_team => {
      if(id === updated_team._id){
        setTeam(updated_team);
      }
    });

    socket.on(TEAM_DELETED, data => {
      if(id === data.teamId){
        navigate(SETTING);
      }
    });
  }, [socket]);

  if(isLoading) {
    return <Loader />;
  }

  const toggleDeleteDialog = () => {
    setOpenDeleteDialog(!openDeleteDialog);
  };

  return (
    <Box width={'100%'}>
    
      <NavigationTopbar />

      <br />
      
      <Typography position={'absolute'} mt={-2} variant='caption' pl={1}>
          This is an private page, for testing purpose you can test it.
      </Typography>

      {
        team._id && 
        <Box>

          <Grid container p={2} bgcolor={'white'} spacing={2}>
        
            <Grid item xs={5.9}>

              <TeamProfile team={team} />
            </Grid>
        
            <Grid item xs={6.1}>

              <TeamPendingMembers team={team} />

              <Button 
                variant='contained' 
                startIcon={<Delete />}
                color='error'
                sx={{ boxShadow: 0, borderRadius: 0, mt: 5 }}
                onClick={toggleDeleteDialog}
                disabled={team.createor?._id !== currentLoginUser._id}
              >
                Delete Team
              </Button>

              {/* team delete confirmation */}
              <DeleteTeamDialog
                open={openDeleteDialog}
                toggleDialog={toggleDeleteDialog}
                selectedTeam={team}
              />

            </Grid>

          </Grid>
          
          <Box mt={1}>
            <TeamMembers team={team} />
          </Box>

        </Box>
      }
    </Box>
  );
}
