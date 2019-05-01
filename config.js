module.exports = {
	port: process.env.PORT || 54321,
	cacheExpiration: 2 * 60 * 60 * 1000, //2h
	parserTimeout: 10 * 1000, //10s
	restaurants: [
        { id: 1, name: 'LUNCH 5 (Swisscom)', url: 'http://www.lunch-5.ch', module: 'lunch' },
        { id: 2, name: 'nanuu', url: 'https://www.naanu.ch/', module: 'nanuu' },
        { id: 3, name: 'Toni-Areal', url: 'https://zfv.ch/de/microsites/gastronomie-im-toni-areal/menueplan', module: 'toni' },
        { id: 4, name: 'Technopark', url: 'https://zfv.ch/de/microsites/gastronomie-im-technopark-zuerich/menueplan', module: 'techno' },
        { id: 5, name: 'Topolino (Migros)', url: 'https://www.topolino-herdern.ch/', module: 'topolino' }
	]
};
