import {  ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NavigationItem({ item , open}) {
  
  const Icon = item.icon; 
  const navigate = useNavigate();

  return (
    <ListItem disablePadding sx={{ display: 'block' }}>
      <ListItemButton
        sx={{
          minHeight: 48,
          justifyContent: open ? 'initial' : 'center',
          px: 2.5,
        }}
        onClick={() => navigate(item.path)}
      >

        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: open ? 3 : 'auto',
            justifyContent: 'center',
          }}
        >
          <Icon />
        </ListItemIcon>
        
        <ListItemText primary={item.title} sx={{ opacity: open ? 1 : 0 }} />
      </ListItemButton>
    </ListItem>
  );
}
