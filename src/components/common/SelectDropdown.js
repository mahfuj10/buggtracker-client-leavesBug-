import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';

export default function SelectDropdown({ title, list, value, width = 100, func}) {
  

  return (
    <FormControl sx={{minWidth: width}}>
      <InputLabel id="demo-simple-select-autowidth-label">{title}</InputLabel>
      <Select
        labelId="demo-simple-select-autowidth-label"
        id="demo-simple-select-autowidth"
        value={value}
        onChange={ e => func(e.target.value)}
        fullWidth
        label="Priority"
      >
        {list.map(item => <MenuItem value={item} key={item}>{item}</MenuItem>)}
      </Select>
    </FormControl>
  );
}
