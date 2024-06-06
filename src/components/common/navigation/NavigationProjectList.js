import { Accordion, AccordionDetails, AccordionSummary, IconButton, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import { selectTeam } from '../../../reducers/team/teamSlice';
import { useSelector } from 'react-redux';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useNavigate, useParams } from 'react-router-dom';
import { CREATE_PROJECT, MANAGE_PROJECT, PROJECT } from '../../../utils/path';
import { Add, Settings } from '@mui/icons-material';
import { Box } from '@mui/system';
import { selectAdmin, selectTeamCreator } from '../../../reducers/auth/authSlice';

export default function NavigationProjectList({ open = false }) {
  
  const currentTeam = useSelector(selectTeam);
  const isTeamAdmin = useSelector(selectAdmin);
  const isTeamCreator = useSelector(selectTeamCreator);
  console.log(currentTeam);
  const navigate = useNavigate();
  const { id } = useParams();
  
  return (
    <Accordion disableGutters
      defaultExpanded
      elevation={0}
      sx={{
        '&:before': {
          display: 'none'
        }
      }}>
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        sx={{p:0, pr: 4}}
        id="panel-header"
        aria-controls="panel-content">
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? 'initial' : 'center',
            px: 2.5,
            '&:hover': {
              backgroundColor: '#fff'
            }
          }}
        >
          
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : 'auto',
              justifyContent: 'center'
            }}>
            <ElectricBoltIcon />
          </ListItemIcon>
        
          <ListItemText primary={'Projects'} sx={{ opacity: open ? 1 : 0 }} />
          
        </ListItemButton>
      </AccordionSummary>

      <AccordionDetails sx={{ mt: -2, backgroundColor:'#f5f7fd'}}>
        {
          (currentTeam.projects || []).map(project => project.project_name && <ListItemButton
            key={project._id}
            sx={{
              ml: 4,
              height:40,
              borderLeft:  id === project._id ? '2px solid black' : '1px solid #656f7d',
              '&:hover': {
                backgroundColor: '#f5f7fd'
              }
            }}
            onClick={() => navigate(`${PROJECT}/${project._id}`)}
          >
  
            <ListItemIcon
              sx={{
                minWidth:0,
                mr: 'auto',
                justifyContent: 'center'
              }}>

              <InsertDriveFileIcon 
                sx={{ 
                  fontSize: 14, 
                  color: id === project._id ? 'black' : 'default' 
                }} 
              />

            </ListItemIcon>
          
            <ListItemText sx={{ ml: 1, '&:hover .settingsIcon': { opacity: 1 } }}> 
              <Box
                fontSize={12}
                display={'flex'} 
                alignItems={'center'} 
                justifyContent={'space-between'}
                fontWeight={id === project._id ? 'bold' : ''}
              >

                {project.project_name} 

                {
                  (isTeamAdmin || isTeamCreator) &&
                <IconButton size='small' 
                  onClick={(e) => {
                    e.stopPropagation(),
                    navigate(`${MANAGE_PROJECT}/${project._id}`);
                  }}>
                  <Settings className="settingsIcon" sx={{ opacity: 0, fontSize: 14 }}  />
                </IconButton>
                }

              </Box> 
            </ListItemText>

          </ListItemButton>
          )
        }
        

        {/* add button */}
        <ListItemButton
          sx={{
            ml: 4,
            height:40,
            '&:hover': {
              backgroundColor: '#f5f7fd'
            }
          }}
          onClick={() => navigate(`${CREATE_PROJECT}`)}
        >
  
          <ListItemIcon
            sx={{
              minWidth:0,
              mr: 'auto',
              justifyContent: 'center'
            }}>
            <Add fontSize='14px' />
          </ListItemIcon>
          
          <ListItemText  sx={{ml: 1}}> 
            <span style={{fontSize:'14px'}}>Create New Project</span> 
          </ListItemText>

        </ListItemButton>
      </AccordionDetails>
    </Accordion>
  );
}
