import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import Product from '../../models/Product';
import api from '../../lib/api';

interface ProductState {
    products: { [id: string]: Product };
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ProductState = {
    products: {},
    status: 'idle',
    error: null,
};

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async () => {
        const response = await api.get('/api/products/list/');
        const { data } = response;
        // Convert array to object with ISBN as key
        return data.reduce((acc: { [key: string]: Product }, product: Product) => {
            acc[product.isbn] = product;
            return acc;
        }, {});
    }
);

export const toggleProductOwned = createAsyncThunk(
    'products/toggleProductOwned',
    async (productId: string, { dispatch }) => {
        const response = await api.post(`/api/products/${productId}/toggle-owned/`);
        // Refresh products to get updated is_owned field
        await dispatch(fetchProducts());
        return response.data;
    }
);


const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.products = action.payload;
                state.error = null;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message ?? 'Unknown error occurred';
            })
            .addCase(toggleProductOwned.pending, (state) => {
                // Keep current status, just updating in background
            })
            .addCase(toggleProductOwned.fulfilled, (state) => {
                state.error = null;
            })
            .addCase(toggleProductOwned.rejected, (state, action) => {
                state.error = action.error.message ?? 'Failed to toggle product ownership';
            })
    }
});

// Base selectors
export const selectProducts = (state: RootState) => state.products.products;
export const selectProductsStatus = (state: RootState) => state.products.status;
export const selectProductsError = (state: RootState) => state.products.error;

// Selector for checking if a specific product is owned (from product data itself)
export const selectIsProductOwned = (state: RootState, productId: string) => {
    return state.products.products[productId]?.is_owned ?? false;
};

// Memoized selector to get all owned products
export const selectOwnedProducts = createSelector(
    [selectProducts],
    (products) => {
        return Object.values(products).filter(product => product.is_owned);
    }
);

// Memoized selector to get all products that are NOT owned (for "To Buy" page)
export const selectProductsToBuy = createSelector(
    [selectProducts],
    (products) => {
        return Object.values(products).filter(product => !product.is_owned);
    }
);

// Selector to get owned product IDs
export const selectOwnedProductIds = createSelector(
    [selectProducts],
    (products) => {
        return Object.values(products)
            .filter(product => product.is_owned)
            .map(product => product.isbn);
    }
);

export default productSlice.reducer;

