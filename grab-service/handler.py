import json
import requests
import time
import hashlib
import logging
from bs4 import BeautifulSoup

appname = username = "sndhackday"
secret = None  # aws secret is for internal use only

def _get_asin_score_tuple_list(occipital_rs):

    '''
    Create list of tuples 
    ====================
    param
        occipital_rs <dict> : As a dict, results from Occipital endpoint
    return
        rs_scores <array> : As an array, the results ordered by match score. [<ASIN_1>, <ASIN_2>, ...]
    '''

    rs_scores = []
    try:
        rs_array = occipital_rs['occipital']['searchResult']
        for rs in rs_array:
            # Get all asins
            if rs['contentType'] == 'ASIN':
                rs_scores.append((rs['content'], rs['properties']['searchScore']))
        
        # Then sort it in place on <MATCH_SCORE>
        sorted(rs_scores, key=lambda x: x[1])
        # Return array of <ASIN>
        rs_scores = [x for x in zip(*rs_scores)[0]]
    except Exception as e:
        logging.exception(e)
        logging.exception("Unable to obtain list of asins ordered by match score from Occipital results.")
    return rs_scores

def _get_products(wpge_text):

    '''
    We wanna parse an amazon page for the results
    ====================
    param
        wpge_text <string> : The webpage as a string.
    return
        panel_content <string> : Beautiful soup'd webpage, contains the extracted main query elements.
    '''

    panel_content = head = body = ""
    try:
        soup = BeautifulSoup(wpge_text, "html.parser")
        head = soup.find('head')
        body = soup.find('div', {'id':'atfResults'})
        if body == "":
            body = soup.find('ul')
        panel_content = str(head) + str(body)
    except Exception as e:
        logging.exception(e)
        logging.exception("Unable to parse out the relevant items from webpage output.")
    return panel_content

def getTokenSuffix(appName, userName, secret):
    
    '''
    This generates a token for use in visual studio as a key.
    ====================
    param
        appName <string> : The name of the app, this is a const.
        userName <string> : The username, this is a const.
        secret <secret> : Secret is given, this is a const.
    return
        (timestamp, token) <string, string> : Tuple to be passed in for VS request authentication.
    '''

    timestamp = token = ""
    try:
        timestamp = str(int(time.time()))
        token = hashlib.md5(secret + userName + appName + timestamp).hexdigest()
    except Exception as e:
        logging.exception(e)
        logging.exception("Unable to get token suffix.")
    return timestamp, token

def hello(event, context):

    '''
    This is a test lambda handler to see if we can return a dummy reponse.
    ====================
    param
        - 
    return
        - 
    '''

    body = {
        "message": "Go Serverless v1.0! Your function executed successfully!",
        "input": event
    }

    response = {
        "statusCode": 200,
        "body": json.dumps(body)
    }

    return response

def grab(event, context):
    
    '''
    This is the lambda handler function. 
    ====================
    param
        - event
    return
        - response
    '''
    try:
        # Preprocessing
        img = event['body'].decode('base64')
        
        # RESIZE
        
        # Create VS Key
        (timestamp, token) = getTokenSuffix(appname, username, secret)

        # CALL VS
        payload = {"application": appname, "username": username, "ts": timestamp, "authtoken": token}
        request_string = 'http://match-visualsearch.amazon.com/vsearch'

        r = requests.post(request_string, params = payload, files={"p_img_1": img, "vsearch_params_json": r"""{
        "occipital": {
        "file_list": {
        "p_img_1": "p_img_1"
        }
        }
        }"""})
        occipital = r.json()

        # JSON Parsing
        asins = _get_asin_score_tuple_list(occipital)
        
        # CALL PISA
        ref = 'a9vs'
        url = 'searchalias=aps'
        asins_piped = '|'.join(asins)
        asins_comma = 'asin:' + ','.join(asins)
        rank = 'visual-search-rank'

        #Spoof our request to come from a browser
        headers = {
            'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36'
        }
        payload = {'ref': ref, 'url': url, 'hidden-keywords': asins_piped, 'field-asin': asins_piped, 'rank': rank, 
                'qs-external-ranking-visual-sim': asins_comma}

        # Retrieve webpage of asin data

        webpage = requests.get('https://www.amazon.com/s', params=payload, headers=headers)
        logging.info(webpage.url)
        panel_text = _get_products(webpage.text)

        logging.info(panel_text)

        response = {
            "statusCode": 200,
            "body": panel_text
        }
    except Exception as e:
        logging.exception(e)
        response = {
            "statusCode": 500,
            "body": "Something unexpected happened, unable to match and list asins."
        }
    return response





