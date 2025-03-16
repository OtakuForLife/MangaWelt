import { IonButton, IonIcon, IonLabel } from '@ionic/react';
import { logInOutline } from 'ionicons/icons';
import { useAppSelector } from '../redux/hooks';
import { selectIsAuthenticated } from '../redux/slices/authSlice';

function LoginButton() {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    if (isAuthenticated) {
        return null;
    }

    return (
        <IonButton 
            slot="end" 
            fill="clear" 
            routerLink="/login"
        >
            <IonIcon slot="start" icon={logInOutline} />
            <IonLabel>Login</IonLabel>
        </IonButton>
    );
}

export default LoginButton;
