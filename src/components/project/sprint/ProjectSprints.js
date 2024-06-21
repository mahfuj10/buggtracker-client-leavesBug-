import { Badge, Box, Button, Chip, IconButton } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import React, { useState } from 'react';
import { Add, Check, SelectAll } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { MANAGE_PROJECT } from '../../../utils/path';

export default function ProjectSprints({ project, sprint, selectSprint }) {
  
  const [currentPage, setCurrentPage] = useState(0);

  const navigate = useNavigate();

  const sprints = project.sprints || [];
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(sprints.length / itemsPerPage);
  
  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages - 1));
  };
  
  const handlePrevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 0));
  };
  
  const renderSprints = () => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, sprints.length);
  
    return <Box display={'flex'} columnGap={1.5}> {sprints.slice(startIndex, endIndex).map(sprintItem => (
      <Box key={sprintItem._id} onClick={() => selectSprint(sprintItem)}>
        <Badge
          badgeContent={sprintItem.tasks && sprintItem.tasks.length}
          color="secondary"
          className='cursor-pointer'
        >
          <Chip
            sx={{ fontSize: 11, color:'#656f7d', px: 1}}
            size='small' 
            label={sprintItem.name}
            icon={sprint._id === sprintItem._id ? <Check /> : <SelectAll />}
            variant="outlined"
            color={sprint._id === sprintItem._id ? 'success' : 'default'}
          />
        </Badge>
      </Box>
    ))}
    </Box>;
  };

  return (
    <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
      {
        !sprints.length &&
        <Button 
          variant='text'
          startIcon={<Add />}
          sx={{ color: 'black' }}
          onClick={() => navigate(`${MANAGE_PROJECT}/${project._id}`)}
        >
            Add Sprint
        </Button>
      }
      {
        renderSprints()
      }
      <Box>
        <IconButton onClick={handlePrevPage} disabled={currentPage === 0}>
          <NavigateBeforeIcon />
        </IconButton>

        <IconButton onClick={handleNextPage} disabled={(currentPage === totalPages - 1) || !sprints.length}>
          <NavigateNextIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
