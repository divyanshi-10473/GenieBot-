import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  isLoading: false,
  invites: [],
  inviteProject:[],
};

export const inviteCollaborator = createAsyncThunk(
  'projects/inviteCollaborator',
  async ({ projectId, invitedUserId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        'http://localhost:3000/projectInvites/send',
        { projectId, invitedUserId },
        { withCredentials: true }
      );

      return response?.data;
    } catch (err) {
      if (err.response?.data?.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue('Failed to send invite');
    }
  }
);



export const fetchInvitesByProjectId = createAsyncThunk(
  'projectInvites/fetchInvitesByProjectId',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:3000/projectInvites/get/${projectId}`, {
        withCredentials: true,
      });
      return response.data.invites; 
    } catch (err) {
      if (err.response && err.response.data) {
        return rejectWithValue(err.response.data.message);
      } else {
        return rejectWithValue('Failed to fetch project invites');
      }
    }
  }
);


export const fetchUserInvites = createAsyncThunk(
  'projectinvites/fetchUserInvites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://localhost:3000/projectInvites/fetch', {
        withCredentials: true,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch invites');
    }
  }
);

export const acceptInvite = createAsyncThunk(
  'invites/acceptInvite',
  async (inviteId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/projectInvites/accept/${inviteId}`,
        {},
        { withCredentials: true } 
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const rejectInvite = createAsyncThunk(
  'invites/rejectInvite',
  async (inviteId, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/projectInvites/reject/${inviteId}`,
        {},
        { withCredentials: true }
      );
      return response.data; // ✅ You missed returning this
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reject invite');
    }
  }
);

export const deleteInvite = createAsyncThunk(
  'projectInvites/deleteInvite',
  async (inviteId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`http://localhost:3000/projectInvites/delete/${inviteId}`,{
      withCredentials: true,
      })
      return { inviteId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete invite');
    }
  }
);

const inviteSlice = createSlice({
  name: 'invites',
  initialState,
  reducers: {
  },
  extraReducers: (builder)=>{
    builder
      .addCase(fetchInvitesByProjectId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvitesByProjectId.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('Fetched invites:', action.payload);
        state.invites = action?.payload;
      })
      .addCase(fetchInvitesByProjectId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Something went wrong';
      })  .addCase(fetchUserInvites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserInvites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inviteProject = action.payload;
      })
      .addCase(fetchUserInvites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
}

});


export default inviteSlice.reducer;