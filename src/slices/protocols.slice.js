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

const installedProtocolsSlice = createSlice({
  name: 'installedProtocols',
  initialState,
  reducers: {
    protocolAdded: {
      reducer(state, action) {
        state.protocols.push(action.payload)
      },
      prepare(name, content) {
        return {
          payload: {
            id: 'test-id',
            name,
            content
          }
        }
      }
    },
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
  }
});

export const { protocolAdded, protocolUpdated, reactionAdded } = installedProtocolsSlice.actions

export default installedProtocolsSlice.reducer

export const selectAllProtocols = state => state.installedProtocols.protocols;

export const selectProtocolById = (state, protocolId) =>
  state.installedProtocols.find(protocol => protocol.id === protocolId)