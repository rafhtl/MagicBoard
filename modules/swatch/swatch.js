Module.register("swatch", {

	defaults: {
		text: '<img class="logo" src="css/swatch.svg"></img>&nbsp; <span class="beat"></span>&nbsp; <img class="logo" src="css/beat.svg"></img>',
	},
	
	start: function() {
        Log.info("Starting module: " + this.name);
	},
	
	getStyles: function() {
		return ["swatch.css"];
	},

	getDom: function() {
		function swatch(){
            var d=new Date();
            var h=d.getUTCHours()+1;
            var m=d.getUTCMinutes();
            var s=d.getUTCSeconds();
            var time='@'+('000'+Math.floor((h*3600+m*60+s)/86.4)%1000).slice(-3);
            $('.beat').html(time);
        } setInterval(swatch,864);
		var wrapper = document.createElement("div");
		wrapper.innerHTML = this.config.text;
		wrapper.className = "swatch";
		return wrapper;
	}
});