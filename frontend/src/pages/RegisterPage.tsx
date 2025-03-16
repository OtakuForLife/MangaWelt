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
import { PageLayout } from '../components/common/Layout/PageLayout';

function RegisterPage() {
    const storage = useStorage();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/api/user/register/", {username, password});
            if (res.status === 200) {
                const token = res.data.access;
                storage?.set(ACCESS_TOKEN, token);
                storage?.set(REFRESH_TOKEN, res.data.refresh);
                history.push('/app/followed');
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageLayout title="Register" showMenu={true} showLoginButton={false}>
            <IonContent className="ion-padding">
                <IonGrid>
                    <IonRow className="ion-justify-content-center">
                        <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
                            <IonCard>
                                <IonCardHeader>
                                    <IonCardTitle className="ion-text-center">Register</IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={handleRegister}>
                                        <IonItem>
                                            <IonLabel position="floating">Username</IonLabel>
                                            <IonInput
                                                type="text"
                                                value={username}
                                                onIonChange={e => setUsername(e.detail.value!)}
                                                required
                                            />
                                        </IonItem>

                                        <IonItem>
                                            <IonLabel position="floating">Password</IonLabel>
                                            <IonInput
                                                type="password"
                                                value={password}
                                                onIonChange={e => setPassword(e.detail.value!)}
                                                required
                                            />
                                        </IonItem>

                                        <IonItem>
                                            <IonLabel position="floating">Confirm Password</IonLabel>
                                            <IonInput
                                                type="password"
                                                value={confirmPassword}
                                                onIonChange={e => setConfirmPassword(e.detail.value!)}
                                                required
                                            />
                                        </IonItem>

                                        {error && (
                                            <IonText color="danger" className="ion-padding-top">
                                                <p className="ion-text-center">{error}</p>
                                            </IonText>
                                        )}

                                        <div className="ion-padding-top">
                                            <IonButton 
                                                expand="block" 
                                                type="submit"
                                                disabled={loading}
                                            >
                                                {loading ? 'Registering...' : 'Register'}
                                            </IonButton>
                                        </div>

                                        <div className="ion-text-center ion-padding-top">
                                            <IonButton fill="clear" routerLink="/login">
                                                Already have an account? Login
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

export default RegisterPage;
