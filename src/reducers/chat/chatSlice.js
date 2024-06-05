import axios from 'axios';

export const createChat = (data) => async () =>  {
  try{
    const response = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/chat/create`, data);
  
    return response.data;
  }catch(err){
    return err;
  }
};

export const getChats = (teamId, userDBId) => async () =>  {
  try{
    const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/chat/get?teamId=${teamId}&userId=${userDBId}`);
  
    return response.data;
  }catch(err){
    return err;
  }
};
 

export const saveMessage = (data) => async () =>  {
  try{
    const response = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/chat/message`, data);
  
    return response.data;
  }catch(err){
    return err;
  }
};
 
export const getMessages = (chatId, limit, before) => async () =>  {
  try{
    const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/chat/message/${chatId}?limit=${limit}&before=${String(before)}`);
  
    return response.data;
  }catch(err){
    return err;
  }
};
 
export const readMessages = (messageIds, userId) => async () =>  {
  try{
    const response = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/chat/message/read?id=${userId}`, { messageIds });
  
    return response.data;
  }catch(err){
    return err;
  }
};
 
 
export const updateMessage = (messageId, doc) => async () =>  {
  try{
    const response = await axios.put(`${process.env.REACT_APP_SERVER_BASE_URL}/chat/message/update?id=${messageId}`, doc);
  
    return response.data;
  }catch(err){
    return err;
  }
};
 
export const deleteMessage = (messageId) => async () =>  {
  try{
    const response = await axios.delete(`${process.env.REACT_APP_SERVER_BASE_URL}/chat/message/delete?id=${messageId}`);
  
    return response.data;
  }catch(err){
    return err;
  }
};
 