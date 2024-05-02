import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const projectSlice = createSlice({
  name: 'project',
  initialState: {   
    selectedProject: {},
    selectedSprint:  {},
    selectedTask: {},
    isDragging: false
  },
  reducers: {
    setProject: (state, action) => {
      state.selectedProject = action.payload;
    },
    setSprint: (state, action) => {
      state.selectedSprint = action.payload;
    },
    setTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    setDragging: (state, action) => {
      state.isDragging = action.payload;
    }
  }
});
 

export const createProject = (data) => async () =>  {
  try{
    const response = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/project/create`, data);

    return response.data;
  }catch(err){
    return err;
  }
};

export const updateProject = (projectId, data) => async () =>  {
  try{
    const response = await axios.put(`${process.env.REACT_APP_SERVER_BASE_URL}/project/update?id=${projectId}`, data);

    return response.data;
  }catch(err){
    return err;
  }
};

export const deleteProject = (projectId) => async () =>  {
  try{
    const response = await axios.delete(`${process.env.REACT_APP_SERVER_BASE_URL}/project/delete?id=${projectId}`);

    return response.data;
  }catch(err){
    return err;
  }
};

export const addProjectSprint = (projectId, data) => async () =>  {
  try{
    const response = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/project/add-sprint?projectId=${projectId}`, data);

    return response.data;
  }catch(err){
    return err;
  }
};

export const updateProjectSprint = (sprintId, data) => async () =>  {
  try{
    const response = await axios.put(`${process.env.REACT_APP_SERVER_BASE_URL}/project/update_sprint?id=${sprintId}`, data);

    return response.data;
  }catch(err){
    return err;
  }
};

export const deleteProjectSprint = (sprintId) => async () =>  {
  try{
    const response = await axios.delete(`${process.env.REACT_APP_SERVER_BASE_URL}/project/delete-sprint?id=${sprintId}`);

    return response.data;
  }catch(err){
    return err;
  }
};

export const addTaskIntoSprint = (projectId, taskId, sprintIndex) => async () =>  {
  try{
    const response = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/project/add-task?projectId=${projectId}&taskId=${taskId}`, { sprintIndex });

    return response.data;
  }catch(err){
    return err;
  }
};

export const getProjectById = (id) => async () =>  {
  try{
    const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/project?id=${id}`);

    return response.data;
  }catch(err){
    return err;
  }
};

export const { setProject, setSprint, setTask, setDragging } = projectSlice.actions;

export const selectProject = (state) => state.project.selectedProject;
export const selectSprint = (state) => state.project.selectedSprint;
export const selectTask = (state) => state.project.selectedTask;
export const selectDragging = (state) => state.project.isDragging;

export default projectSlice.reducer;
