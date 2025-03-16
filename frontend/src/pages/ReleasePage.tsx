import { useEffect, useMemo, useState } from 'react';
import { 
  IonItemDivider, 
  IonItemGroup, 
  IonLabel, 
  IonList,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail
} from '@ionic/react';
import { PageLayout } from '../components/common/Layout/PageLayout';
import ProductCardView from '../components/ProductCardView';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import Product from '../models/Product';
import { selectProducts, selectProductsStatus, fetchProducts } from '../redux/slices/productSlice';
import Loading from '../components/Loading';
import { parseDate } from '../utils/dateUtils';
import { fetchUserData, selectOwnedProductIds } from '../redux/slices/userSlice';
import { useLoadUserData } from '../hooks/useLoadUserData';

interface GroupedProducts {
  [key: string]: Product[];
}

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';

function ReleasePage() {
  const dispatch = useAppDispatch();
  const productMap = useAppSelector(selectProducts);
  const status = useAppSelector(selectProductsStatus);
  const ownedProductIds = useAppSelector(selectOwnedProductIds);
  
  // Load user data when authenticated
  const { isAuthenticated } = useLoadUserData();
  
  // Filter and sort states
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [owned, setOwned] = useState<string>('all');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  const groupedProducts = useMemo(() => {
    let products: Product[] = Object.values(productMap).filter(product => product.release_date);

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      products = products.filter(product => 
        product.title.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply owned filter
    if (owned !== 'all') {
      products = products.filter(product => 
        owned === 'owned' ? 
          ownedProductIds.includes(product.isbn) :
          !ownedProductIds.includes(product.isbn)
      );
    }

    // Apply sorting
    products.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return parseDate(b.release_date).getTime() - parseDate(a.release_date).getTime();
        case 'date-asc':
          return parseDate(a.release_date).getTime() - parseDate(b.release_date).getTime();
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    // Group by month
    const grouped = products.reduce((groups: GroupedProducts, product) => {
      const date = parseDate(product.release_date);
      const monthYear = date.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(product);
      return groups;
    }, {});

    return grouped;
  }, [productMap, searchText, sortBy, owned, ownedProductIds]);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      dispatch(fetchProducts());
      if(isAuthenticated){
        dispatch(fetchUserData());
      }
      // log('Products refreshed successfully', LogLevel.INFO, 'ReleasePage');
    } catch (error) {
      // log('Failed to refresh products', LogLevel.ERROR, 'ReleasePage');
    } finally {
      event.detail.complete();
    }
  };

  if (status === 'loading') {
    return (
      <PageLayout title="Releases">
        <Loading />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Releases">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent />
      </IonRefresher>

      <IonCard>
        <IonCardContent>
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <IonSearchbar
                  value={searchText}
                  onIonInput={e => setSearchText(e.detail.value!)}
                  placeholder="Search products..."
                />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="12" sizeMd="4">
                <IonSelect
                  label="Sort by"
                  value={sortBy}
                  onIonChange={e => setSortBy(e.detail.value)}
                >
                  <IonSelectOption value="date-desc">Newest First</IonSelectOption>
                  <IonSelectOption value="date-asc">Oldest First</IonSelectOption>
                  <IonSelectOption value="name-asc">Name (A-Z)</IonSelectOption>
                  <IonSelectOption value="name-desc">Name (Z-A)</IonSelectOption>
                </IonSelect>
              </IonCol>
              <IonCol size="12" sizeMd="4">
                <IonSegment value={owned} onIonChange={e => setOwned(e.detail.value as string)}>
                  <IonSegmentButton value="all">
                    <IonLabel>All</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="owned">
                    <IonLabel>Owned</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="not-owned">
                    <IonLabel>Not Owned</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>

      <IonList>
        {Object.entries(groupedProducts).map(([monthYear, products]) => (
          <IonItemGroup key={monthYear}>
            <IonItemDivider className='ion-padding-start'>
              <IonLabel>{monthYear}</IonLabel>
            </IonItemDivider>
            <ProductCardView products={products} />
          </IonItemGroup>
        ))}
      </IonList>
    </PageLayout>
  );
}
export default ReleasePage;
