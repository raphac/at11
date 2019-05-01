var cheerio = require('cheerio');
require('./parserUtil');

module.exports.parse = function(html, date, callback) {
    var $ = cheerio.load(html);
    var dayMenu = [];

    var dateStr = date.format("YYYY-MM-DD");
    var menus = $(`.table.menu tbody tr[data-date="${dateStr}"] .txt-hold`);
    menus.each(function() {
        var elem = $(this)[0];

        var found;
        var text = "";
        for (var i = 0; i < elem.children.length; i++) {
            var tableChild = elem.children[i];
            if (tableChild.nodeValue !== undefined || tableChild.nodeValue !== null) {
                if (tableChild.nodeValue.includes("CHF")) {
                    found = tableChild;
                    break;
                } else {
                    text += normalize(tableChild.nodeValue) + " ";
                }
            }
        }

        if (found !== undefined) {
            var prices = found.nodeValue.split("/");
            var price = parseFloat(prices[prices.length - 1].replace("CHF", "").trim());
            dayMenu.push({ isSoup: false, text: text, price: price });
        }
    });

    callback(dayMenu);

    function normalize(str) {
        return str.normalizeWhitespace()
            .removeMetrics()
            .correctCommaSpacing()
            .removeItemNumbering();
    }
};
