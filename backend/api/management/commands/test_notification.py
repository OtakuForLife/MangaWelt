from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from firebase_admin import messaging, initialize_app, credentials, get_app
from django.utils import timezone
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Sends a test notification to test_user_0'

    def __init__(self):
        super().__init__()
        try:
            # Try to get existing app
            app = get_app()
        except ValueError:
            # Initialize Firebase Admin SDK if not already initialized
            cred_path = os.getenv('FIREBASE_ADMIN_SDK_PATH')
            if not cred_path:
                raise ValueError("FIREBASE_ADMIN_SDK_PATH environment variable is not set")
            
            if not os.path.exists(cred_path):
                raise ValueError(f"Firebase credentials file not found at: {cred_path}")
                
            cred = credentials.Certificate(cred_path)
            initialize_app(cred)

    def handle(self, *args, **options):
        try:
            # Get test_user_0
            user = User.objects.get(username='test_user_0')
            
            # Get their device tokens
            tokens = list(user.devicetoken_set.values_list('token', flat=True))
            
            if not tokens:
                self.stdout.write(
                    self.style.ERROR('No device tokens found for test_user_0')
                )
                return

            # Print tokens for debugging
            self.stdout.write(self.style.SUCCESS(f'Found {len(tokens)} device tokens'))
            for token in tokens:
                self.stdout.write(f'Token: {token}')

            # Send a message to a single token first as a test
            message = messaging.Message(
                notification=messaging.Notification(
                    title='Test Single Notification',
                    body='This is a test notification from the backend.',
                ),
                android=messaging.AndroidConfig(
                    priority='high',
                    notification=messaging.AndroidNotification(
                        #icon='notification_icon',
                        color='#4CAF50',
                        priority='high',
                        visibility='public',
                        channel_id='default',  # Make sure this matches your Android channel ID
                        default_sound=True,
                        default_vibrate_timings=True,
                    ),
                ),
                apns=messaging.APNSConfig(
                    headers={
                        'apns-priority': '10',
                    },
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            alert=messaging.ApsAlert(
                                title='Test Single Notification',
                                body='This is a test notification from the backend.',
                            ),
                            sound='default',
                            badge=1,
                            content_available=True,
                            mutable_content=True,
                            category='NEW_MESSAGE_CATEGORY'
                        ),
                    ),
                ),
                data={
                    'type': 'TEST',
                    'timestamp': str(timezone.now()),
                    'click_action': 'FLUTTER_NOTIFICATION_CLICK',  # For handling notification clicks
                },
                token=tokens[0]
            )

            # Send the message
            try:
                response = messaging.send(message)
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully sent message: {response}')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error sending single message: {str(e)}')
                )
                return

            # If single message succeeds, try multicast
            multicast_message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title='Test Multicast Notification',
                    body='This is a test notification from the backend.',
                ),
                android=messaging.AndroidConfig(
                    priority='high',
                    notification=messaging.AndroidNotification(
                        icon='notification_icon',
                        color='#4CAF50',
                        priority='high',
                        visibility='public',
                        channel_id='default',
                        default_sound=True,
                        default_vibrate_timings=True,
                    ),
                ),
                apns=messaging.APNSConfig(
                    headers={
                        'apns-priority': '10',
                    },
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            alert=messaging.ApsAlert(
                                title='Test Multicast Notification',
                                body='This is a test notification from the backend.',
                            ),
                            sound='default',
                            badge=1,
                            content_available=True,
                            mutable_content=True,
                            category='NEW_MESSAGE_CATEGORY'
                        ),
                    ),
                ),
                data={
                    'type': 'TEST',
                    'timestamp': str(timezone.now()),
                    'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                },
                tokens=tokens
            )

            # Send the multicast message
            response = messaging.send_multicast(multicast_message)
            
            # Report results
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully sent message to {response.success_count} devices'
                )
            )
            
            if response.failure_count > 0:
                self.stdout.write(
                    self.style.WARNING(
                        f'Failed to send message to {response.failure_count} devices'
                    )
                )
                
                # Print detailed failure information
                for idx, resp in enumerate(response.responses):
                    if not resp.success:
                        self.stdout.write(
                            self.style.ERROR(
                                f'Failed to send to token {tokens[idx]}: {resp.exception}'
                            )
                        )

        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR('test_user_0 not found. Please run init_dummy_data first.')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error sending notification: {str(e)}')
            )
