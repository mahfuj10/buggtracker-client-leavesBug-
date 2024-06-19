import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../../services/axios';

const initialState = {
  loading: false,
  message: '',
  team: {}
};

export const createTeam = createAsyncThunk(
  'team/data',
  async (data) => {
    const response = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/team/create`, data);

    return response.data;
  }
);

export const getTeamById = (id) => async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/team/id?id=${id}`);

    return response.data;
  } catch (error) {
    return error;
  }  
};

export const getTeamByCreator = (creatorId, search = '') => async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/team/my?id=${creatorId}&search=${search}`);

    return response.data;
  } catch (error) {
    return error;
  }  
};

export const updateTeamState = (id) => async (dispatch) => {
  try {
    const res = await dispatch(getTeamById(id));
      
    localStorage.setItem('team_id', res._id);

    dispatch(setTeam(res));

    return res;
  } catch (error) {
    return error;
  }  
};

export const deleteTeamAndReferences = (teamId) => async () => {
  try {
    const response = await axios.delete(`${process.env.REACT_APP_SERVER_BASE_URL}/team/delete/${teamId}/with-references`);

    return response.data;
  } catch (error) {
    return error;
  }  
};

export const updateTeam = (id, data) => async () => {
  try {
    const response = await axios.put(`${process.env.REACT_APP_SERVER_BASE_URL}/team/update?id=${id}`, data);

    return response.data;
  } catch (error) {
    return error;
  }  
};

export const dataSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    updateMessage: (state, { payload }) => {
      state.message = payload;
    },
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setTeam: (state, { payload }) => {
      state.team = payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTeam.fulfilled, (state) => {
        state.loading = false;
        state.message = 'Team created.';
      })
      .addCase(createTeam.rejected, (state) => {
        state.loading = false;
        state.message = 'Something went wrong!';
      });
  },
});

export const { updateMessage, setLoading, setTeam} = dataSlice.actions;
export const selectTeam = (state) => state.team.team;

export default dataSlice.reducer;
