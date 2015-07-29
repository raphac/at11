var assert = require('assert'),
    fs = require('fs'),
    moment = require('moment-timezone'),
    parser = require('../parsers/alfa'),
    testHelpers = require('../test/testHelpers');

moment.locale('sk');

describe('alfa', function() {
    describe('parsing sample 2015-07-29', function() {

        var html = fs.readFileSync(__dirname + '/samples/Alfa.2015-07-29.html', { encoding: "utf-8" });
        var menu;

        before(function(done) {
            testHelpers.setWeekDates(moment("2017-07-29"));
            parser.parse(html, function(menuItems) {
                menu = menuItems.filter(function(x) { if(x.day == moment().day(2).format('dddd')) return true; })[0].menu;
                done();
            });
        });

        it("should return 7 items", function() {
            assert.equal(menu.length, 7);
        });

        it("1st item correct", function() {
            assert.equal(menu[0].isSoup, true, "isSoup should be true");
            assert.equal(menu[0].text, "Hov. vyvar s pec. haluškami");
            assert.equal(isNaN(menu[0].price), true, "price should not exist");
        });

        it("2nd item correct", function() {
            assert.equal(menu[1].isSoup, true, "isSoup should be true");
            assert.equal(menu[1].text.trim(), "Frankfurtská");
            assert.equal(isNaN(menu[1].price), true, "price should not exist");
        });

        it("3rd item correct", function() {
            assert.equal(menu[2].isSoup, false, "isSoup should be false");
            assert.equal(menu[2].text, "Pečené kuracie stehno, ryža, kompót");
            assert.equal(isNaN(menu[2].price), false, "price should be there");
            assert.equal(menu[2].price, 3.8, "price is wrong");
        });
    });
});
