Module.register("rssnews", {

		defaults: {
					url: "modules/rssnews/rssnews.html",
					width: "100%",
					height: "150px",
					cssClass: "rssnews",
		},

	start: function() {
        Log.info("Starting module: " + this.name);
	},

	getStyles: function() {
		return ['rssnews.css'];
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
	},
});