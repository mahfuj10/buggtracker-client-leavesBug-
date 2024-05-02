import { Badge, Box, Chip, IconButton } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import React, { useState } from 'react';
import {  useSelector } from 'react-redux';
import { selectProject, selectSprint, setSprint } from '../../../reducers/project/projectSlice';
import { useDispatch } from 'react-redux';
import { Check, SelectAll } from '@mui/icons-material';

export default function ProjectSprints() {
  
  const [currentPage, setCurrentPage] = useState(0);

  const project = useSelector(selectProject);
  const { _id } = useSelector(selectSprint) ?? {};
  const sprints = project.sprints || [];
  const itemsPerPage = 4;

  const dispatch = useDispatch();
  
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
  
    return <Box display={'flex'} columnGap={1.5}> {sprints.slice(startIndex, endIndex).map(sprint => (
      <Box key={sprint._id}>
        <Badge
          badgeContent={sprint.tasks && sprint.tasks.length}
          color="secondary"
        >
          <Chip
            sx={{ fontSize: 11, color:'#656f7d', px: 1}}
            size='small' 
            label={sprint.name}
            icon={_id === sprint._id ? <Check /> : <SelectAll />}
            variant="outlined"
            color={_id === sprint._id ? 'success' : 'default'}
            onClick={() => dispatch(setSprint(sprint))}
          />
        </Badge>
      </Box>
    ))}
    </Box>;
  };

  return (
    <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
      {renderSprints()}
      <Box>
        <IconButton onClick={handlePrevPage} disabled={currentPage === 0}>
          <NavigateBeforeIcon />
        </IconButton>
        <IconButton onClick={handleNextPage} disabled={currentPage === totalPages - 1}>
          <NavigateNextIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
