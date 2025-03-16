import {
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle} from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router';
import api from '../utils/api';
import { useStorage } from '../hooks/useStorage';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../utils/constants';
import { useAppDispatch } from '../redux/hooks';
import { setAuthenticated } from '../redux/slices/authSlice';
import { PageLayout } from '../components/common/Layout/PageLayout';
import { initPushNotifications } from '../utils/pushNotifications';
import { log } from '../utils/logger';

interface LoginFormData {
    username: string;
    password: string;
}

interface LoginResponse {
    access: string;
    refresh: string;
}

export const handleLoginSubmit = async (
    formData: LoginFormData,
    api: { post: (url: string, data: any) => Promise<any> },
    storage: { set: (key: string, value: string) => Promise<void> },
    dispatch: (action: any) => void,
    navigate: (path: string) => void
): Promise<{ error?: string }> => {
    const { username, password } = formData;
    
    if (!username.trim() || !password.trim()) {
        return { error: 'Username and password are required' };
    }

    try {
        const response = await api.post("/api/token/", {
            username: username.trim(),
            password: password.trim()
        });
        
        if (response.status === 200 && response.data) {
            const { access, refresh } = response.data as LoginResponse;
            await storage.set(ACCESS_TOKEN, access);
            await storage.set(REFRESH_TOKEN, refresh);
            dispatch(setAuthenticated(true));
            
            // Wait for push notification registration
            try {
                await initPushNotifications();
            } catch (error) {
                await log(`Push notification registration failed during login: ${error}`, 'ERROR', 'Auth');
                // Continue with navigation even if push registration fails
            }
            
            navigate('/app/releases');
            return {};
        }
        return { error: 'Invalid response from server' };
    } catch (error: any) {
        if (error.response?.data) {
            const errorData = error.response.data;
            if (typeof errorData === 'object') {
                return { error: Object.values(errorData).flat().join(' ') };
            }
            return { error: errorData.toString() };
        }
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'Login failed. Please try again.' };
    }
};

function LoginPage() {
    const dispatch = useAppDispatch();
    const storage = useStorage();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        const result = await handleLoginSubmit(
            { username, password },
            api,
            storage,
            dispatch,
            history.push
        );
        
        if (result.error) {
            setError(result.error);
        }
        
        setLoading(false);
    };

    return (
        <PageLayout title="Login" showMenu={true} showLoginButton={false}>
            <IonContent className="ion-padding">
                <IonGrid>
                    <IonRow className="ion-justify-content-center">
                        <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
                            <IonCard>
                                <IonCardHeader>
                                    <IonCardTitle className="ion-text-center">Login</IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={handleLogin} data-testid="login-form">
                                        <IonItem>
                                            <IonLabel position="floating">Username</IonLabel>
                                            <IonInput
                                                type="text"
                                                value={username}
                                                onIonInput={e => setUsername(e.detail.value ?? '')}
                                                required
                                                data-testid="username-input"
                                            />
                                        </IonItem>

                                        <IonItem>
                                            <IonLabel position="floating">Password</IonLabel>
                                            <IonInput
                                                type="password"
                                                value={password}
                                                onIonInput={e => setPassword(e.detail.value ?? '')}
                                                required
                                                data-testid="password-input"
                                            />
                                        </IonItem>

                                        {error && (
                                            <IonText color="danger" className="ion-padding-top" data-testid="error-message">
                                                <p className="ion-text-center">{error}</p>
                                            </IonText>
                                        )}

                                        <div className="ion-padding-top">
                                            <IonButton 
                                                expand="block" 
                                                type="submit"
                                                disabled={loading}
                                                data-testid="login-button"
                                            >
                                                {loading ? 'Logging in...' : 'Login'}
                                            </IonButton>
                                        </div>

                                        <div className="ion-text-center ion-padding-top">
                                            <IonButton fill="clear" routerLink="/register" data-testid="register-link">
                                                Don't have an account? Register
                                            </IonButton>
                                        </div>
                                    </form>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </PageLayout>
    );
}

export default LoginPage;
