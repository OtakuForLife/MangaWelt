from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Product, Franchise, Publisher
from api.constants import PRODUCT_TYPE

from .scrapers.altraverse import AltraverseScraper
from .scrapers.tokyopop import TokyopopScraper
from .scrapers.base_scraper import BaseScraper
from datetime import datetime
import re


class Command(BaseCommand):
    help = 'Updates the database with new manga and light novel releases'

    def writeToDatabase(self, products, publisher):
        for franchise_name, items in products.items():
            # Get or create franchise
            franchise, _ = Franchise.objects.get_or_create(
                title=franchise_name,
                defaults={}
            )

            for item in items:
                # Skip items with invalid ISBNs
                if not item.get('isbn') or not BaseScraper.is_valid_isbn(item['isbn']):
                    self.stdout.write(
                        f'Skipping item with invalid ISBN: {item.get("isbn")}')
                    continue

                # Convert release date string to datetime
                release_date = None
                if item.get('release_date') and item['release_date'] != 'N/A':
                    try:
                        release_date = datetime.strptime(
                            item['release_date'],
                            '%d.%m.%Y'
                        ).date()
                    except ValueError:
                        self.stdout.write(
                            f'Invalid release date format: {item["release_date"]}'
                        )

                # Get or create product
                product, created = Product.objects.get_or_create(
                    isbn=item['isbn'],
                    defaults={
                        'title': item['title'],
                        'franchise': franchise,
                        'description': item.get('description', ''),
                        'image': item.get('image', ''),
                        'link_to_provider': item.get('link', ''),
                        'release_date': release_date,
                        'type': PRODUCT_TYPE[item.get('type', 'MANGA')],
                        'publisher': publisher,
                    }
                )

                if not created:
                    # Update existing product
                    product.title = item['title']
                    product.description = item.get('description', '')
                    product.image = item.get('image', '')
                    product.link_to_provider = item.get('link', '')
                    product.release_date = release_date
                    product.type = PRODUCT_TYPE[item.get('type', 'MANGA')]
                    product.save()

                action = 'Created' if created else 'Updated'
                self.stdout.write(
                    f'{action} product: {product.title} (ISBN: {product.isbn})'
                )

    def handle(self, *args, **options):
        self.stdout.write('Starting monthly update...')

        # Initialize scrapers
        #altraverse_scraper = AltraverseScraper(max_workers=1, rate_limit=1.0)
        #tokyopop_scraper = TokyopopScraper(max_workers=1, rate_limit=1.0)

        # Get products from both publishers
        #self.stdout.write('Scraping Altraverse products...')
        #altraverse_products = altraverse_scraper.scrape_products()

        #self.stdout.write('Scraping Tokyopop products...')
        #tokyopop_products = tokyopop_scraper.scrape_products()

        # Process and store products
        publishers = {
            #'Altraverse': (altraverse_products, Publisher.objects.get_or_create(name='Altraverse')[0]),
            #'Tokyopop': (tokyopop_products, Publisher.objects.get_or_create(name='Tokyopop')[0])
            'Test': ({
                'ShangriLaFrontier': [
                    {
                        'isbn': '978-3-7539-3206-4',
                        'title': 'ShangriLaFrontier, Band 19',
                        'description': 'Die vier Siegelgeneräle sind besiegt und der Weg damit frei. Nun gilt es für Sunraku und seine Freunde, den nächsten der Stärksten Sieben, Kthanid aus dem Abgrund, herauszufordern. Doch wie wollen sie gegen seine Kraft, die alles umkehren kann, ankommen?',
                        'image': 'https://altraverse.de/media/image/0d/96/fb/meine-wiedergeburt-als-schleim-27-cover_400x400.jpg',
                        'release_date': '17.03.2025',
                        'type': 'MANGA',
                        'link': 'https://altraverse.de/manga/shangri-la-frontier/2033/shangrilafrontier-band-19'
                    }
                ],
                'Meine Wiedergeburt als Schleim in einer anderen Welt': [
                    {
                        'isbn': '978-3-7539-3187-6',
                        'title': 'Meine Wiedergeburt als Schleim in einer anderen Welt, Band 27', 
                        'description': 'Das Gründungsfest von Tempest war ein voller Erfolg und hat alle Gäste begeistert. Doch die Händler müssen noch bezahlt werden und sie wurden von irgendwem dazu angestachelt, nur noch die Münzen des Zwergenreichs zu akzeptieren. Rimuru will die Chance nutzen und den Spieß umdrehen, um so die Hintermänner der Intrige zu entlarven.',
                        'image': 'https://altraverse.de/media/image/12/c9/5c/meine-wiedergeburt-als-schleim-27-CE-cover_400x400.jpg',
                        'release_date': '17.03.2025',
                        'type': 'MANGA',
                        'link': 'https://altraverse.de/manga/meine-wiedergeburt-als-schleim-in-einer-anderen-welt/2022/meine-wiedergeburt-als-schleim-in-einer-anderen-welt-band-27'
                    },
                    {
                        'isbn': '978-3-7539-3184-5',
                        'title': 'Meine Wiedergeburt als Schleim in einer anderen Welt – Kleimans Rache, Band 05', 
                        'description': 'Nach seinem Besuch der Auktion ist Kleiman gerüstet mit Tränken, von denen er sich erhofft, sie könnten den Energieverbrauch der Namensgebungen ausgleichen. Dazu hat er sich nun in den Kopf gesetzt, selbst magische Werkzeuge herzustellen …',
                        'image': 'https://altraverse.de/media/image/19/b9/f0/das-leben-im-land-der-daemonen-03-cover_400x400.jpg',
                        'release_date': '17.03.2025',
                        'type': 'MANGA',
                        'link': 'https://altraverse.de/manga/meine-wiedergeburt-als-schleim-in-einer-anderen-welt/2025/meine-wiedergeburt-als-schleim-in-einer-anderen-welt-kleimans-rache-band-05'
                    }
                ]
            }, Publisher.objects.get_or_create(name='Test')[0])
        }

        for publisher_name, (products, publisher) in publishers.items():
            self.stdout.write(f'Processing {publisher_name} products...')
            self.writeToDatabase(products, publisher)

        self.stdout.write('Monthly update completed successfully!')
