// Import the RTK Query methods from the React-specific entry point
import { BaseQueryFn, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface Protocol {
  id: string;
  name: string;
}

// baseQuery implementation using electron IPC?
export const ipcBaseQuery = (): BaseQueryFn => async (args, api, extraOptions) => {
  console.log(args, api, extraOptions);
  const response = await window.api.query(args);
  return response;
};


// Switch between different baseQuery implementations depending on environment 
const getBaseQuery = () => {
  if (import.meta.env.VITE_APP_PLATFORM === 'electron') {
    return ipcBaseQuery();
  }

  if (import.meta.env.DEV) {
    return fetchBaseQuery({ baseUrl: 'http://localhost:4001/api' });
  }

  // What should this be in production?
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
    getProtocols: builder.query<Protocol[], void>({
      query: () => ({
        url: '/protocols',
        method: 'GET'
      }),
      providesTags: ['Protocols']
    }),
    addProtocol: builder.mutation({
      query: initialProtocol => ({
        url: '/protocols',
        method: 'POST',
        // Include the entire protocol object as the body of the request
        body: initialProtocol
      }),
      invalidatesTags: ['Protocols']
    })
  })
})

// Export the auto-generated hook for the `getPosts` query endpoint
export const { useGetProtocolsQuery, useAddProtocolMutation } = apiSlice