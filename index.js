"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var xlsx = require("xlsx");
function cleanData(data) {
    // Implement data cleaning and processing logic here
    // For example, standardize phone numbers, validate addresses, etc.
    return data;
}
function generateSearchIndex(data) {
    var searchIndex = [];
    // Group data by relevant criteria (e.g., city, state)
    var groupedData = data.reduce(function (acc, entry) {
        if (entry.directory_category && typeof entry.directory_category === 'string') {
            // Split directory_categories by ';' and iterate through each category
            var categories = entry.directory_category.split(';');
            categories.forEach(function (category) {
                var key = "".concat(entry.directory_location__city, "_").concat(entry.directory_location__state, "_").concat(category);
                acc[key] = acc[key] || [];
                acc[key].push(entry);
            });
        }
        return acc;
    }, {});
    for (var key in groupedData) {
        if (groupedData.hasOwnProperty(key)) {
            var _a = key.split('_'), city = _a[0], state = _a[1], category = _a[2];
            var group = groupedData[key];
            var indexEntry = {
                city: city,
                state: state,
                category: category,
                retailers: group.map(function (item) { return ({
                    content_post_title: item.content_post_title.trim(),
                    directory_location__address: item.directory_location__address.trim(),
                }); }),
            };
            searchIndex.push(indexEntry);
        }
    }
    return searchIndex;
}
function main() {
    // get input and output file path as command line argument.
    var _a = process.argv, inputFile = _a[2], outputFile = _a[3];
    // Read the spreadsheet into a JSON object
    var workbook = xlsx.readFile(inputFile);
    var sheetName = workbook.SheetNames[0];
    var data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    // Clean and process the data
    var cleanedData = cleanData(data);
    // Generate the search index
    var searchIndex = generateSearchIndex(cleanedData);
    // Output the search index as a stream of JSON lines
    var outputStream = fs.createWriteStream(outputFile);
    searchIndex.forEach(function (entry) {
        outputStream.write(JSON.stringify(entry) + '\n');
    });
    outputStream.end();
}
// Run the main function
main();
