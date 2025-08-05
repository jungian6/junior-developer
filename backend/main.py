import json
import re
from fastapi import FastAPI, HTTPException
from models import Data, Source
from pathlib import Path
from typing import List
from urllib.parse import urlparse

app = FastAPI()

def extract_citation_ids(content: str) -> List[str]:
    """Extract all citation IDs from content that contains <ref>ID</ref> tags.
    
    Parses the provided content string to find all citation references enclosed
    in <ref> tags and returns a list of the citation IDs found within those tags.
    
    Args:
        content: The content string to search for citation references.
        
    Returns:
        A list of citation ID strings found within <ref> tags.
        
    Example:
        >>> extract_citation_ids("Text with <ref>ABC123</ref> and <ref>XYZ789</ref>")
        ['ABC123', 'XYZ789']
    """
    pattern = r'<ref>([^<]+)</ref>'
    citation_ids = re.findall(pattern, content)
    return citation_ids

def get_favicon_url(source_url: str) -> str:
    """Generate a favicon URL using Google's favicon service.
    
    Constructs a URL to Google's favicon service that will return the favicon
    for the given source URL's domain. The favicon is requested at 64x64 pixels.
    
    Args:
        source_url: The complete URL of the source website.
        
    Returns:
        A URL string pointing to the favicon via Google's service.
        
    Example:
        >>> get_favicon_url("https://www.gov.uk")
        'https://www.google.com/s2/favicons?domain=https://www.gov.uk&sz=64'
    """
    parsed_url = urlparse(source_url)
    domain = f"{parsed_url.scheme}://{parsed_url.netloc}"
    return f"https://www.google.com/s2/favicons?domain={domain}&sz=64"


def parse_content_with_sources(content_item: dict) -> Data:
    """Parse content with sources and categorise them as cited or non-cited.
    
    Processes raw data containing content and sources, identifying which sources
    are actually cited within the content via <ref> tags. Replaces citation
    references with proper HTML links and categorises sources accordingly.
    
    Args:
        content_item: Dictionary containing 'content', 'sources', and 'category' keys.
                     Sources should include 'id', 'title', 'source' fields.
        
    Returns:
        A Data object with processed content, cited sources, and non-cited sources.
        Favicon URLs are automatically generated for all sources.
        
    Note:
        Citations in content that don't match any source ID are replaced with
        red error text indicating the citation was not found.
    """
    # Extract citation IDs from content 
    referenced_ids = set(extract_citation_ids(content_item["content"]))
    
    # Initialise lists for categorising sources
    cited_sources = []
    non_cited_sources = []
    content_with_links = content_item["content"]
    unresolved_citations = referenced_ids.copy()  # Track which citations we haven't found sources for

    for source_dict in content_item["sources"]:
        source_obj = Source(
            **source_dict, 
            favicon=get_favicon_url(source_dict["source"])
        )

        if source_obj.id in referenced_ids:
            cited_sources.append(source_obj)
            unresolved_citations.discard(source_obj.id)
            # Replace <ref> tags with HTML links
            content_with_links = content_with_links.replace(
                f"<ref>{source_obj.id}</ref>", 
                f'<a href="{source_obj.source}" title="{source_obj.title}" target="_blank" rel="noopener noreferrer"><img src="{source_obj.favicon}" alt="" width="16" height="16">{source_obj.title}</a>'
            )
        else:
            non_cited_sources.append(source_obj)
    
    # Handle any citations that don't have corresponding sources
    for orphaned_citation_id in unresolved_citations:
        content_with_links = content_with_links.replace(
            f"<ref>{orphaned_citation_id}</ref>", 
            f'<span style="color: red;">Source not found</span>'
        )
        
    return Data(
        category=content_item["category"],
        cited_sources=cited_sources,
        non_cited_sources=non_cited_sources,
        content=content_with_links
    )

@app.get("/data", response_model=list[Data])
def get_data() -> list[Data]:
    """Retrieve and process all data with sources categorised by citation status.
    
    Loads data from the mock.json file, processes each item to separate
    cited and non-cited sources, and returns the processed data with
    citation references converted to proper HTML links.
    
    Returns:
        A list of Data objects, each containing processed content with
        sources categorised as either cited or non-cited.
        
    Raises:
        HTTPException: 404 if the data file is not found.
        HTTPException: 500 if the JSON data is invalid or malformed.
        
    Note:
        This endpoint processes the entire mock.json dataset on each request.
        Favicon URLs are automatically generated for all sources.
    """
    try:
        data = Path("data/mock.json").read_text()
        raw_data_list = json.loads(data)
    except FileNotFoundError:
        raise HTTPException(404, "File not found")
    except json.JSONDecodeError:
        raise HTTPException(500, "Invalid JSON data")
    
    # Process each item to separate cited vs non-cited sources
    processed_data = [parse_content_with_sources(content_item) for content_item in raw_data_list]
    
    return processed_data