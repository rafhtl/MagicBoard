Module.register("calendar", {

		defaults: {
					url: "modules/calendar/calendar.html",
					width: "340px",
					height: "500px",
					cssClass: "ical",
		},

	start: function() {
        Log.info("Starting module: " + this.name);
	},

	getStyles: function() {
		return ['calendar.css'];
	},
	
	getScripts: function() {
		return [];
	},
	
	getDom: function() {
		var iframe = document.createElement("iframe");
		iframe.style = "border:0";
		iframe.name = "iframe";
		iframe.className = this.config.cssClass;
		iframe.width = this.config.width;
		iframe.height = this.config.height;
		iframe.src =  this.config.url;
		return iframe;
	}
});