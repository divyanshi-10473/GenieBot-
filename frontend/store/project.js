
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  isLoading: false,
  ProjectsList: [],
};




  export const createProject = createAsyncThunk(
    "projects/createProject",
    async (name, { rejectWithValue }) => {
        console.log("Creating project with name:", name);
      try {
        const response = await axios.post(`http://localhost:3000/project/create`, name, {
          withCredentials: true,
        });
        return response?.data;
      } catch (err) {
        if (err.response && err.response.data) {
          return rejectWithValue(err.response.data.message);
        } else {
          return rejectWithValue("Something went wrong");
        }
      }
    }
  );

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:3000/project/get", {
        withCredentials: true,
      });
      
      return response?.data; 
    } catch (err) {
      if (err.response && err.response.data) {
        return rejectWithValue(err.response.data.message);
      } else {
        return rejectWithValue("Failed to fetch subjects");
      }
    }
  }
)




export const inviteCollaborator = createAsyncThunk(
  'projects/inviteCollaborator',
  async ({ projectId, invitedUserId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        'http://localhost:3000/project/invite',
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
      const response = await axios.get(`http://localhost:3000/project/get/invites/${projectId}`, {
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

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
  },
  extraReducers: (builder)=>{
    builder.addCase(fetchProjects.pending,(state)=>{
        state.isLoading = true;

    }).addCase(fetchProjects.fulfilled,(state,action)=>{

        state.isLoading = false;
        state.ProjectsList = action?.payload?.data;
    }).addCase(fetchProjects.rejected,(state,action)=>{
        state.isLoading = false;
        state.ProjectsList = [];
    }) 
      .addCase(fetchInvitesByProjectId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvitesByProjectId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invites = action?.payload;
      })
      .addCase(fetchInvitesByProjectId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Something went wrong';
      });
}

})


export default projectSlice.reducer;
