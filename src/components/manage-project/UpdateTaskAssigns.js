import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTeam } from '../../reducers/team/teamSlice';
import { Avatar, Box, Divider, IconButton, Menu, MenuItem } from '@mui/material';
import { Add, NotInterested } from '@mui/icons-material';

export default function UpdateTaskAssigns({ task,  size = 30, updateAssigns }) {

  const [anchorEl, setAnchorEl] = useState(null);
  const [assigns, setAssigns] = useState([]);

  const open = Boolean(anchorEl);
  const currentTeam = useSelector(selectTeam);


  useEffect(() => {
    setAssigns(task.assigns);
  },[task]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  const addMemeber = member => {
    if(!assigns.includes(member._id)){
      setAssigns(prev => [...prev, member]);
      updateAssigns(task, [...assigns, member].map(assign => assign._id && assign._id));
    }
  };

  const removeMember = member => {
    const reminingMembers = assigns.filter(({ _id }) => _id !== member._id);
    setAssigns(reminingMembers);
    updateAssigns(task, reminingMembers.map(assign => assign._id && assign._id));
  };

  return (
    <>
      <Box display='flex' alignItems='center' columnGap={1}>
        {
          (assigns || []).map((member,i) => member && <Avatar
            key={`${member._id}_${i}`}
            src={member?.photoURL}
            sx={{ width: size, height: size, ':hover': { opacity: 0.2 }, transition: '0.5s' }} 
            onClick={() => removeMember(member)}
            className='cursor-pointer'
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
          <Avatar sx={{ width: size, height: size }}>
            <Add />
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
          currentTeam.members.map((member,i) => <MenuItem
            key={`${member._id}_${i}`}
            onClick={() => {
              addMemeber(member);
              handleClose();
            }}
          >
            <Avatar src={member.photoURL} /> {member.name}
          </MenuItem>)
        }

        <Divider />

        <MenuItem 
          onClick={() => {
            updateAssigns(task,[]);
            setAssigns([]);
            handleClose();
          }}
        >
          <NotInterested sx={{ mr: 0.5, fontSize: 16 }} /> <span style={{fontSize:13}}>CLEAR</span>
        </MenuItem>

      </Menu>
    
    </>
  );
}
