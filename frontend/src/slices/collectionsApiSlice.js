import { COLLECTIONS_URL } from '../constants';
import { apiSlice } from './apiSlice';

export const collectionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCollections: builder.query({
      query: () => ({
        url: COLLECTIONS_URL,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Collections'],
    }),
    getCollectionDetails: builder.query({
      query: (collectionId) => ({
        url: `${COLLECTIONS_URL}/${collectionId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    getSubCollections: builder.query({
      query: (parentId) => ({
        url: `${COLLECTIONS_URL}/${parentId}/subcollections`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Collections'],
    }),
    createCollection: builder.mutation({
      query: (data) => ({
        url: COLLECTIONS_URL,
        method: 'POST',
        body: data, // Added support for passing parentCollectionId
      }),
      invalidatesTags: ['Collections'],
    }),
    updateCollection: builder.mutation({
      query: (data) => ({
        url: `${COLLECTIONS_URL}/${data.collectionId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Collections'],
    }),
    deleteCollection: builder.mutation({
      query: (collectionId) => ({
        url: `${COLLECTIONS_URL}/${collectionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Collections'],
    }),
    uploadCollectionImage: builder.mutation({
      query: (data) => ({
        url: '/api/upload',
        method: 'POST',
        body: data,
      }),
    }),
    addProductToCollection: builder.mutation({
      query: ({ collectionId, productId, displayOrder }) => ({
        url: `${COLLECTIONS_URL}/${collectionId}/products`,
        method: 'POST',
        body: { productId, displayOrder },
      }),
      invalidatesTags: ['Collections'],
    }),
    removeProductFromCollection: builder.mutation({
      query: ({ collectionId, productId }) => ({
        url: `${COLLECTIONS_URL}/${collectionId}/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Collections'],
    }),
    updateProductsOrder: builder.mutation({
      query: ({ collectionId, productOrders }) => ({
        url: `${COLLECTIONS_URL}/${collectionId}/products/reorder`,
        method: 'PUT',
        body: { productOrders },
      }),
      invalidatesTags: ['Collections'],
    }),
  }),
});

export const {
  useGetCollectionsQuery,
  useGetCollectionDetailsQuery,
  useGetSubCollectionsQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useUploadCollectionImageMutation,
  useAddProductToCollectionMutation,
  useRemoveProductFromCollectionMutation,
  useUpdateProductsOrderMutation,
} = collectionsApiSlice;
