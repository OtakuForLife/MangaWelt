from dataclasses import dataclass
from typing import Dict, List, Optional, Set
from datetime import datetime
import re
import requests
from requests.adapters import HTTPAdapter
from urllib3 import Retry
from bs4 import BeautifulSoup
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor
import time

@dataclass
class ProductInfo:
    """Common data model for manga/light novel products"""
    title: str
    franchise: str
    isbn: str
    description: str
    image_url: str
    release_date: str
    product_type: str
    url: str

class BaseScraper:
    """Base scraper class with common functionality"""
    
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    POSTFIXES = {
        " - Light Novel", "– Light Novel", " 2in1", " (Einzelband)",
        " Diamond Edition", " - Perfect Edition", " - Collectors Edition", " Collectors Edition"
    }
    
    def __init__(self, max_workers: int = 5, rate_limit: float = 1):
        self.session = self._create_session()
        self.max_workers = max_workers
        self.rate_limit = rate_limit
        self._seen_isbns: Set[str] = set()

    @staticmethod
    def _create_session() -> requests.Session:
        """Create a session with retry logic"""
        session = requests.Session()
        retry = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504]
        )
        adapter = HTTPAdapter(max_retries=retry, pool_connections=100, pool_maxsize=100)
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        return session

    @lru_cache(maxsize=1000)
    def _fetch_page(self, url: str) -> Optional[str]:
        """Fetch page content with caching and error handling"""
        try:
            response = self.session.get(url, headers=self.HEADERS, timeout=10)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error fetching {url}: {str(e)}")
            return None

    @staticmethod
    def format_date_to_german(date_str: str, input_format: str = "%Y-%m-%d") -> str:
        """
        Convert date string to German format (dd.mm.yyyy)
        
        Args:
            date_str: Date string to parse
            input_format: Expected format of input date string (default: YYYY-MM-DD)
            
        Returns:
            Date string in dd.mm.yyyy format, or 'N/A' if parsing fails
        """
        try:
            date_obj = datetime.strptime(date_str.strip(), input_format)
            return date_obj.strftime("%d.%m.%Y")
        except (ValueError, AttributeError):
            return "N/A"

    def _extract_meta_content(self, soup: BeautifulSoup, property_name: str) -> str:
        """Extract content from meta tags"""
        meta_tag = soup.find("meta", property=f"og:{property_name}")
        return meta_tag["content"].strip() if meta_tag else "N/A"

    @staticmethod
    def is_valid_isbn(isbn: str) -> bool:
        """Validates if the ISBN matches the format XXX-X-XXXX-XXXX-X"""
        isbn_pattern = r'^\d{3}-\d-\d{4}-\d{4}-\d$'
        return bool(re.match(isbn_pattern, isbn))

    def scrape_products(self, start_page: int = 1, max_pages: int = 5) -> Dict[str, List[Dict]]:
        """
        Main scraping function that coordinates the scraping process using helper methods.
        
        Args:
            start_page: Starting page number for pagination
            max_pages: Maximum number of pages to scrape
            
        Returns:
            Dictionary of franchises with their products
        """
        franchises: Dict[str, List[Dict]] = {}
        current_page = start_page
        
        while current_page < start_page + max_pages:
            product_links = self._get_product_links(current_page)
            if not product_links:
                break
                
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                future_to_url = {
                    executor.submit(self._extract_product_details, url): url 
                    for url in product_links
                }
                
                for future in future_to_url:
                    try:
                        product = future.result()
                        if not product:
                            continue
                        
                        if product.franchise not in franchises:
                            franchises[product.franchise] = []
                        
                        self.log_product(product)

                        franchises[product.franchise].append({
                            "title": product.title,
                            "image": product.image_url,
                            "description": product.description,
                            "isbn": product.isbn,
                            "link": product.url,
                            "release_date": product.release_date,
                            "type": product.product_type
                        })
                    
                    except Exception as e:
                        print(f"Error processing product: {str(e)}")
                    
                    time.sleep(self.rate_limit)
            
            print(f"Completed page {current_page}")
            current_page += 1
            
        return franchises

    def _get_product_links(self, page: int) -> List[str]:
        """
        Abstract method to be implemented by specific scrapers
        Returns list of product URLs from a listing page
        """
        raise NotImplementedError("Subclasses must implement _get_product_links")

    def _extract_product_details(self, url: str) -> Optional[ProductInfo]:
        """
        Abstract method to be implemented by specific scrapers
        Returns product information from a product page
        """
        raise NotImplementedError("Subclasses must implement _extract_product_details")
    
    def log_product(self, product: ProductInfo) -> None:
        """Log product information for debugging"""
        print(f"\nStored product information:")
        print(f"Title: {product.title}")
        print(f"Franchise: {product.franchise}")
        print(f"Description: {product.description}")
        print(f"Type: {product.product_type}")
        print(f"ISBN: {product.isbn}")
        print(f"Release Date: {product.release_date}")
        print(f"Image URL: {product.image_url}")
        print(f"Link: {product.url}")


    def _clean_franchise_name(self, title: str) -> str:
        """
        Clean franchise name by removing known postfixes and taking first part before comma
        
        Args:
            title: Full product title
            
        Returns:
            Cleaned franchise name or "None" if empty
        """
        franchise = ",".join(title.split(",")[:-1]).strip()
        for postfix in self.POSTFIXES:
            if franchise.endswith(postfix):
                franchise = franchise[:-len(postfix)].strip()
        return franchise or "None"
