let PDFParser = require("pdf2json");
 
var request = require('request');

require('./parserUtil');

module.exports.parse = function(html, date, callback) {

    function getWeekNumber(d) {
        let onejan = new Date(d.getFullYear(), 0, 1);
        return Math.ceil( (((d - onejan) / 86400000) + onejan.getDay() + 1) / 7 );
    }
    
    var dayMenu = [];
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
        if (x < 10) {
            return 0;
        } else if (x < 17) {
            return 1;
        } else if (x < 24) {
            return 2;
        } else if (x < 31) {
            return 3;
        } else if (x < 38) {
            return 4;
        } else if (x < 45) {
            return 5;
        }

        return -1;
    }

    function rowIndex(y) {
        if (y < 6) {
            return -1;
        } else if (y < 11) {
            return 0;
        } else if (y < 15.8) {
            return 1;
        } else if (y < 20.5) {
            return 2;
        } else if (y < 25) {
            return 3;
        } else if (y < 29.5) {
            return 4;
        }

        return -1;
    }

    var pdfFilePath = `https://www.topolino-herdern.ch/files/MenuplanKW${getWeekNumber(date.toDate())}.pdf`;
    let pdfParser = new PDFParser();
    var pdfPipe = request({url: pdfFilePath, encoding:null}).pipe(pdfParser);
    pdfPipe.on("pdfParser_dataError", errData => console.error(errData.parserError) );
    pdfPipe.on("pdfParser_dataReady", pdfData => {
            var texts = pdfData.formImage.Pages[0].Texts;
            var groupedByColumn = groupBy(texts, text => columnIndex(text.x));
            var weekDay = date.day();
            var dayColumn = groupedByColumn.get(weekDay);
            var rows = groupBy(dayColumn, text => rowIndex(text.y));

            rows.forEach(function(menuLines,key) {
                if (key !== -1) {
                    menuLines.sort((a,b) => a.y - b.y);
                    if (menuLines.length > 1) {
                        var text = '';
                        for (let index = 0; index < menuLines.length - 1; index++) {
                            const element = menuLines[index].R[0];
                            if (element.T !== undefined) {
                                text += normalize(decodeURIComponent(element.T)) + " ";
                            }
                        }
    
                        var price = parseFloat(decodeURIComponent(menuLines[menuLines.length - 1].R[0].T).replace("CHF", "").trim());
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
