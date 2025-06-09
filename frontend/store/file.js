
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  isLoading: false,
  FileTrees:{},
};





export const fetchFileTree = createAsyncThunk(
  'projects/fetchFileTree',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/file/get/${projectId}`,
        { withCredentials: true }
      );
      return response?.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return rejectWithValue(err.response.data.message);
      } else {
        return rejectWithValue('Failed to fetch file tree');
      }
    }
  }
);



export const updateFileContent = createAsyncThunk(
  'projects/updateFileContent',
  async ({ projectId, filename, content }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        'http://localhost:3000/file/update',
        { projectId, filename, content },
        { withCredentials: true }
      );
      console.log(response.data.data.fileTree," iska response chahiye")
      return response.data.data.fileTree; // return for updating local state
    } catch (err) {
      if (err.response && err.response.data) {
        return rejectWithValue(err.response.data.message);
      } else {
        return rejectWithValue('Failed to update file content');
      }
    }
  }
);



export const deleteFileFromProject = createAsyncThunk(
  'projects/deleteFileFromProject',
  async ({ projectId, filename }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        'http://localhost:3000/file/delete',
        { projectId, filename },
        { withCredentials: true }
      );
      return { filename }; // return to remove from local Redux state
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete file');
    }
  }
);


export const renameFileInProject = createAsyncThunk(
  'projects/renameFileInProject',
  async ({ projectId, oldFilename, newFilename }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        'http://localhost:3000/file/rename',
        { projectId, oldFilename, newFilename },
        { withCredentials: true }
      );
      return { oldFilename, newFilename }; // update local Redux state
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to rename file');
    }
  }
);









const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
  },
  extraReducers: (builder)=>{
    builder
.addCase(fetchFileTree.pending,(state)=>{
        state.isLoading = true;

    }).addCase(fetchFileTree.fulfilled,(state,action)=>{

        state.isLoading = false;
        state.FileTrees = action?.payload?.fileTree;
    }).addCase(fetchFileTree.rejected,(state,action)=>{
        state.isLoading = false;
        state.FileTrees = [];
    }) .addCase(updateFileContent.fulfilled, (state, action) => {
  state.FileTrees = action.payload;
  state.error = null;
})
.addCase(updateFileContent.rejected, (state, action) => {
  state.error = action.payload;
})
    .addCase(deleteFileFromProject.fulfilled, (state, action) => {
      const { filename } = action.payload;
      delete state.FileTrees[filename];
    })
    .addCase(renameFileInProject.fulfilled, (state, action) => {
      const { oldFilename, newFilename } = action.payload;
      if (state.FileTrees[oldFilename]) {
        state.FileTrees[newFilename] = state.FileTrees[oldFilename];
        delete state.FileTrees[oldFilename];
      }
    });


}

})


export default fileSlice.reducer;
