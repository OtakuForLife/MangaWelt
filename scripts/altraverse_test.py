from datetime import datetime
import csv
import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_path = str(Path(__file__).parent.parent / 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from api.management.commands.scrapers.altraverse import AltraverseScraper

def scrape_altraverse(start_page=1, max_pages=5, output_file="altraverse_manga.csv"):
    """
    Scrape Altraverse products and save to CSV
    """
    print(f"Starting scrape from page {start_page} to {start_page + max_pages - 1}")
    
    # Initialize scraper
    scraper = AltraverseScraper(max_workers=5, rate_limit=0.5)
    
    # Get products
    franchises_data = scraper.scrape_products(start_page=start_page, max_pages=max_pages)
    
    all_products = []
    for franchise_name, products in franchises_data.items():
        for product in products:
            product_data = {
                "ISBN": product["isbn"],
                "Title": product["title"],
                "Description": product["description"],
                "Type": product["type"],
                "Image URL": product["image"],
                "Franchise": franchise_name,
                "Release Date": product["release_date"],
                "URL": product["link"]
            }
            all_products.append(product_data)

    # Save to CSV
    if all_products:
        keys = all_products[0].keys()
        with open(output_file, "w", newline="", encoding="utf-8") as output_csv:
            dict_writer = csv.DictWriter(output_csv, fieldnames=keys)
            dict_writer.writeheader()
            dict_writer.writerows(all_products)
        print(f"\nData saved to {output_file}")
        print(f"Total products scraped: {len(all_products)}")
    else:
        print("No products were found")

if __name__ == "__main__":
    scrape_altraverse(start_page=1, max_pages=1)  # Scrapes first page
