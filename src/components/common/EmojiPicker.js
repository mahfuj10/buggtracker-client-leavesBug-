import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import { AddReactionOutlined } from '@mui/icons-material';
import EmojiPickerReact from 'emoji-picker-react';
import { Box, Fade } from '@mui/material';

export default function EmojiPicker({ iconButtonSize = 'small', iconSize = '18px', onEmojiClick = () => {}, reactionsDefaultOpen = false, closeOnClick = false }) {

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
 
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>

      <IconButton
        size={iconButtonSize}
        sx={{ position: 'relative' }} 
        onClick={handleClick}
        id="fade-button"
        aria-controls={open ? 'fade-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <AddReactionOutlined sx={{ fontSize: iconSize }} />
      </IconButton>


      <Menu
        MenuListProps={{
          'aria-labelledby': 'fade-button',
        }}
        className='emoji-picker'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        
      >
        <EmojiPickerReact 
          reactionsDefaultOpen={reactionsDefaultOpen} 
          onEmojiClick={({emoji}) => {
            onEmojiClick(emoji);
            closeOnClick && handleClose();
          }} 
        />
        

      </Menu>
        
    </>
  );
}
