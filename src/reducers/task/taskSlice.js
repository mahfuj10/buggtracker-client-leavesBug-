import axios from 'axios';

export const createTask = (data) => async () =>  {
  try{
    const response = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/task/create`, data);
  
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