import { useEffect } from 'react';
import { IonImg, IonText, IonButton, IonIcon } from '@ionic/react';
import { useParams, useHistory } from 'react-router';
import { PageLayout } from '../components/common/Layout/PageLayout';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectFranchises, selectFranchisesStatus, fetchFranchises } from '../redux/slices/franchiseSlice';
import { selectIsAuthenticated } from '../redux/slices/authSlice';
import { selectProducts, selectProductsStatus, fetchProducts } from '../redux/slices/productSlice';
import ProductCardView from '../components/ProductCardView';
import Loading from '../components/Loading';
import { log, LogLevel } from '../utils/logger';
import { bookmarkOutline, bookmark } from 'ionicons/icons';
import { useState } from 'react';
import { toggleFranchiseFollow, selectFollowedFranchiseIds } from '../redux/slices/userSlice';
import { useLoadUserData } from '../hooks/useLoadUserData';

function FranchiseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const history = useHistory();
    
    // Load user data when authenticated
    useLoadUserData();

    const franchiseMap = useAppSelector(selectFranchises);
    const productMap = useAppSelector(selectProducts);
    const franchiseStatus = useAppSelector(selectFranchisesStatus);
    const productStatus = useAppSelector(selectProductsStatus);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isFollowing = useAppSelector(selectFollowedFranchiseIds).includes(id);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (franchiseStatus === 'idle') {
            dispatch(fetchFranchises());
        }
        if (productStatus === 'idle') {
            dispatch(fetchProducts());
        }
    }, [dispatch, franchiseStatus, productStatus]);

    const handleFollowClick = async () => {
        if (!isAuthenticated) {
            history.push('/login');
            return;
        }

        try {
            setIsLoading(true);
            await dispatch(toggleFranchiseFollow(id)).unwrap();
            // Refresh franchises to get updated following status
            dispatch(fetchFranchises());
        } catch (error) {
            log('Failed to toggle franchise follow status', LogLevel.ERROR, 'FranchiseDetailPage');
        } finally {
            setIsLoading(false);
        }
    };

    if (franchiseStatus === 'loading' || productStatus === 'loading') {
        return <Loading />;
    }
    
    const franchise = franchiseMap[id];
    log(`Franchise found: ${franchise ? 'yes' : 'no'}`, LogLevel.DEBUG, 'FranchiseDetailPage');
    log(`Franchise products: ${franchise?.products?.join(', ') || 'none'}`, LogLevel.DEBUG, 'FranchiseDetailPage');

    const franchiseProducts = franchise && franchise.products 
        ? franchise.products
            .filter((isbn: string) => {
                const exists = isbn && productMap[isbn];
                log(`Checking ISBN ${isbn}: ${exists ? 'found' : 'not found'}`, LogLevel.DEBUG, 'FranchiseDetailPage');
                return exists;
            })
            .map((isbn: string) => productMap[isbn])
        : [];
    
    log(`Final franchise products count: ${franchiseProducts.length}`, LogLevel.DEBUG, 'FranchiseDetailPage');

    return (
        <PageLayout title={franchise?.title || 'Franchise Details'}>
            {franchise ? (
                <>
                    <IonImg src={franchise.image} className="h-64 object-contain ion-padding-bottom" />
                    <div className="ion-padding-horizontal">
                        <div className="flex justify-between items-center">
                            <h2>{franchise.title}</h2>
                            <IonButton
                                onClick={handleFollowClick}
                                disabled={isLoading}
                                color={isFollowing ? 'primary' : 'medium'}
                            >
                                <IonIcon slot="start" icon={isFollowing ? bookmark : bookmarkOutline} />
                                {isFollowing ? 'Bookmarked' : 'Bookmark'}
                            </IonButton>
                        </div>
                        <p>{franchise.description}</p>
                    </div>
                    <h3 className="ion-padding">Products in this Franchise</h3>
                    <ProductCardView products={franchiseProducts} />
                </>
            ) : (
                <IonText color="medium" className="ion-text-center">
                    <p>Franchise not found (ID: {id})</p>
                    <p>Available IDs: {Object.keys(franchiseMap).join(', ')}</p>
                </IonText>
            )}
        </PageLayout>
    );
}

export default FranchiseDetailPage;
