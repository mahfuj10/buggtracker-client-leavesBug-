import { Badge, Box, Chip, IconButton } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import React, { useEffect, useState } from 'react';
import { selectProject, selectSprint, setSprint } from '../../../reducers/project/projectSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Check, SelectAll } from '@mui/icons-material';
import socket from '../../../utils/socket';
import { PROJECT_UPDATED } from '../../../utils/socket-events';

export default function ProjectSprints() {
  
  const [currentPage, setCurrentPage] = useState(0);

  const currentProject = useSelector(selectProject);
  const currentSprint = useSelector(selectSprint);
  const sprints = currentProject.sprints || [];
  const itemsPerPage = 4;

  const dispatch = useDispatch();

  // useEffect(() => {
  //   socket.on(PROJECT_UPDATED, (updated_project) => {
  //     console.log('from socket.io updated_project {ProjectSprints.js}', updated_project);
  //     console.log('1',);
  //     // dispatch(setProject(updated_project));
  //     const sprintIds = updated_project.sprints.map(sprint => sprint._id);
  //     console.log(sprintIds, currentSprint);
  //     if(!sprintIds.includes(currentSprint && currentSprint._id) && updated_project.sprints && updated_project.sprints[0]){
  //       dispatch(setSprint(updated_project.sprints[0]));
  //     }
  //   });

  // },[socket]);
  
  const totalPages = Math.ceil(sprints.length / itemsPerPage);
  
  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages - 1));
  };
  
  const handlePrevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 0));
  };

  const handleSelectSprint = async(selectedSprint) => {
    dispatch(setSprint(selectedSprint));
  };
  
  const renderSprints = () => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, sprints.length);
  
    return <Box display={'flex'} columnGap={1.5}> {sprints.slice(startIndex, endIndex).map(sprint => (
      <Box key={sprint._id} onClick={() => handleSelectSprint(sprint)}>
        <Badge
          badgeContent={sprint.tasks && sprint.tasks.length}
          color="secondary"
        >
          <Chip
            sx={{ fontSize: 11, color:'#656f7d', px: 1}}
            size='small' 
            label={sprint.name}
            icon={currentSprint._id === sprint._id ? <Check /> : <SelectAll />}
            variant="outlined"
            color={currentSprint._id === sprint._id ? 'success' : 'default'}
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
