import React from 'react';
import Table from '@mui/material/Table';
import Box from '@mui/material/Box';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import { useSelector } from 'react-redux';
import { selectTeam } from '../../../reducers/team/teamSlice';

const cells = [
  'Name',
  'Email',
  'Role',
  'Action'
];

export default function TeamMembers() {

  const currentTeam = useSelector(selectTeam);

  return (
    <TableContainer component={Box} bgcolor={'white'} border={true}>
      <Table sx={{ width: '100%' }}>
        <TableHead>
          <TableRow>
            {
              cells.map(cel => <TableCell key={cel}>{cel}</TableCell>)
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {
            (currentTeam.members || []).map(member => (
              <TableRow
                key={member._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {member.name}
                </TableCell>
                
                <TableCell align="left">
                  {member.email}
                </TableCell>

                <TableCell align="left">
                  Role
                </TableCell>

                <TableCell align="left">
                  <ButtonGroup size='small' variant="contained">
                    <Button>One</Button>
                    <Button>Two</Button>
                    <Button>Three</Button>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}
