import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

const client = {
  get: async (url) => {
    // Fake API call that returns after a timeout
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return {
      data: [
        { id: '1', name: 'First Protocol' },
        { id: '2', name: 'Second Protocol' }
      ]
    }
  },
  post: async (url, data) => {
    // Fake API call that returns after a timeout
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return {
      data
    }
  }
}

// {
//   // Multiple possible status enum values
//   status: 'idle' | 'loading' | 'succeeded' | 'failed',
//     error: string | null
// }

const initialState = {
  protocols: [],
  status: 'idle',
  error: null
}

export const fetchInstalledProtocols = createAsyncThunk('protocols/fetchProtocols', async () => {
  const response = await client.get('/fakeApi/protocols')
  console.log('response', response);
  return response.data
});

export const addProtocol = createAsyncThunk(
  'protocols/addNewProtocol',
  // The payload creator receives the partial `{title, content, user}` object
  async initialPost => {
    // We send the initial data to the fake API server
    const response = await client.post('/fakeApi/protocols', initialPost)
    // The response includes the complete post object, including unique ID
    return response.data
  }
)

const installedProtocolsSlice = createSlice({
  name: 'installedProtocols',
  initialState,
  reducers: {
    protocolUpdated(state, action) {
      const { id, title, content } = action.payload
      const existingProtocol = state.protocols.find(protocol => protocol.id === id)
      if (existingProtocol) {
        existingProtocol.title = title
        existingProtocol.content = content
      }
    },
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload
      const existingPost = state.protocols.find(post => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++;
      }
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchInstalledProtocols.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchInstalledProtocols.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Add any fetched posts to the array
        state.protocols = state.protocols.concat(action.payload)
      })
      .addCase(fetchInstalledProtocols.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(addProtocol.fulfilled, (state, action) => {
        // We can directly add the new post object to our posts array
        state.protocols.push(action.payload)
      })
  }
});

export const { protocolUpdated, reactionAdded } = installedProtocolsSlice.actions

export default installedProtocolsSlice.reducer

export const selectAllProtocols = state => state.installedProtocols.protocols;

export const selectProtocolById = (state, protocolId) =>
  state.installedProtocols.find(protocol => protocol.id === protocolId)