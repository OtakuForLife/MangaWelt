from concurrent.futures import ThreadPoolExecutor
import time
from typing import Dict, List, Optional
from bs4 import BeautifulSoup

from .base_scraper import BaseScraper, ProductInfo

class TokyopopScraper(BaseScraper):
    BASE_URL = "https://www.tokyopop.de"
    
    def _determine_product_type(self, soup: BeautifulSoup) -> str:
        """Determine product type from product details"""
        product_info = soup.find("ul", class_="product--base-info")
        
        if product_info:
            for entry in product_info.find_all("li", class_="base-info--entry"):
                label = entry.find("strong", class_="entry--label")
                if label and "Produkt" in label.text:
                    content = entry.find("span", class_="entry--content")
                    if content:
                        content_text = content.text.strip().upper()
                        if "MANGA" in content_text:
                            return "MANGA"
                        elif "LIGHT NOVEL" in content_text:
                            return "LIGHT_NOVEL"
                        elif "WEBTOON" in content_text:
                            return "WEBTOON"
                        else:
                            return "OTHER"

    def _extract_product_details(self, url: str) -> Optional[ProductInfo]:
        """Extract all product details from a product page"""
        content = self._fetch_page(url)
        if not content:
            return None

        soup = BeautifulSoup(content, "html.parser")
        
        title = self._extract_meta_content(soup, "title")
        description = self._extract_meta_content(soup, "description")
        image_url = self._extract_meta_content(soup, "image")
        
        isbn_tag = soup.find("meta", attrs={"itemprop": "isbn"})
        isbn = isbn_tag["content"].strip() if isbn_tag else "N/A"
        
        # Skip if ISBN is invalid or already seen
        if not self.is_valid_isbn(isbn) or isbn in self._seen_isbns:
            return None
        self._seen_isbns.add(isbn)
        
        release_date_tag = soup.find("meta", attrs={"itemprop": "releaseDate"})
        release_date = self.format_date_to_german(release_date_tag["content"]) if release_date_tag else "N/A"
        
        franchise = self._clean_franchise_name(title)
        product_type = self._determine_product_type(soup)
        
        return ProductInfo(
            title=title,
            franchise=franchise,
            isbn=isbn,
            description=description,
            image_url=image_url,
            release_date=release_date,
            product_type=product_type,
            url=url
        )

    def _get_product_links(self, page: int) -> List[str]:
        """Extract product links from a listing page"""
        url = f"{self.BASE_URL}/buecher/?p={page}"
        content = self._fetch_page(url)
        if not content:
            return []
        
        soup = BeautifulSoup(content, "html.parser")
        links = []
        
        for product in soup.find_all("div", class_="product--info"):
            link_tag = product.find("a", class_="product--title")
            if link_tag and "href" in link_tag.attrs:
                product_url = link_tag["href"]
                if not product_url.startswith(self.BASE_URL):
                    product_url = self.BASE_URL + product_url
                links.append(product_url)
        
        return links

def get_tokyopop_products() -> Dict[str, List[Dict]]:
    """Interface function for Django management command"""
    scraper = TokyopopScraper()
    return scraper.scrape_products()
