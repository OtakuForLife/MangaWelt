import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useEffect } from 'react';
import { PageLayout } from '../components/common/Layout/PageLayout';
import ProductCard from '../components/ProductCard';
import Product from '../models/Product';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectProducts, selectProductsStatus, fetchProducts } from '../redux/slices/productSlice';
import { selectDeviceToken } from '../redux/slices/deviceSlice';
import { log, LogLevel } from '../utils/logger';

function TestPage() {
  const dispatch = useAppDispatch();
  const productMap = useAppSelector(selectProducts);
  const productsStatus = useAppSelector(selectProductsStatus);
  const notificationToken = useAppSelector(selectDeviceToken);

  useEffect(() => {
    if (productsStatus === 'idle') {
      dispatch(fetchProducts());
    }
  }, [productsStatus, dispatch]);

  log("NotificationToken: "+notificationToken, LogLevel.INFO, 'TestPage');

  var products: Product[] = Object.keys(productMap).map(function(key){
      return productMap[key];
  });

  return (
    <PageLayout title="Menu">
      <IonGrid>
        <IonRow>
          <IonCol>
            <div style={{ padding: '10px', wordBreak: 'break-all' }}>
              <p>
                <strong>Push Notification Status:</strong><br />
                {notificationToken === 'Failed to register token!' ? (
                  <span style={{ color: 'red' }}>Registration failed. Please check browser console for details.</span>
                ) : notificationToken === 'Push notifications not available in browser' ? (
                  <span style={{ color: 'orange' }}>Push notifications are not available in browser environment</span>
                ) : notificationToken?.startsWith('Push notification initialization failed') || notificationToken?.startsWith('Registration error:') ? (
                  <span style={{ color: 'red' }}>Push notification initialization failed</span>
                ) : notificationToken ? (
                  <span style={{ color: 'green' }}>Successfully registered</span>
                ) : (
                  <span style={{ color: 'gray' }}>Waiting for registration...</span>
                )}
              </p>
              <p>
                <strong>Token:</strong><br />
                {notificationToken || 'No notification token found'}
              </p>
            </div>
          </IonCol>
        </IonRow>
        <IonRow className='ion-justify-content-center'>
          {productsStatus === 'loading' ? (
            <IonCol>Loading products...</IonCol>
          ) : productsStatus === 'failed' ? (
            <IonCol>Error loading products</IonCol>
          ) : products.length === 0 ? (
            <IonCol>No products available</IonCol>
          ) : (
            products.map((item, index) => (
              <IonCol size='auto' className='ion-padding' key={index}>
                <ProductCard product={item}/>
              </IonCol>
            ))
          )}
        </IonRow>
      </IonGrid>
    </PageLayout>
  );
}
export default TestPage;
