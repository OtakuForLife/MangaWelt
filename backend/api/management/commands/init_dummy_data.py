from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from api.models import Product, Franchise, DeviceToken, Publisher
import random
from datetime import timedelta

# Predefined data matching frontend
adminUsers = [{
    'username': 'admin',
    'email': 'admin@example.com',
    'password': 'admin123'
},]

users = [{
    'username': 'test_user_0',
    'email': 'test0@example.com',
    'password': 'testpass123',
    'tokens': ['ctOCwPqsTYmTinFNGukoR0:APA91bEsz_0lGZ96AVwBPxOnqGtTMLz9hi_oQDTtGlLYLPg33iLvIyAbTQy4CbRrRN33pUnSAOvVXUOfD--7TC47D9mGE1Y5oBKaYNQf8jGfrHCw4tpbRDA']
},]

franchises = [
    {
        'title': 'Gamers!',
        'description': 'A romantic comedy about gamers, misunderstandings, and relationships.',
        'image': 'https://altraverse.de/media/image/71/eb/bb/gamers-01-01-cover_400x400.jpg',
        'products': [
            {
                'isbn': '978-3-96358-096-3',
                'title': 'Gamers! Light Novel, Band 01',
                'description': 'Keita Amanos einziges Charaktermerkmal ist seine Liebe für Videospiele...',
                'image': 'https://altraverse.de/media/image/fb/f9/cb/gamers-light-novel-01_400x400.jpg',
                'release_date': '2021-05-28',
                'type': 'LIGHT_NOVEL',
                'volume': 1,
                'link_to_provider': 'https://altraverse.de'
            },
            {
                'isbn': '978-3-96358-093-2',
                'title': 'Gamers!, Band 01',
                'description': 'Keita Amano ist so durchschnittlich, dass es fast schon wehtut...',
                'image': 'https://altraverse.de/media/image/71/eb/bb/gamers-01-01-cover_400x400.jpg',
                'release_date': '2022-12-03',
                'type': 'MANGA',
                'volume': 1,
                'link_to_provider': 'https://altraverse.de'
            },
            {
                'isbn': '978-3-96358-102-1',
                'title': 'Gamers! Light Novel, Band 07',
                'description': 'Keita wollte auf seinem Heimweg eigentlich nur noch schnell raiden...',
                'image': 'https://altraverse.de/media/image/6d/62/fe/gamers-light-novel-07-cover_400x400.jpg',
                'release_date': '2025-02-17',
                'type': 'LIGHT_NOVEL',
                'volume': 7,
                'link_to_provider': 'https://altraverse.de'
            }
        ]
    },
    {
        'title': 'Meine unerwiderte Liebe',
        'description': 'A touching story about unrequited love and personal growth.',
        'image': 'https://altraverse.de/media/image/e9/cb/36/meine-unerwiderte-liebe-04-cover_400x400.jpg',
        'products': [
            {
                'isbn': '978-3-96358-432-9',
                'title': 'Meine unerwiderte Liebe, Band 04',
                'description': 'Uta hat versucht, sich ihrer heimlichen Liebe Kaoru zu offenbaren...',
                'image': 'https://altraverse.de/media/image/e9/cb/36/meine-unerwiderte-liebe-04-cover_400x400.jpg',
                'release_date': '2024-10-18',
                'type': 'MANGA',
                'volume': 4,
                'link_to_provider': 'https://altraverse.de'
            }
        ]
    }
]

publishers = [
    {
        'name': 'Altraverse',
        'website': 'https://altraverse.de',
        'image': 'https://altraverse.de/logo.png'
    }
]

User = get_user_model()

