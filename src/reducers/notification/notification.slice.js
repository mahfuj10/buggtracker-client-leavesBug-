import axios from 'axios';

export const saveNotification = (doc) => async () =>  {
  try{
    const response = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/notification/create`, doc);
  
    return response.data;
  }catch(err){
    return err;
  }
};

export const getNotifications = (userId) => async () =>  {
  try{
    const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/notification/get?id=${userId}`);
  
    return response.data;
  }catch(err){
    return err;
  }
};

export const markAllNotificationAsRead = (notificationIds, userObjectId) => async () =>  {
  try{
    const response = await axios.put(`${process.env.REACT_APP_SERVER_BASE_URL}/notification/read?id=${userObjectId}`, {
      ids: notificationIds
    });
  
    return response.data;
  }catch(err){
    return err;
  }
};

export const removeUserFromAllNotifications = (userId) => async () =>  {
  try{
    const response = await axios.delete(`${process.env.REACT_APP_SERVER_BASE_URL}/notification/visibleTo/all?id=${userId}`);
  
    return response.data;
  }catch(err){
    return err;
  }
};

export const removeUserFromVisibleTo = (userId, notificationId) => async () =>  {
  try{
    const response = await axios.delete(`${process.env.REACT_APP_SERVER_BASE_URL}/notification/visibleTo/${notificationId}?id=${userId}`);
  
    return response.data;
  }catch(err){
    return err;
  }
};