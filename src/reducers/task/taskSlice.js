import axios from 'axios';

export const createTask = (data) => async () =>  {
  try{
    const response = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/task/create`, data);
  
    return response.data;
  }catch(err){
    return err;
  }
};

export const getTaskById = (taskId) => async () =>  {
  try{
    const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/task/get?id=${taskId}`);
  
    return response.data;
  }catch(err){
    return err;
  }
};

export const updateTask = (id, data) => async () =>  {
  try{
    const response = await axios.put(`${process.env.REACT_APP_SERVER_BASE_URL}/task/update?id=${id}`, data);
  
    return response.data;
  }catch(err){
    return err;
  }
};

export const getByCreator = (creatorId, page = 1, search = '') => async () =>  {
  try{
    const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/task/my?id=${creatorId}&search=${search}&page=${page}`);
  
    return response.data;
  }catch(err){
    return err;
  }
};

export const deleteTasks = (ids) => async () =>  {
  try{
    const response = await axios.delete(`${process.env.REACT_APP_SERVER_BASE_URL}/task/delete?ids=${ids.join(',')}`);
  
    return response.data;
  }catch(err){
    return err;
  }
};