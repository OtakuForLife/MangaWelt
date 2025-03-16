from typing import Dict, List, Optional
from .base_scraper import BaseScraper, ProductInfo
from bs4 import BeautifulSoup

class AltraverseScraper(BaseScraper):
    """Scraper for Altraverse manga/light novel website"""
    
    BASE_URL = "https://altraverse.de"

    def _determine_product_type(self, soup: BeautifulSoup) -> str:
        """Determine product type from product details"""
        product_info = soup.find("ul", class_="product--base-info")
        
        if product_info:
            for entry in product_info.find_all("li", class_="base-info--entry entry--Produkt"):
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

    def _get_product_links(self, page: int) -> List[str]:
        """Extract product links from a listing page"""
        url = f"{self.BASE_URL}/manga/?p={page}"
        content = self._fetch_page(url)
        if not content:
            return []
        
        soup = BeautifulSoup(content, "html.parser")
        links = []
        
        for product in soup.select("div.product--info a.product--title[href]"):
            product_url = product["href"]
            if not product_url.startswith(self.BASE_URL):
                product_url = self.BASE_URL + product_url
            links.append(product_url)
        
        return links

    def _extract_product_details(self, url: str) -> Optional[ProductInfo]:
        """Extract product details from a product page"""
        html = self._fetch_page(url)
        if not html:
            return None
            
        soup = BeautifulSoup(html, "html.parser")

        # Extract ISBN and validate
        isbn = soup.select_one('span.entry--content[itemprop="isbn"]')
        isbn = isbn.text.strip() if isbn else "N/A"
        if not self.is_valid_isbn(isbn):
            print(f"Invalid ISBN format: {isbn}")
            return None

        # Skip if ISBN already seen
        if isbn in self._seen_isbns:
            print(f"Duplicate ISBN found: {isbn}")
            return None
        self._seen_isbns.add(isbn)

        # Extract basic metadata
        title = soup.select_one("h1.product--title")
        title = title.text.strip() if title else "N/A"
        
        description = soup.select_one("div.product--description")
        description = description.text.strip() if description else "N/A"
        
        image = soup.find('a', class_='product--image').find('img')
        image_url = image["srcset"].split(",")[0].strip() if image else "N/A"
        
        franchise = self._clean_franchise_name(title)

        # Extract release date and product type
        release_date = "N/A"
        
        for detail in soup.select("li.base-info--entry.entry-attribute"):
            label = detail.select_one("strong.entry--label")
            if not label:
                continue
                
            value = detail.select_one("span.entry--content")
            if not value:
                continue
                
            label_text = label.text.strip()
            value_text = value.text.strip()
            
            if "Veröffentlichung" in label_text:
                release_date = self.format_date_to_german(value_text, "%d.%m.%Y")
        
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

def get_altraverse_products() -> Dict[str, List[Dict]]:
    """Interface function for Django management command"""
    scraper = AltraverseScraper()
    return scraper.scrape_products()
