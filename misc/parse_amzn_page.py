import requests
import urllib
from bs4 import BeautifulSoup
# from beautifulsoup4 import BeautifulSoup

def _get_products(wpge_text):
    '''
        We wanna parse an amazon page for the results
    '''
    head = body = ""
    soup = BeautifulSoup(wpge_text, "html.parser")

    head = soup.find('head')
    body = soup.find('div', {'id':'atfResults'})
    if body == "":
        body = soup.find('ul')
    panel_content = str(head) + str(body)
    return panel_content

if __name__ == "__main__":
    asins = ['B06WD3JKMS', 'B00NWODXM8', 'B00NWOD2D8']
    ref = 'a9vs'
    url = 'searchalias=aps'
    asins_piped = '|'.join(asins)
    asins_comma = 'asin:' + ','.join(asins)
    rank = 'visual-search-rank'
    payload = {'ref': ref, 'url': url, 'hidden-keywords': asins_piped, 'field-asin': asins_piped, 'rank': rank,
            'qs-external-ranking-visual-sim': asins_comma}
    headers = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'}
    # Retrieve webpage of asin data
    r = requests.get('https://www.amazon.com/s', params=payload, headers=headers)

    _get_products(r.text)