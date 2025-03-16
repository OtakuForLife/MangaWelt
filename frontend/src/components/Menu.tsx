import { 
    IonContent, 
    IonHeader, 
    IonIcon, 
    IonItem, 
    IonLabel, 
    IonList, 
    IonMenu, 
    IonMenuToggle, 
    IonTitle, 
    IonToolbar} from '@ionic/react';
import { 
    bookmarksOutline, 
    pricetagsOutline, 
    libraryOutline,
    cartOutline 
} from 'ionicons/icons';
import { useAppSelector } from '../redux/hooks';
import { selectIsAuthenticated } from '../redux/slices/authSlice';

function Menu() {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    
    const paths = [
        //{name: "Test", url: "/app/test", icon: beakerOutline},
        ...(isAuthenticated ? [
            {name: "Bookmarks", url: "/app/followed", icon: bookmarksOutline},
            {name: "To Buy", url: "/app/to-buy", icon: cartOutline},
        ] : []),
        {name: "Franchises", url: "/app/franchises", icon: libraryOutline},
        {name: "Releases", url: "/app/releases", icon: pricetagsOutline},
        //{name: "Explore", url: "/app/explore", icon: compassOutline},
        //{name: "Settings", url: "/app/settings", icon: settingsOutline},
        
    ];
    return (
        <IonMenu contentId="main" className=''>
            <IonHeader>
                <IonToolbar>
                    <IonTitle className='ion-text-center'>Menu</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList lines='none'>
                {paths.map((item, index)=>(
                    <IonMenuToggle autoHide={false} key={index}>
                        <IonItem button routerLink={item.url} routerDirection='none'>
                            <IonIcon icon={item.icon} className="ion-margin-end"></IonIcon>
                            <IonLabel>{item.name}</IonLabel>
                        </IonItem>
                    </IonMenuToggle>
                ))}
                </IonList>
            </IonContent>
        </IonMenu>
    );
}
export default Menu;
