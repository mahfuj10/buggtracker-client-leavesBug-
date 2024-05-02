import { Avatar, Box, IconButton, Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from 'react-redux';
import { selectTeam } from '../../reducers/team/teamSlice';

export default function TaskAssignDropdown({ assigns, setAssigns }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const currentTeam = useSelector(selectTeam);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const addMemeber = (member) => {
    if(!assigns.includes(member._id)){
      setAssigns(prev => [...prev, member._id]);
      setSelectedMembers(prev => [...prev, member]);
    }
    handleClose();
  };
   
    
  return (

    <>
      <Box display='flex' alignItems='center' columnGap={2}>
        {
          selectedMembers.map(member => <Avatar 
            key={member._id}
            src={member.photoURL}
            sx={{ width: 40, height: 40 }} 
          />
          )
        }
        <IconButton
          onClick={handleClick}
          size="small"
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar sx={{ width: 40, height: 40 }}>
            <AddIcon />
          </Avatar>
        </IconButton>
      </Box>
          
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {
          currentTeam.members.map(member => <MenuItem key={member._id} onClick={() => addMemeber(member)}>
            <Avatar src={member.photoURL} /> {member.name}
          </MenuItem>)
        }
      </Menu>
    </>
  );
}
