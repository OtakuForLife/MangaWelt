import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import Product from '../../models/Product';
import api from '../../utils/api';

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
    }
});

export const selectProducts = (state: RootState) => state.products.products;
export const selectProductsStatus = (state: RootState) => state.products.status;
export const selectProductsError = (state: RootState) => state.products.error;
export const selectIsProductOwned = (state: RootState, productId: string) => {
    return state.user.data?.owned_products.includes(productId) ?? false;
};
export const selectOwnedProducts = (state: RootState) => {
    const ownedIds = state.user.data?.owned_products ?? [];
    return Object.values(state.products.products)
        .filter(product => ownedIds.includes(product.isbn));
};

export default productSlice.reducer;
