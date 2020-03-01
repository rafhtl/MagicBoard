Module.register('connection', {
	defaults: {
        updateInterval: 1000,
		initialLoadDelay: 0,
		animationSpeed: 1000 * 0.25,
	},
	
	getStyles: function() {
		return ["connection.css"];
	},

	start: function() {
        Log.info("Starting module: " + this.name);
		this.loop();
	},

	getDom: function() {
		var wrapper = document.createElement('div');
		if (window.navigator.onLine) {
			wrapper.className = 'smart small light normal';
			wrapper.innerHTML = "Modular Smart Mirror Platform";
		} else {
			wrapper.className = 'smart small regular red ';
			wrapper.innerHTML = "Fără conexiune la Internet";
		}
		return wrapper;
	},

	loop: function() {
        var self = this;
		setTimeout(function() {
			setInterval(function() {
				self.updateDom(self.config.animationSpeed);
			}, self.config.updateInterval); // Loop interval
		}, self.config.initialLoadDelay); // First delay
	}
});