Module.register("compliments", {
	defaults: {
				compliments: {
					anytime : [
						"Fi tu însuți, sexy!",
						"Orice faci, fă-o bine!",
					],
					sleep : [
						"De ce nu dormi?",
						"Știi cât e ceasul?",
						"Ai vreun coșmar?",
						"Ai fost la baie?",
					],
					morning : [
						"Dimineață frumoasă!",
						"Bună dimineața!",
						"Dimineață frumoasă!",
						"Bună dimineața!",
						"Ai dormit bine?",
						"Să ai poftă la cafea?",
					],
					noon : [
						"Un prânz excelent!",
						"Poftă bună la prânz!",
						"O zi cât mai bună!",
						"O zi fantastică!",
						"O zi și mai bună!",
						"O zi și mai fantastică!",
					],
					afternoon : [
						"O după amiază bună!",
//						"Bună ziua!",
						"O zi cât mai bună!",
						"O zi excelentă!",
					],
					evening : [
						"O seară minunată!",
//						"Bună seara!",
						"O seară liniștită!",
						"O seară plăcută!",
					],
					night : [
						"Somn ușor!",
						"Noapte bună!",
						"Vise plăcute!",
						"Să visezi frumos!",
					],
					day_sunny : [
						"Este o zi însorită",
						"Este frumos afară",
					],
					day_cloudy : [
						"Sunt câțiva nori",
						"Norișori pe cer",
					],
					cloudy : [
						"Este înorat afară",
						"O zi cam înorată",
					],
					cloudy_windy : [
						"Este înorat și vânt",
						"Bate vântul și e înorat",
					],
					shower : [
						"Afară plouă puțin",
						"Plouă puțin pe afară",
					],
					rain : [
//						"Să-ți iei umbrela!",
						"Vreme ploioasă",
						"Ploaie ușoară",
					],
					tunderstorm : [
						"Afară este furtună!",
						"Atenție, furtună!",
					],
					snow : [
						"Afară ninge!",
						"Este ninsoare",
					],
					fog : [
						"Afară este ceață",
						"Vreme cu ceață",
					],
					night_clear : [
						"Cerul este senin",
						"Este senin afară",
					],
					night_cloudy : [
						"Este înorat afară",
						"Este cam înorat",
					],
					night_showers : [
						"Afară plouă mărunt",
						"Ploaie măruntă",
					],
					night_rain : [
						"Afară plouă",
						"Vreme ploioasă",
					],
					night_thunderstorm : [
						"Vreme furtunoasă!",
						"Nu e vreme de ieșit!",
					],
					night_snow : [
						"Vreme cu ninsoare",
						"Afară ninge!",
					],
					night_alt_cloudy_windy : [
						"Vreme noroasă cu vânt",
						"Vreme cu vânt și nori",
					],
					1310 : [
						"La mulți ani Răzvan!",
						"La mulți ani Răzvan!",
					],
					2208 : [
						"La mulți ani Paula!",
						"La mulți ani Paula!",
					],
					1902 : [
						"La mulți ani Vlad!",
						"La mulți ani Vlad!",
					],
					2402 : [
						"La mulți ani Alexandra!",
						"La mulți ani Alexandra!",
					],
					1412 : [
						"La mulți ani Costin!",
						"La mulți ani Costin!",
					],
					0502 : [
						"La mulți ani Ștefania!",
						"La mulți ani Ștefania!",
					],
					2102 : [
						"La mulți ani Preoteasa!",
						"La mulți ani Preoteasa!",
					],
					1004 : [
						"La mulți ani Nelu!",
						"La mulți ani Nelu!",
					],
					0107 : [
						"La mulți ani Gabi!",
						"La mulți ani Gabi!",
					],
					1505 : [
						"La mulți ani Laura!",
						"La mulți ani Laura!",
					],
					3005 : [
						"La mulți ani Dan!",
						"La mulți ani Dan!",
					],
					0708 : [
						"La mulți ani Mariana!",
						"La mulți ani Mariana!",
					],
					2710 : [
						"La mulți ani Vali!",
						"La mulți ani Vali!",
					],
					0112 : [
						"La mulți ani România!",
						"La mulți ani România!",
					],
					2512 : [
						"Crăciun fericit!",
						"Sărbători fericite!",
						"Crăciun fericit!",
						"Sărbători fericite!",
					],
					2612 : [
						"Crăciun fericit!",
						"Sărbători fericite!",
						"Crăciun fericit!",
						"Sărbători fericite!",
					],
					0102 : [
						"La mulți ani! " + moment().format('YYYY'),
						"Un An Nou fericit!",
						"La mulți ani! " + moment().format('YYYY'),
						"Un An Nou fericit!",
					],
					0102 : [
						"La mulți ani! " + moment().format('YYYY'),
						"Un An Nou fericit!",
						"La mulți ani! " + moment().format('YYYY'),
						"Un An Nou fericit!",
					],
					1402 : [
						"Happy Valentine's Day!",
						"Happy Valentine's Day!",
					],
				},
		updateInterval: 30000,
		remoteFile: null,
		fadeSpeed: 4000,
		sleepStartTime: 2,
		sleepEndTime: 5,
		morningStartTime: 5,
		morningEndTime: 12,
		noonStartTime: 12,
		noonEndTime: 15,
		afternoonStartTime: 15,
		afternoonEndTime: 18,
		eveningStartTime: 18,
		eveningEndTime: 23,
		random: true,
		classes: "thin large pre-line ",
	},

	currentWeatherType: "weather",

	getScripts: function() {
		return ["moment.js"];
	},
	start: function() {
		Log.info("Starting module: " + this.name);
		this.lastComplimentIndex = -1;
		var self = this;
		if (this.config.remoteFile !== null) {
			this.complimentFile(function(response) {
				self.config.compliments = JSON.parse(response);
				self.updateDom();
			});
		}
		setInterval(function() {
			self.updateDom(self.config.fadeSpeed);
		}, this.config.updateInterval);
	},
	randomIndex: function(compliments) {
		if (compliments.length === 1) {
			return 0;
		}
		var generate = function() {
			return Math.floor(Math.random() * compliments.length);
		};
		var complimentIndex = generate();
		while (complimentIndex === this.lastComplimentIndex) {
			complimentIndex = generate();
		}
		this.lastComplimentIndex = complimentIndex;
		return complimentIndex;
	},
	complimentArray: function() {
		var hour = moment().hour();
		var date = moment().format('DDMM');
		var compliments;
		if (hour >= this.config.sleepStartTime && hour < this.config.sleepEndTime && this.config.compliments.sleep) {
			compliments = this.config.compliments.sleep.slice(0);
		} else if (hour >= this.config.morningStartTime && hour < this.config.morningEndTime && this.config.compliments.morning) {
			compliments = this.config.compliments.morning.slice(0);
		} else if (hour >= this.config.noonStartTime && hour < this.config.noonEndTime && this.config.compliments.noon) {
			compliments = this.config.compliments.noon.slice(0);
		} else if (hour >= this.config.afternoonStartTime && hour < this.config.afternoonEndTime && this.config.compliments.afternoon) {
			compliments = this.config.compliments.afternoon.slice(0);
		} else if (hour >= this.config.eveningStartTime && hour < this.config.eveningEndTime && this.config.compliments.evening) {
			compliments = this.config.compliments.evening.slice(0);
		} else if(this.config.compliments.hasOwnProperty("night")) {
			compliments = this.config.compliments.night.slice(0);
		}
		if (typeof compliments === "undefined") {
			compliments = new Array();
		}
		if (this.currentWeatherType in this.config.compliments) {
			compliments.push.apply(compliments, this.config.compliments[this.currentWeatherType]);
		}
		if (date in this.config.compliments) {
			compliments.push.apply(compliments, this.config.compliments[date]);
		}
		compliments.push.apply(compliments, this.config.compliments.anytime);
		return compliments;
	},
	complimentFile: function(callback) {
		var xobj = new XMLHttpRequest(),
			isRemote = this.config.remoteFile.indexOf("http://") === 0 || this.config.remoteFile.indexOf("https://") === 0,
			path = isRemote ? this.config.remoteFile : this.file(this.config.remoteFile);
		xobj.overrideMimeType("application/json");
		xobj.open("GET", path, true);
		xobj.onreadystatechange = function() {
			if (xobj.readyState === 4 && xobj.status === 200) {
				callback(xobj.responseText);
			}
		};
		xobj.send(null);
	},
	randomCompliment: function() {
		var compliments = this.complimentArray();
		var index=0;
		if(this.config.random){
			index = this.randomIndex(compliments);
		}
		else{
			index = (this.lastIndexUsed >= (compliments.length-1))?0: ++this.lastIndexUsed;
		}
		return compliments[index];
	},
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = this.config.classes;
		var complimentText = this.randomCompliment();
		var parts= complimentText.split('\n');
		var compliment=document.createElement('span');
		for (part of parts){
			compliment.appendChild(document.createTextNode(part));
			compliment.appendChild(document.createElement('BR'));
		}
		compliment.lastElementChild.remove();
		wrapper.appendChild(compliment);
		return wrapper;
	},
	setCurrentWeatherType: function(data) {
		var weatherIconTable = {
			"01d": "day_sunny",
			"02d": "day_cloudy",
			"03d": "cloudy",
			"04d": "cloudy_windy",
			"09d": "showers",
			"10d": "rain",
			"11d": "thunderstorm",
			"13d": "snow",
			"50d": "fog",
			"01n": "night_clear",
			"02n": "night_cloudy",
			"03n": "night_cloudy",
			"04n": "night_cloudy",
			"09n": "night_showers",
			"10n": "night_rain",
			"11n": "night_thunderstorm",
			"13n": "night_snow",
			"50n": "night_alt_cloudy_windy"
		};
		this.currentWeatherType = weatherIconTable[data.weather[0].icon];
	},
	notificationReceived: function(notification, payload, sender) {
		if (notification === "Weather data") {
			this.setCurrentWeatherType(payload.data);
		}
	},
});