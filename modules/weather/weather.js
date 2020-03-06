Module.register("weather",{
	defaults: {
		location: config.location,
		locationID: config.locationID,
		appid: config.appid,
		units: config.units,
		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: 1000,
		timeFormat: config.timeFormat,
		showPeriod: false,
		showPeriodUpper: false,
		showWindDirection: true,
		showWindDirectionAsArrow: false,
		useBeaufort: false,
		useKMPHwind: true,
		lang: config.language,
		decimalSymbol: config.decimal,
		showHumidity: true,
		degreeLabel: true,
		showFeelsLike: true,
		showSunrise: false,
		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: 2500,
		apiVersion: "2.5",
		apiBase: "https://api.openweathermap.org/data/",
		weatherEndpoint: "weather",
		appendLocationNameToHeader: false,
		calendarClass: "calendar",
		tableClass: "large",
		onlyTemp: false,
		roundTemp: false,

		iconTable: {
			"01d": "wi-day-sunny",
			"02d": "wi-day-cloudy",
			"03d": "wi-cloudy",
			"04d": "wi-cloudy-windy",
			"09d": "wi-showers",
			"10d": "wi-rain",
			"11d": "wi-thunderstorm",
			"13d": "wi-snow",
			"50d": "wi-fog",
			"01n": "wi-night-clear",
			"02n": "wi-night-cloudy",
			"03n": "wi-night-cloudy",
			"04n": "wi-night-cloudy",
			"09n": "wi-night-showers",
			"10n": "wi-night-rain",
			"11n": "wi-night-thunderstorm",
			"13n": "wi-night-snow",
			"50n": "wi-night-alt-cloudy-windy"
		},
	},

	firstEvent: true,
	fetchedLocationName: config.location,

	getScripts: function() {
		return ["moment.js"];
	},

	getStyles: function() {
		return ["weather-icons.css", "weather.css"];
	},

	start: function() {
		Log.info("Starting module: " + this.name);
		moment.locale(config.language);
		this.windSpeed = null;
		this.windDirection = null;
		this.windDeg = null;
		this.sunriseSunsetTime = null;
		this.sunriseSunsetIcon = null;
		this.temperature = null;
		this.minTemp = null;
		this.maxTemp = null;
		this.weatherType = null;
		this.feelsLike = null;
		this.desc = null;	 								// weather description.
		this.pressure = null;	 							// main pressure.
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);
	},

	addExtraInfoWeather: function(wrapper) {
		var small = document.createElement("div");
		small.className = "normal medium wis";

		var windIcon = document.createElement("span");
		windIcon.className = "wi wi-strong-wind dimmed";
		small.appendChild(windIcon);

		var windSpeed = document.createElement("span");
		windSpeed.className = "wisw";
		windSpeed.innerHTML = " " + this.windSpeed + "<sub> km/h</sub> ";
		small.appendChild(windSpeed);
		if (this.config.showWindDirection) {
			var windDirection = document.createElement("sup");
			if (this.config.showWindDirectionAsArrow) {
				if(this.windDeg !== null) {
					windDirection.className = "wiswd";
					windDirection.innerHTML = "<i class='fa fa-long-arrow-down' style='transform:rotate("+this.windDeg+"deg);'></i> ";
				}
			} else {
				windDirection.className = "wiswd";
				windDirection.innerHTML = this.windDirection + " &nbsp;";
			}
			small.appendChild(windDirection);
		}

		var pressure = document.createElement("span"); 			// main pressure.
		pressure.className = "pressure";
		pressure.innerHTML = "<i class='wi wi-thermometer'></i> " + Math.round(this.pressure * 750.062 / 1000) + "<sup>mm</sup><sub>Hg</sub> ";
		small.appendChild(pressure);
		if (this.config.showHumidity) {
			var humidityIcon = document.createElement("span");
			humidityIcon.className = "wi wi-humidity humidityIcon";
			humidityIcon.innerHTML = " ";
			
			var spacer = document.createElement("sup");
			spacer.innerHTML = "&nbsp;";

			var humidity = document.createElement("span");
			humidity.className = "wish";
			humidity.innerHTML = this.humidity + " ";
    		small.appendChild(humidityIcon);
			small.appendChild(spacer);
    		small.appendChild(humidity);
		}

		if (this.config.showSunrise) {
    		var sunriseSunsetIcon = document.createElement("span");
    		sunriseSunsetIcon.className = "wi dimmed " + this.sunriseSunsetIcon;
    		small.appendChild(sunriseSunsetIcon);
    
    		var sunriseSunsetTime = document.createElement("span");
    		sunriseSunsetTime.className = "wiss";
    		sunriseSunsetTime.innerHTML = "" + this.sunriseSunsetTime;
    		small.appendChild(sunriseSunsetTime);
        }
		wrapper.appendChild(small);
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = this.config.tableClass;
		if (this.config.appid === "") {
			wrapper.innerHTML = "Please set the correct openweather <i>appid</i> in the config for module: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		if (this.config.onlyTemp === false) {
			this.addExtraInfoWeather(wrapper);
		}

		var large = document.createElement("div");
		large.className = "light";
		var weatherIcon = document.createElement("span");
		weatherIcon.className = "wi weathericon " + this.weatherType;
		large.appendChild(weatherIcon);

		var degreeLabel = "";
		if (this.config.units === "metric" || this.config.units === "imperial") {
			degreeLabel += "&deg;";
		}
		if(this.config.degreeLabel) {
			switch(this.config.units) {
			case "metric":
				degreeLabel += "C";
				break;
			case "imperial":
				degreeLabel += "F";
				break;
			case "default":
				degreeLabel += "K";
				break;
			}
		}
		if (this.config.decimalSymbol === "") {
			this.config.decimalSymbol = ".";
		}

		var temperature = document.createElement("span");
		temperature.className = "bright light";
		temperature.innerHTML = " " + this.temperature.replace(".", this.config.decimalSymbol) + "&deg;<span class='deg shade'>C</span>";
		large.appendChild(temperature);
		wrapper.appendChild(large);
		
		if (this.config.showFeelsLike && this.config.onlyTemp === false){
			var small = document.createElement("div");
			small.className = "normal small rfd";

			var description = document.createElement("span"); 		// weather description.
			description.className = "dimmed descr";
			description.innerHTML = "Now: " + this.desc + ", ";
			small.appendChild(description);

		    var maxTemp = document.createElement("span"); 			// max temperature.
    		maxTemp.className = "maxTemp mmx";
//    		maxTemp.innerHTML = "<br><span class='minMax'>Max:</span> " + this.maxTemp.toFixed(1).replace(".", this.config.decimalSymbol) + degreeLabel;
    		small.appendChild(maxTemp);
    		
    		var minTemp = document.createElement("span"); 			// min temperature.
    		minTemp.className = "minTemp mmx";
//    		minTemp.innerHTML = "<span class='minMax'> Min:</span> " + this.minTemp.toFixed(1).replace(".", this.config.decimalSymbol) + degreeLabel;
    		small.appendChild(minTemp);
    		
			var feelsLike = document.createElement("span");
/*			if (this.feelsLike >= 45) {
				feelsLike.className = "real darkred";
			} else if (this.feelsLike >= 40 && this.feelsLike < 45) {
				feelsLike.className = "real orangered";
			} else if (this.feelsLike >= 35 && this.feelsLike < 40) {
				feelsLike.className = "real tomato";
			} else if (this.feelsLike >= 30 && this.feelsLike < 35) {
				feelsLike.className = "real coral";
			} else if (this.feelsLike >= 25 && this.feelsLike < 30) {
				feelsLike.className = "real darkorange";
			} else if (this.feelsLike >= 20 && this.feelsLike < 25) {
				feelsLike.className = "real gold";
			} else if (this.feelsLike >= 15 && this.feelsLike < 20) {
				feelsLike.className = "real yellow";
			} else if (this.feelsLike >= 10 && this.feelsLike < 15) {
				feelsLike.className = "real greenyellow";
			} else if (this.feelsLike >= 5 && this.feelsLike < 10) {
				feelsLike.className = "real chartreuse";
			} else if (this.feelsLike >= 0 && this.feelsLike < 5) {
				feelsLike.className = "real lawngreen";
			} else if (this.feelsLike >= -5 && this.feelsLike < 0) {
				feelsLike.className = "real lime";
			} else if (this.feelsLike >= -10 && this.feelsLike < -5) {
				feelsLike.className = "real powderblue";
			} else if (this.feelsLike >= -15 && this.feelsLike < -10) {
				feelsLike.className = "real lightblue";
			} else if (this.feelsLike >= -20 && this.feelsLike < -15) {
				feelsLike.className = "real skyblue";
			} else if (this.feelsLike >= -25 && this.feelsLike < -20) {
				feelsLike.className = "real lightskyblue";
			} else if (this.feelsLike >= -30 && this.feelsLike < -25) {
				feelsLike.className = "real deepskyblue";
			} else if (this.feelsLike < 30) {
				feelsLike.className = "real dodgerblue";
			} else {
*/				feelsLike.className = "dimmed real";
//			}
			feelsLike.innerHTML = "Real: " + this.feelsLike + degreeLabel;
			small.appendChild(feelsLike);
			wrapper.appendChild(small);
		}
		return wrapper;
	},

	getHeader: function() {
		if (this.config.appendLocationNameToHeader && this.data.header !== undefined) {
			return this.data.header + " " + this.fetchedLocationName;
		}
		if (this.config.useLocationAsHeader && this.config.location !== false) {
			return this.config.location;
		}
		return this.data.header;
	},

	notificationReceived: function(notification, payload, sender) {
		if (notification === "Document Object Model created") {
			if (this.config.appendLocationNameToHeader) {
				this.hide(0, {lockString: this.identifier});
			}
		}
	},

	updateWeather: function() {
		if (this.config.appid === "") {
			Log.error("CurrentWeather: APPID not set!");
			return;
		}
		var url = this.config.apiBase + this.config.apiVersion + "/" + this.config.weatherEndpoint + this.getParams();
		var self = this;
		var retry = true;
		var weatherRequest = new XMLHttpRequest();
		weatherRequest.open("GET", url, true);
		weatherRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processWeather(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					Log.error(self.name + ": Incorrect APPID.");
					retry = true;
				} else {
					Log.error(self.name + ": Could not load weather.");
				}
				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		weatherRequest.send();
	},

	getParams: function() {
		var params = "?";
		if(this.config.locationID) {
			params += "id=" + this.config.locationID;
		} else if(this.config.location) {
			params += "q=" + this.config.location;
		} else if (this.firstEvent && this.firstEvent.geo) {
			params += "lat=" + this.firstEvent.geo.lat + "&lon=" + this.firstEvent.geo.lon;
		} else if (this.firstEvent && this.firstEvent.location) {
			params += "q=" + this.firstEvent.location;
		} else {
			this.hide(this.config.animationSpeed, {lockString:this.identifier});
			return;
		}
		params += "&units=" + this.config.units;
		params += "&lang=" + this.config.lang;
		params += "&APPID=" + this.config.appid;
		return params;
	},

	processWeather: function(data) {
		if (!data || !data.main || typeof data.main.temp === "undefined") {
			return;
		}
		this.humidity = parseFloat(data.main.humidity);
		this.temperature = this.roundValue(data.main.temp);
		this.fetchedLocationName = data.name;
		this.feelsLike = 0;
		this.desc = data.weather[0].description;				 // weather description.
		this.pressure = data.main.pressure;						 // main pressure.
		this.minTemp = data.main.temp_min;				 // min temperature.
		this.maxTemp = data.main.temp_max;				 // max temperature.
		if (this.config.useBeaufort){
			this.windSpeed = this.ms2Beaufort(this.roundValue(data.wind.speed));
		} else if (this.config.useKMPHwind) {
			this.windSpeed = parseFloat((data.wind.speed * 60 * 60) / 1000).toFixed(0);
		} else {
			this.windSpeed = parseFloat(data.wind.speed).toFixed(0);
		}
		var windInMph = parseFloat(data.wind.speed * 2.23694);
		var tempInF = 0;
		switch (this.config.units){
		case "metric": tempInF = 1.8 * this.temperature + 32;
			break;
		case "imperial": tempInF = this.temperature;
			break;
		case "default":
			var tc = this.temperature - 273.15;
			tempInF = 1.8 * tc + 32;
			break;
		}
		if (windInMph > 3 && tempInF < 50){
			var windChillInF = Math.round(35.74+0.6215*tempInF-35.75*Math.pow(windInMph,0.16)+0.4275*tempInF*Math.pow(windInMph,0.16));
			var windChillInC = (windChillInF - 32) * (5/9);
			switch (this.config.units){
			case "metric": this.feelsLike = windChillInC.toFixed(0);
				break;
			case "imperial": this.feelsLike = windChillInF.toFixed(0);
				break;
			case "default":
				var tc = windChillInC + 273.15;
				this.feelsLike = tc.toFixed(0);
				break;
			}
		} else if (tempInF > 80 && this.humidity > 40){
			var Hindex = -42.379 + 2.04901523*tempInF + 10.14333127*this.humidity - 0.22475541*tempInF*this.humidity - 6.83783*Math.pow(10,-3)*tempInF*tempInF - 5.481717*Math.pow(10,-2)*this.humidity*this.humidity + 1.22874*Math.pow(10,-3)*tempInF*tempInF*this.humidity + 8.5282*Math.pow(10,-4)*tempInF*this.humidity*this.humidity - 1.99*Math.pow(10,-6)*tempInF*tempInF*this.humidity*this.humidity;
			switch (this.config.units){
			case "metric": this.feelsLike = parseFloat((Hindex - 32) / 1.8).toFixed(0);
				break;
			case "imperial": this.feelsLike = Hindex.toFixed(0);
				break;
			case "default":
				var tc = parseFloat((Hindex - 32) / 1.8) + 273.15;
				this.feelsLike = tc.toFixed(0);
				break;
			}
		} else {
			this.feelsLike = parseFloat(this.temperature).toFixed(0);
		}
		this.windDirection = this.deg2Cardinal(data.wind.deg);
		this.windDeg = data.wind.deg;
		this.weatherType = this.config.iconTable[data.weather[0].icon];
		var now = new Date();
		var sunrise = new Date(data.sys.sunrise * 1000);
		var sunset = new Date(data.sys.sunset * 1000);
		var sunriseSunsetDateObject = (sunrise < now && sunset > now) ? sunset : sunrise;
		var timeString = moment(sunriseSunsetDateObject).format("HH:mm");
		if (this.config.timeFormat !== 24) {
			if (this.config.showPeriod) {
				if (this.config.showPeriodUpper) {
					timeString = moment(sunriseSunsetDateObject).format("h:mm A");
				} else {
					timeString = moment(sunriseSunsetDateObject).format("h:mm a");
				}
			} else {
				timeString = moment(sunriseSunsetDateObject).format("h:mm");
			}
		}
		this.sunriseSunsetTime = timeString;
		this.sunriseSunsetIcon = (sunrise < now && sunset > now) ? "wi-sunset" : "wi-sunrise";
		this.show(this.config.animationSpeed, {lockString:this.identifier});
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
		this.sendNotification("Weather data", {data: data});
	},

	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		var self = this;
		setTimeout(function() {
//		    Log.info("Weather updated.");
			self.updateWeather();
		}, nextLoad);
	},

	ms2Beaufort: function(ms) {
		var kmh = ms * 60 * 60 / 1000;
		var speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];
		for (var beaufort in speeds) {
			var speed = speeds[beaufort];
			if (speed > kmh) {
				return beaufort;
			}
		}
		return 12;
	},

	deg2Cardinal: function(deg) {
		if (deg>11.25 && deg<=33.75){
			return "NNE";
		} else if (deg > 33.75 && deg <= 56.25) {
			return "NE";
		} else if (deg > 56.25 && deg <= 78.75) {
			return "ENE";
		} else if (deg > 78.75 && deg <= 101.25) {
			return "E";
		} else if (deg > 101.25 && deg <= 123.75) {
			return "ESE";
		} else if (deg > 123.75 && deg <= 146.25) {
			return "SE";
		} else if (deg > 146.25 && deg <= 168.75) {
			return "SSE";
		} else if (deg > 168.75 && deg <= 191.25) {
			return "S";
		} else if (deg > 191.25 && deg <= 213.75) {
			return "SSW";
		} else if (deg > 213.75 && deg <= 236.25) {
			return "SW";
		} else if (deg > 236.25 && deg <= 258.75) {
			return "WSW";
		} else if (deg > 258.75 && deg <= 281.25) {
			return "W";
		} else if (deg > 281.25 && deg <= 303.75) {
			return "WNW";
		} else if (deg > 303.75 && deg <= 326.25) {
			return "NW";
		} else if (deg > 326.25 && deg <= 348.75) {
			return "NNW";
		} else {
			return "N";
		}
	},

	roundValue: function(temperature) {
		var decimals = this.config.roundTemp ? 0 : 1;
		return parseFloat(temperature).toFixed(decimals);
	}
});