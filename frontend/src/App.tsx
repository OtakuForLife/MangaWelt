
import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  setupIonicReact
} from '@ionic/react';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';


/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router';
import TestPage from './pages/TestPage';
import ProductPage from './pages/ProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import Menu from './components/Menu';
import FranchisePage from './pages/FranchisePage';
import FranchiseDetailPage from './pages/FranchiseDetailPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ReleasePage from './pages/ReleasePage';
import ToBuyPage from './pages/ToBuyPage';
import { useEffect, useState } from 'react';
import { IonContent } from '@ionic/react';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { initPushNotifications } from './utils/pushNotifications';
import { selectIsAuthenticated, checkAuthStatus } from './redux/slices/authSlice';
//import { log, LogLevel } from './utils/logger';
import Loading from './components/Loading';
import { initializePlatform } from './redux/slices/deviceSlice';
import BookmarkPage from './pages/BookmarkPage';

setupIonicReact();

function App() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    dispatch(initializePlatform());
  }, [dispatch]);

  useEffect(() => {
    const init = async () => {
      await dispatch(checkAuthStatus());
      setIsInitialized(true);
    };
    init();
  }, [dispatch]);

  // Initialize push notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initPushNotifications()
        .catch(error => {
          // await log(`Failed to initialize push notifications: ${error}`, LogLevel.ERROR, 'PushNotifications');
          console.error('Failed to initialize push notifications:', error);
        });
    }
  }, [isAuthenticated]);
  
  if (!isInitialized) {
    return (
      <IonApp>
        <IonContent className="ion-padding">
          <Loading/>
        </IonContent>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId='main'>
          <Menu />
          <IonRouterOutlet id='main'>
            <Route exact path="/app/test" component={TestPage} />
            <Route exact path="/app/settings" component={TestPage} />
            
            <Route exact path="/app/releases" component={ReleasePage} />
            <Route exact path="/app/followed" component={BookmarkPage} />
            <Route exact path="/app/to-buy" component={ToBuyPage} />
            <Route exact path="/app/product/:isbn" component={ProductDetailPage} />
            <Route exact path="/app/product" component={ProductPage} />
            <Route exact path="/app/franchises" component={FranchisePage} />
            <Route exact path="/app/franchise/:id" component={FranchiseDetailPage} />
            <Route exact path="/register" component={RegisterPage} />
            <Route exact path="/login" component={LoginPage} />
            <Redirect to="/app/releases" />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
