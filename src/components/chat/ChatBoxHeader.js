import { MoreVert, Search } from '@mui/icons-material';
import { Avatar, AvatarGroup, Box, IconButton, InputBase, Tooltip, Typography } from '@mui/material';
import React, { useRef } from 'react';

export default function ChatBoxHeader({ selectedChat, setSearchQuery }) {
    
  const inputRef = useRef(null);

  return (
    <Box 
      height={40} 
      bgcolor={'#005353'} 
      p={1}
      display={'flex'} 
      alignItems={'center'} 
      justifyContent={'space-between'}
      sx={{ borderRadius: '10px 10px 0px 0px' }}
    >

      <Box>

        <Typography 
          variant='body2'
          color={'white'}
          className='text-break' 
          title={selectedChat.chatName}
        >
          {selectedChat.chatName}
        </Typography>

        <Box sx={{float:'left'}}>
          <AvatarGroup total={selectedChat.participants?.length} sx={{mt: 0.5 }}>
            {
              selectedChat.participants?.slice(0,5).map(participant => <Tooltip 
                title={`${participant.name} - ${participant.email}`}
                key={participant._id}
              >
                <Avatar 
                  sizes='sm'
                  alt={`${participant.name}_image`} 
                  src={participant.photoURL} 
                  sx={{ width: 15, height: 15 }}
                />
              </Tooltip>
              )
            }
          </AvatarGroup>
        </Box>
      </Box>

      <Box display={'flex'} alignItems={'center'} >

        <InputBase
          inputRef={inputRef}
          onChange={e => setSearchQuery(e.target.value)}
          endAdornment={(
            <IconButton
              sx={{ color: 'white' }} 
              size='small' 
              onClick={() => inputRef.current && inputRef.current.focus()}
            >
              <Search />
            </IconButton>
          )
          }
          sx={{ color: 'white' }}
        />

        <IconButton sx={{ color: 'white' }} size='small'>
          <MoreVert />
        </IconButton>

      </Box>

    </Box>
  );
}
