let PDFParser = require("pdf2json");
 
var request = require('request');
require('./parserUtil');

module.exports.parse = function(html, date, callback) {
    let dayMenu = [];
    if (date.day() < 1 || date.day() > 5) {
        callback([]);
        return;
    }

    function groupBy(list, keyGetter) {
        const map = new Map();
        list.forEach((item) => {
             const key = keyGetter(item);
             const collection = map.get(key);
             if (!collection) {
                 map.set(key, [item]);
             } else {
                 collection.push(item);
             }
        });
        return map;
    }

    function columnIndex(x) {
        if (x < 6.5) {
            return 0;
        } else if (x < 14.6) {
            return 1;
        } else if (x < 23.1) {
            return 2;
        } else if (x < 31.3) {
            return 3;
        } else if (x < 39.8) {
            return 4;
        } else if (x < 47.8) {
            return 5;
        }

        return -1;
    }

    function rowIndex(y) {
        if (y < 11.5) {
            return -1;
        } else if (y < 16) {
            return 0;
        } else if (y < 20.5) {
            return 1;
        } else if (y < 25.3) {
            return 2;
        }

        return -1;
    }

    function columnIndexAllDays(x) {
        if (x < 6.5) {
            return 0;
        } else if (x < 47.8) {
            return 1;
        }

        return -1;
    }

    function rowIndexAllDays(y) {
        if (y < 26.4) {
            return -1;
        } else if (y < 27.6) {
            return 0;
        } else if (y < 28.9) {
            return 1;
        } else if (y < 30) {
            return 2;
        } else if (y < 31) {
            return 3;
        } else if (y < 32) {
            return 4;
        }

        return -1;
    }

    let pdfFilePath = `http://www.lunch-5.ch/uploads/menuplan.pdf`;
    let pdfParser = new PDFParser();
    let pdfPipe = request({ url: pdfFilePath, encoding: null }).pipe(pdfParser);
    pdfPipe.on("pdfParser_dataError", errData => console.error(errData.parserError));
    pdfPipe.on("pdfParser_dataReady", pdfData => {
            let texts = pdfData.formImage.Pages[0].Texts;
            let groupedByColumn = groupBy(texts, text => columnIndex(text.x));
            let weekDay = date.day();
            let dayColumn = groupedByColumn.get(weekDay);
            let rows = groupBy(dayColumn, text => rowIndex(text.y));

            rows.forEach(function(menuLines,key) {
                if (key !== -1) {
                    menuLines.sort((a,b) => a.y - b.y);
                    if (menuLines.length > 1) {
                        let text = '';
                        for (let index = 0; index < menuLines.length - 1; index++) {
                            const element = menuLines[index].R[0];
                            if (element.T !== undefined) {
                                text += normalize(decodeURIComponent(element.T)) + " ";
                            }
                        }
    
                        let price = parseFloat(decodeURIComponent(menuLines[menuLines.length - 1].R[0].T).replace("Fr.", "").replace("Fr", "").trim());
                        dayMenu.push({ isSoup: false, text: text, price: price });
                    }
                }
            });

            let groupedByColumnAllDays = groupBy(texts, text => columnIndexAllDays(text.x));
            let dayColumnAllDays = groupedByColumnAllDays.get(1);
            let rowsAllDays = groupBy(dayColumnAllDays, text => rowIndexAllDays(text.y));

            rowsAllDays.forEach(function(menuLines,key) {
                if (key !== -1) {
                    menuLines.sort((a,b) => a.x - b.x);
                    if (menuLines.length > 1) {
                        let text = '';
                        for (let index = 0; index < menuLines.length - 1; index++) {
                            const element = menuLines[index].R[0];
                            if (element.T !== undefined) {
                                text += normalize(decodeURIComponent(element.T)) + " ";
                            }
                        }
    
                        let price = parseFloat(decodeURIComponent(menuLines[menuLines.length - 1].R[0].T).replace("Fr.", "").replace("Fr", "").trim());
                        dayMenu.push({ isSoup: false, text: text, price: price });
                    }
                }
            });
            callback(dayMenu);
        });

    function normalize(str) {
        return str.normalizeWhitespace()
            .removeMetrics()
            .correctCommaSpacing()
            .removeItemNumbering();
    }
};
