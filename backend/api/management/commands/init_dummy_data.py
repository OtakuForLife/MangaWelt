from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Product, Franchise, Publisher

# Predefined data
adminUsers = [{
    'username': 'admin',
    'email': 'admin@example.com',
    'password': 'admin123'
},]

franchises = [
    {
        'title': 'Gamers!',
        'description': 'A romantic comedy about gamers, misunderstandings, and relationships.',
        'image': 'https://altraverse.de/media/image/71/eb/bb/gamers-01-01-cover_400x400.jpg',
        'is_followed': True,  # This franchise is followed by default
        'products': [
            {
                'isbn': '978-3-96358-096-3',
                'title': 'Gamers! Light Novel, Band 01',
                'description': 'Keita Amanos einziges Charaktermerkmal ist seine Liebe für Videospiele...',
                'image': 'https://altraverse.de/media/image/fb/f9/cb/gamers-light-novel-01_400x400.jpg',
                'release_date': '2021-05-28',
                'type': 'LIGHT_NOVEL',
                'volume': 1,
                'link_to_provider': 'https://altraverse.de',
                'is_owned': True  # This product is owned by default
            },
            {
                'isbn': '978-3-96358-093-2',
                'title': 'Gamers!, Band 01',
                'description': 'Keita Amano ist so durchschnittlich, dass es fast schon wehtut...',
                'image': 'https://altraverse.de/media/image/71/eb/bb/gamers-01-01-cover_400x400.jpg',
                'release_date': '2022-12-03',
                'type': 'MANGA',
                'volume': 1,
                'link_to_provider': 'https://altraverse.de',
                'is_owned': False
            },
            {
                'isbn': '978-3-96358-102-1',
                'title': 'Gamers! Light Novel, Band 07',
                'description': 'Keita wollte auf seinem Heimweg eigentlich nur noch schnell raiden...',
                'image': 'https://altraverse.de/media/image/6d/62/fe/gamers-light-novel-07-cover_400x400.jpg',
                'release_date': '2025-02-17',
                'type': 'LIGHT_NOVEL',
                'volume': 7,
                'link_to_provider': 'https://altraverse.de',
                'is_owned': False
            }
        ]
    },
    {
        'title': 'Meine unerwiderte Liebe',
        'description': 'A touching story about unrequited love and personal growth.',
        'image': 'https://altraverse.de/media/image/e9/cb/36/meine-unerwiderte-liebe-04-cover_400x400.jpg',
        'is_followed': False,
        'products': [
            {
                'isbn': '978-3-96358-432-9',
                'title': 'Meine unerwiderte Liebe, Band 04',
                'description': 'Uta hat versucht, sich ihrer heimlichen Liebe Kaoru zu offenbaren...',
                'image': 'https://altraverse.de/media/image/e9/cb/36/meine-unerwiderte-liebe-04-cover_400x400.jpg',
                'release_date': '2024-10-18',
                'type': 'MANGA',
                'volume': 4,
                'link_to_provider': 'https://altraverse.de',
                'is_owned': True
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
    help = 'Initializes the database with dummy data for testing (single-user app)'

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
            franchise, created = Franchise.objects.update_or_create(
                title=franchise_data["title"],
                defaults={
                    "description": franchise_data["description"],
                    "image": franchise_data["image"],
                    "is_followed": franchise_data.get("is_followed", False)
                }
            )

            if created:
                self.stdout.write(f'Created franchise: {franchise.title} (followed: {franchise.is_followed})')
            else:
                self.stdout.write(f'Updated franchise: {franchise.title} (followed: {franchise.is_followed})')

            # Create products for this franchise
            for product_data in franchise_data["products"]:
                product, product_created = Product.objects.update_or_create(
                    isbn=product_data["isbn"],  # This is the lookup field
                    defaults={                  # These fields will be updated if the object exists
                        "title": product_data["title"],
                        "description": product_data["description"],
                        "image": product_data["image"],
                        "release_date": product_data["release_date"],
                        "type": product_data["type"],
                        "link_to_provider": product_data["link_to_provider"],
                        "franchise": franchise,
                        "publisher": publisher,
                        "is_owned": product_data.get("is_owned", False)
                    }
                )
                action = "Created" if product_created else "Updated"
                self.stdout.write(f'{action} product: {product_data["title"]} (owned: {product.is_owned})')

            created_franchises.append(franchise)
            self.stdout.write(f'Franchise {franchise.title} has {len(franchise_data["products"])} products')

        return created_franchises

    def handle(self, *args, **options):
        self.stdout.write('Starting dummy data initialization...')
        self.stdout.write('Note: This is a single-user app. Ownership and follow states are global.')

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
        self.create_dummy_publishers()

        # Create franchises and products with ownership/follow states
        self.create_dummy_franchises()

        self.stdout.write(self.style.SUCCESS('Successfully initialized dummy data'))
        self.stdout.write(self.style.SUCCESS('Some products are marked as owned and some franchises as followed by default'))
