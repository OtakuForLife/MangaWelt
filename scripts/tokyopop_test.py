from datetime import datetime
import csv
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

try:
    from api.management.commands.scrapers.tokyopop import TokyopopScraper
except ImportError:
    # Ensure backend directory is in path
    import sys
    from pathlib import Path
    backend_path = str(Path(__file__).parent.parent / 'backend')
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)
    from api.management.commands.scrapers.tokyopop import TokyopopScraper

def scrape_tokyopop(start_page=1, max_pages=5, output_file="tokyopop_manga.csv"):
    """
    Scrape Tokyopop products and save to CSV using the TokyopopScraper class
    """
    print(f"Starting scrape from page {start_page} to {start_page + max_pages - 1}")
    
    # Initialize scraper
    scraper = TokyopopScraper(max_workers=5, rate_limit=0.5)
    
    # Get products with pagination parameters
    franchises_data = scraper.scrape_products(start_page=start_page, max_pages=max_pages)
    
    # Flatten the data structure for CSV export
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
    scrape_tokyopop(start_page=1, max_pages=1)  # Scrapes first page
