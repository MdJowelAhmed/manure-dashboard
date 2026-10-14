import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

/**
 * RTK Query Architecture Prepared for Future Backend Integration
 * In prototype phase, returns typed mock records without network requests.
 * Future phase can replace fakeBaseQuery with fetchBaseQuery({ baseUrl: '/api/v1' }).
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    'Products',
    'Suppliers',
    'Customers',
    'Imports',
    'Invoices',
    'Payments',
    'Expenses',
    'Accounts',
    'Journals',
  ],
  endpoints: (_builder) => ({
    // Prepared endpoint definitions for production phase
  }),
})
