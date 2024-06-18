import { Flag, NotInterested } from '@mui/icons-material';
import { Button, Divider, Menu, MenuItem } from '@mui/material';
import React, { useEffect, useState } from 'react';

export default function UpdateTaskPriority({ priorities, task , updatePriority}) {
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [initialPriority, setInitialPriority] = useState({});

  const openPriorityMenu = Boolean(anchorEl);

  useEffect(() => {
    setInitialPriority(task.priority);
  }, [task]);

  const handleClickMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleUpdatePriority = (priority) => {
    setInitialPriority(priority);
    updatePriority(task, priority);
  }; 

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={openPriorityMenu ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={openPriorityMenu ? 'true' : undefined}
        onClick={e => handleClickMenu(e)}
        size='small'
        sx={{ color: 'black' }}
        startIcon={<Flag sx={{color: initialPriority?.color}} />}
      >
        {initialPriority?.name || 'Add priority'}
      </Button>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={openPriorityMenu}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {
          priorities.map(priority => <MenuItem
            key={priority.name}
            sx={{ textTransform: 'uppercase', fontSize: 13 }}
            onClick={() => {
              handleUpdatePriority(priority);
              handleCloseMenu();
            }}
          >
            <Flag sx={{ mr: 0.5, fontSize: 16, color: priority.color }} /> {priority.name}
          </MenuItem>)
        }

        <Divider />

        <MenuItem 
          onClick={() => {
            handleUpdatePriority(null);
            handleCloseMenu();
          }}
        >
          <NotInterested sx={{ mr: 0.5, fontSize: 16 }} /> <span style={{fontSize:13}}>CLEAR</span>
        </MenuItem>
      </Menu>
    </div>
  );
}
