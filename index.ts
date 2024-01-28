import * as fs from 'fs';
import * as xlsx from 'xlsx';

interface Retailer {
    directory_category: string;
    directory_social__facebook: string;
    directory_location__lat: number;
    directory_location__lng: number;
}

interface SearchIndexEntry {
    city: string;
    state: string;
    category: string;
    retailers: Retailer[];
}

function cleanData(data: any[]): any[] {
    // Implement data cleaning and processing logic here
    // For example, standardize phone numbers, validate addresses, etc.
    return data;
}

function generateSearchIndex(data: any[]): SearchIndexEntry[] {
    const searchIndex: SearchIndexEntry[] = [];

    // Group data by relevant criteria (e.g., city, state)
    const groupedData = data.reduce((acc, entry) => {
        if (entry.directory_category && typeof entry.directory_category === 'string') {
            // Split directory_categories by ';' and iterate through each category
            const categories = entry.directory_category.split(';');
            categories.forEach((category: string) => {
                const key = `${entry.directory_location__city}_${entry.directory_location__state}_${category}`;
                acc[key] = acc[key] || [];
                acc[key].push(entry);
            });
        }
        return acc;
    }, {});

    for (const key in groupedData) {
        if (groupedData.hasOwnProperty(key)) {
            const [city, state, category] = key.split('_');
            const group = groupedData[key];
            const indexEntry: SearchIndexEntry = {
                city,
                state,
                category,
                retailers: group.map((item: any) => ({
                    content_post_title: item.content_post_title.trim(),
                    directory_location__address: item.directory_location__address.trim(),
                })),
            };
            searchIndex.push(indexEntry);
        }
    }
    return searchIndex;
}

function main(): void {

    // get input and output file path as command line argument.
    const [, , inputFile, outputFile] = process.argv;

    // Read the spreadsheet into a JSON object
    const workbook = xlsx.readFile(inputFile);
    const sheetName = workbook.SheetNames[0];
    const data: any[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Clean and process the data
    const cleanedData = cleanData(data);

    // Generate the search index
    const searchIndex = generateSearchIndex(cleanedData);

    // Output the search index as a stream of JSON lines
    const outputStream = fs.createWriteStream(outputFile);
    searchIndex.forEach(entry => {
        outputStream.write(JSON.stringify(entry) + '\n');
    });

    outputStream.end();
}

// Run the main function
main();