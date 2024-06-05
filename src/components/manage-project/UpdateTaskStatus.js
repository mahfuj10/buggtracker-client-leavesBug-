import { Adjust, NotInterested } from '@mui/icons-material';
import { Button, Divider, Menu, MenuItem } from '@mui/material';
import React, { useEffect, useState } from 'react';

export default function UpdateTaskStatus({ task, status, updateStatus }) {

  const [anchorEl, setAnchorEl] = useState(null);
  const [initialStatus, setInitialStatus] = useState(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    setInitialStatus(task.status);
  }, [task]);

  const handleUpdateStatus = status => {
    handleClose();
    updateStatus(task, status);
    setInitialStatus(status);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        startIcon={<Adjust />}
        sx={{
          boxShadow: 0,
          fontSize: 10,
          backgroundColor: initialStatus?.color,
          border: 'none'
        }}
        variant={initialStatus ? 'contained' : 'outlined'}
        size="small"
        onClick={handleClick}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        {initialStatus ? initialStatus.name : 'Add status'}
      </Button>

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
          status.map(status => <MenuItem
            key={status.name}
            sx={{ textTransform: 'uppercase', fontSize: 13 }}
            onClick={() => handleUpdateStatus(status)}
          >
            <Adjust sx={{ mr: 0.5, fontSize: 16, color: status.color }} /> { status.name} 
          </MenuItem>)
        }

        <Divider />
        
        <MenuItem 
          onClick={() => handleUpdateStatus(null)}
        >
          <NotInterested sx={{ mr: 0.5, fontSize: 16 }} /> <span style={{fontSize:13}}>CLEAR</span>
        </MenuItem>
      </Menu>

    </div>
  );
}
