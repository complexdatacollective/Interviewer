// Import the RTK Query methods from the React-specific entry point
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface Protocol {
  id: string;
  name: string;
}

// baseQuery implementation using electron IPC?
export const ipcBaseQuery = () => async (args: any) => {
  const { url, method, body } = args;
  const response = await window.api.protocols({
    url,
    method,
    body,
  });
  return response;
};

// Switch between different baseQuery implementations depending on environment 
const getBaseQuery = () => {
  if (process.env.REACT_APP_PLATFORM === 'electron') {
    return ipcBaseQuery();
  }

  if (process.env.NODE_ENV === 'development') {
    return fetchBaseQuery({ baseUrl: 'http://localhost:4001/api' });
  }

  return fetchBaseQuery({ baseUrl: 'http://localhost:4001/api' });
};

// Define our single API slice object
export const apiSlice = createApi({
  // The cache reducer expects to be added at `state.api` (already default - this is optional)
  reducerPath: 'api',
  baseQuery: getBaseQuery(),
  tagTypes: ['Protocols'],
  // The "endpoints" represent operations and requests for this server
  endpoints: builder => ({
    // The `getPosts` endpoint is a "query" operation that returns data
    getProtocols: builder.query<Protocol[], void>({
      // The URL for the request is '/api/posts'
      query: () => '/protocols',
      providesTags: ['Protocols']
    }),
    addProtocol: builder.mutation({
      query: initialProtocol => ({
        url: '/protocols',
        method: 'POST',
        // Include the entire post object as the body of the request
        body: initialProtocol
      }),
      invalidatesTags: ['Protocols']
    })
  })
})

// Export the auto-generated hook for the `getPosts` query endpoint
export const { useGetProtocolsQuery, useAddProtocolMutation } = apiSlice