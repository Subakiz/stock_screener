import requests

# Replace with your actual Alpha Vantage API key
API_KEY = 'GGHF06JLSAHDOL5L'
symbol = 'IBM'

# Construct the API URL for the OVERVIEW function
url = f'https://www.alphavantage.co/query?function=OVERVIEW&symbol={symbol}&apikey={API_KEY}'

try:
    # Make the API request
    response = requests.get(url)
    data = response.json() # Parse the JSON response

    # Check if we got valid data back
    if "PERatio" in data and data["PERatio"] is not None:
        # Extract specific information
        company_name = data.get('Name')
        pe_ratio = data.get('PERatio')
        sector = data.get('Sector')

        print(f"Successfully fetched data for: {company_name}")
        print(f"Sector: {sector}")
        print(f"P/E Ratio: {pe_ratio}")

        # Your logic to decide if it's "discounted" would go here
        # For example, is a P/E ratio of less than 15 good?
        if float(pe_ratio) < 15:
            print("Verdict: Potentially undervalued based on P/E ratio. 👍")
        else:
            print("Verdict: Not clearly undervalued based on P/E ratio. 👎")

    else:
        # Handle cases where the API limit might be reached or symbol is invalid
        print(f"Could not retrieve P/E Ratio. Response: {data}")

except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")
