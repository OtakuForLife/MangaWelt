import { useEffect } from 'react';
import { PageLayout } from '../components/common/Layout/PageLayout';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { useHistory } from 'react-router';
import { log, LogLevel } from '../utils/logger';
import Loading from '../components/Loading';
import ProductCardView from '../components/ProductCardView';
import { IonText } from '@ionic/react';
import { selectProductsStatus, fetchProducts, selectIsProductOwned } from '../redux/slices/productSlice';
import { useLoadUserData } from '../hooks/useLoadUserData';

function ToBuyPage() {
    const dispatch = useAppDispatch();
    const status = useAppSelector(selectProductsStatus);
    
    // Load user data when authenticated
    const { isAuthenticated } = useLoadUserData();

    const history = useHistory();
    const toBuyProducts = useAppSelector((state) => {
        const allProducts = state.products.products;
        return Object.values(allProducts).filter(product => !selectIsProductOwned(state, product.isbn));
    });

    useEffect(() => {
        if (!isAuthenticated) {
            history.push('/login');
            return;
        }

        if (status === 'idle') {
            dispatch(fetchProducts())
                .unwrap()
                .then(() => {
                    log('Successfully fetched products', LogLevel.INFO, 'ToBuyPage');
                })
                .catch(() => {
                    log('Failed to fetch products', LogLevel.ERROR, 'ToBuyPage');
                });
        }
    }, [isAuthenticated, history, dispatch, status]);

    if (!isAuthenticated) {
        return null;
    }

    if (status === 'loading') {
        return (
            <PageLayout title="To Buy">
                <Loading />
            </PageLayout>
        );
    }

    return (
        <PageLayout title="To Buy">
            {toBuyProducts.length > 0 ? (
                <ProductCardView products={toBuyProducts} />
            ) : (
                <div className="ion-padding ion-text-center">
                    <IonText color="medium">
                        <h2>No products to buy</h2>
                        <p>All products are marked as owned!</p>
                    </IonText>
                </div>
            )}
        </PageLayout>
    );
}

export default ToBuyPage;