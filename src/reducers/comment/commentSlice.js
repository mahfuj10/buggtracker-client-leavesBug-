import axios from 'axios';

export const createComment = (doc) => async () =>  {
  try{
    const response = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/comment/create`, doc);
    
    return response.data;
  }catch(err){
    return err;
  }
};
   

export const getComment = (taskId) => async () =>  {
  try{
    const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/comment/get?id=${taskId}`);
    
    return response.data;
  }catch(err){
    return err;
  }
};

export const deleteComment = (commentId) => async () =>  {
  try{
    const response = await axios.delete(`${process.env.REACT_APP_SERVER_BASE_URL}/comment/delete?id=${commentId}`);
    
    return response.data;
  }catch(err){
    return err;
  }
};

export const getCommentCount = (taskId) => async () =>  {
  try{
    const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/comment/count?id=${taskId}`);
    
    return response.data;
  }catch(err){
    return err;
  }
};
   