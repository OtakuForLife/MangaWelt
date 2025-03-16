import { 
  IonButtons, 
  IonContent, 
  IonHeader, 
  IonLabel, 
  IonMenuButton, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonImg, 
  IonText,
  IonButton,
  IonIcon 
} from '@ionic/react';
import { useParams, useHistory } from 'react-router';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { 
  selectProducts, 
  selectProductsStatus, 
  fetchProducts,
} from '../redux/slices/productSlice';
import { selectIsAuthenticated } from '../redux/slices/authSlice';
import { useEffect } from 'react';
import { log, LogLevel } from '../utils/logger';
import Product from '../models/Product';
import { libraryOutline, checkmarkCircle, checkmarkCircleOutline } from 'ionicons/icons';
import { selectIsProductOwned } from '../redux/slices/productSlice';
import { toggleProductOwned } from '../redux/slices/userSlice';
import { useLoadUserData } from '../hooks/useLoadUserData';

function ProductDetailPage() {
  const { isbn } = useParams<{ isbn: string }>();
  const dispatch = useAppDispatch();
  const history = useHistory();
  
  // Load user data when authenticated
  useLoadUserData();

  const productMap = useAppSelector(selectProducts);
  const status = useAppSelector(selectProductsStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isOwned = useAppSelector(state => selectIsProductOwned(state, isbn));
  const product: Product = productMap[isbn];

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  const handleOwnedClick = async () => {
    if (!isAuthenticated) {
      history.push('/login');
      return;
    }

    try {
      await dispatch(toggleProductOwned(isbn)).unwrap();
      // Refresh products to get updated ownership status
      dispatch(fetchProducts());
    } catch (error) {
      log('Failed to toggle product owned status', LogLevel.ERROR, 'ProductDetailPage');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{product?.title || 'Product Details'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {status === 'loading' ? (
          <IonText color="medium" className="ion-text-center">
            <p>Loading...</p>
          </IonText>
        ) : !product && Object.keys(productMap).length > 0 ? (
          <IonText color="medium" className="ion-text-center">
            <p>Product not found</p>
          </IonText>
        ) : product ? (
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol size="12" sizeMd="8" sizeLg="6">
                <IonImg src={product.image} className="h-64 object-contain ion-padding-bottom" />
                <div className="ion-text-center ion-padding-bottom">
                  <IonButton 
                    expand="block"
                    onClick={handleOwnedClick}
                    color={isOwned ? 'success' : 'medium'}
                    className="ion-margin-horizontal ion-margin-bottom"
                  >
                    <IonIcon slot="start" icon={isOwned ? checkmarkCircle : checkmarkCircleOutline} />
                    {isOwned ? 'Owned' : 'Mark as Owned'}
                  </IonButton>
                  <IonButton 
                    expand="block"
                    href={product.link_to_provider}
                    target="_blank"
                    color="primary"
                    className="ion-margin-horizontal ion-margin-bottom"
                  >
                    Buy Now
                  </IonButton>
                  {product.franchise && (
                    <IonButton
                      expand="block"
                      routerLink={`/app/franchise/${product.franchise}`}
                      color="secondary"
                      className="ion-margin-horizontal"
                    >
                      <IonIcon slot="start" icon={libraryOutline} />
                      View Franchise
                    </IonButton>
                  )}
                </div>
                <IonLabel className="ion-padding-bottom">
                  <h1>{product.title}</h1>
                </IonLabel>
                <IonLabel className="ion-padding-bottom">
                  <p>Release Date: {product.release_date}</p>
                </IonLabel>
                <IonLabel className="ion-text-wrap">
                  <p>{product.description}</p>
                </IonLabel>
              </IonCol>
            </IonRow>
          </IonGrid>
        ) : (
          <IonText color="medium" className="ion-text-center">
            <p>Loading products...</p>
          </IonText>
        )}
      </IonContent>
    </IonPage>
  );
}

export default ProductDetailPage;
