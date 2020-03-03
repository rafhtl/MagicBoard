Module.register("compliments", {
	defaults: {
				compliments: {
					anytime : [
						"Hello sexy thing!",
					],
					sleep : [
						"Why you don't sleep?",
					],
					morning : [
						"Good morning",
					],
					noon : [
						"Hava a good day",
					],
					afternoon : [
						"Good afternoon",
					],
					evening : [
						"Good evening",
					],
					night : [
						"Good night",
					],
					day_sunny : [
						"Sunny",
					],
					day_cloudy : [
						"Cloudy",
					],
					cloudy : [
						"Cloudy",
					],
					cloudy_windy : [
						"Cloudy windy",
					],
					shower : [
						"Rain shower",
					],
					rain : [
//						"Rain",
					],
					tunderstorm : [
						"Thunderstorm",
					],
					snow : [
						"Snow",
					],
					fog : [
						"Fog",
					],
					night_clear : [
						"Clear night",
					],
					night_cloudy : [
					        "Night cludy",
					],
					night_showers : [
					        "Night showers",
					],
					night_rain : [
					        "Raining night",
					],
					night_thunderstorm : [
					        "Thunderstorm night",
					],
					night_snow : [
					        "Snowing night",
					],
					night_alt_cloudy_windy : [
					        "Night clouds and wind",
					], 
                                        2512 : [
					        "Marry Christmas",
					],
                                        0101 : [
					        "Happy New year!",
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