class Command(BaseCommand):
    help = 'Initializes the database with dummy data for testing'

    def create_dummy_users(self):
        created_users = []
        for userObj in users:
            # Check if user already exists
            if not User.objects.filter(username=userObj["username"]).exists():
                user = User.objects.create_user(
                    username=userObj["username"],
                    email=userObj["email"],
                    password=userObj["password"]
                )
                # Create device tokens for each user
                tokens = userObj.get("tokens", [])
                for token in tokens:
                    # Check if token already exists for this user
                    if not DeviceToken.objects.filter(user=user, token=token).exists():
                        DeviceToken.objects.create(
                            user=user,
                            token=token
                        )
                created_users.append(user)
                self.stdout.write(f'Created user: {userObj["username"]}')
            else:
                user = User.objects.get(username=userObj["username"])
                created_users.append(user)
                self.stdout.write(f'User already exists: {userObj["username"]}')
        return created_users

    def create_dummy_publishers(self):
        created_publishers = []
        for publisher_data in publishers:
            publisher, created = Publisher.objects.get_or_create(
                name=publisher_data["name"],
                defaults={
                    "website": publisher_data["website"],
                    "image": publisher_data["image"]
                }
            )
            
            if created:
                self.stdout.write(f'Created publisher: {publisher.name}')
            else:
                self.stdout.write(f'Publisher already exists: {publisher.name}')
            
            created_publishers.append(publisher)
        return created_publishers

    def create_dummy_franchises(self):
        created_franchises = []
        # Get the first publisher (Altraverse in this case)
        publisher = Publisher.objects.first()
        if not publisher:
            self.stdout.write('No publisher found. Please create publishers first.')
            return []

        for franchise_data in franchises:
            # Check if franchise already exists
            franchise, created = Franchise.objects.get_or_create(
                title=franchise_data["title"],
                defaults={
                    "description": franchise_data["description"],
                    "image": franchise_data["image"]
                }
            )
            
            if created:
                self.stdout.write(f'Created franchise: {franchise.title}')
            else:
                self.stdout.write(f'Franchise already exists: {franchise.title}')
            
            # Create products for this franchise
            for product_data in franchise_data["products"]:
                Product.objects.update_or_create(
                    isbn=product_data["isbn"],  # This is the lookup field
                    defaults={                  # These fields will be updated if the object exists
                        "title": product_data["title"],
                        "description": product_data["description"],
                        "image": product_data["image"],
                        "release_date": product_data["release_date"],
                        "type": product_data["type"],
                        #"volume": product_data["volume"],
                        "link_to_provider": product_data["link_to_provider"],
                        "franchise": franchise,
                        "publisher": publisher
                    }
                )
                self.stdout.write(f'Created product: {product_data["title"]}')
            
            created_franchises.append(franchise)
            self.stdout.write(f'Franchise {franchise.title} has {len(franchise_data["products"])} products')
        
        return created_franchises

    def assign_followers(self, users, franchises):
        for user in users:
            # Each user follows 1-2 random franchises
            follow_count = random.randint(1, 2)
            franchises_to_follow = random.sample(list(franchises), follow_count)
            
            for franchise in franchises_to_follow:
                # Check if user already follows franchise
                if not franchise.follower.filter(id=user.id).exists():
                    franchise.follower.add(user)
                    self.stdout.write(f'User {user.username} now follows {franchise.title}')
                else:
                    self.stdout.write(f'User {user.username} already follows {franchise.title}')

    def handle(self, *args, **options):
        self.stdout.write('Starting dummy data initialization...')

        # Create admin users
        for adminUser in adminUsers:
            if not User.objects.filter(username=adminUser['username']).exists():
                User.objects.create_superuser(
                    username=adminUser['username'],
                    email=adminUser['email'],
                    password=adminUser['password']
                )
                self.stdout.write(f'Created superuser: {adminUser["username"]}')
            else:
                self.stdout.write(f'Superuser already exists: {adminUser["username"]}')

        # Create publishers first
        publishers = self.create_dummy_publishers()
        
        # Then create other dummy data
        users = self.create_dummy_users()
        franchises = self.create_dummy_franchises()
        self.assign_followers(users, franchises)

        self.stdout.write(self.style.SUCCESS('Successfully initialized dummy data'))
