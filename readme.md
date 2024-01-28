
To Build the project compile the index.ts typescript file to generate index.js file :
    tsc index.ts

To run the project provide path to customer_spreadsheet and output file to be generated as follows :
    node index.js ./iw-tech-test-retailer-data.xlsx ./search_index.jsonl

To check the output : 
    vim search_index.jsonl