import { BaseQueryFn, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Protocol } from '@codaco/shared-consts/src/protocol';

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
    return fetchBaseQuery({ baseUrl: 'http://localhost:3001/api' });
  }

  // What should this be in production?
  return fetchBaseQuery({ baseUrl: 'http://localhost:3001/api' });
};

// Define our single API slice object
export const apiSlice = createApi({
  // The cache reducer expects to be added at `state.api` (already default - this is optional)
  reducerPath: 'api',
  baseQuery: getBaseQuery(),
  // prepareHeaders: (headers, { getState }) => {
  //   const token = (getState() as RootState).auth.token

  //   // If we have a token set in state, let's assume that we should be passing it.
  //   if (token) {
  //     headers.set('authorization', `Bearer ${token}`)
  //   }

  //   return headers
  // },
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
    addProtocol: builder.mutation<Protocol, File>({
      query: (data: File) => {
        // Add the file(s) to a FormData object, allowing us to preserve the filename
        const formData = new FormData();
        formData.append('protocolFile', data, data.name);

        return {
          url: '/protocols',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Protocols'] // Makes any consumers refectch protocol list
    })
  })
})

// Export the auto-generated hook for the `getPosts` query endpoint
export const { useGetProtocolsQuery, useAddProtocolMutation } = apiSlice