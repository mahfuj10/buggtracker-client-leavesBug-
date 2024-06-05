import { Avatar, Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, setInitialized } from '../../../reducers/auth/authSlice';
import { selectTeam, updateTeamState } from '../../../reducers/team/teamSlice';
import { RadioButtonUnchecked, RadioButtonChecked} from '@mui/icons-material';

export default function NavigationTeamSelectDropdown() {
 
  const currentLoginUser = useSelector(selectUser);
  const currentTeam = useSelector(selectTeam);
  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
 
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSwitchTeam = async(team) => {
    try {
      dispatch(setInitialized(false));

      await dispatch(updateTeamState(team._id));
    }catch(err){
      console.error(err);
    }
    dispatch(setInitialized(true));
  };

  return (
    <Box>
      <IconButton  aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick} size='small'>
        <LinearScaleIcon fontSize='10' />
      </IconButton>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {
          (currentLoginUser.teamJoined || []).map((team,i) => <MenuItem 
            disabled={team._id === currentTeam._id}
            sx={{ borderBottom: '1px solid whitesmoke' }} 
            key={`${team._id}_${i}`}
            onClick={() => handleSwitchTeam(team)}
          >

            <Box display={'flex'} minWidth={200} alignItems={'center'} justifyContent={'space-between'} borderBottom='1x solid red'>
              
              <Box display={'flex'} alignItems={'center'} columnGap={1}>
                <Avatar sx={{ borderRadius: 2, width: 30, height: 30}} alt={team.name} src={team.logo ? team.logo : 'team'} /> 

                <Typography component="div" variant="body1" 
                  sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {team.name}
                </Typography>

              </Box>
              <Box>
                <IconButton size='small'>
                  { 
                    team._id === currentTeam._id  
                      ?
                      <RadioButtonChecked />
                      :
                      <RadioButtonUnchecked />
                  }
                </IconButton>
              </Box>
            </Box>

          </MenuItem>)
        }
      </Menu>
    </Box>
  );
}
