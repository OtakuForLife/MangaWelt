import { PageLayout } from '../components/common/Layout/PageLayout';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectProducts, selectProductsStatus, selectProductsError, fetchProducts } from '../redux/slices/productSlice';
import ProductCardView from '../components/ProductCardView';
import { useLoadUserData } from '../hooks/useLoadUserData';

function ProductPage() {
  const dispatch = useAppDispatch();
  const productMap = useAppSelector(selectProducts);
  const status = useAppSelector(selectProductsStatus);
  const error = useAppSelector(selectProductsError);

  // Load user data when authenticated
  useLoadUserData();

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  const products = Object.values(productMap);
  return (
    <PageLayout title="Menu">
      <ProductCardView products={products} />
    </PageLayout>
  );
}
export default ProductPage;
