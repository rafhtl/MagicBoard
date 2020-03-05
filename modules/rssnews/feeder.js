var feedURLs = {
			    'Los Angeles Times'             : 'https://www.latimes.com/world-nation/rss2.0.xml#nt=1col-7030col1',
                'New York Times'                : 'http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml',
                'Washington Post'	            : 'http://feeds.washingtonpost.com/rss/national',
                'Mercury News'	                : 'https://www.mercurynews.com/feed',
                'Centers for Disease Control'	: 'https://tools.cdc.gov/api/v2/resources/media/403372.rss',
                'Johns Hopkins Medicine'	    : 'https://www.hopkinsmedicine.org/news/media/releases/?format=rss',
                'World Health Organization'	    : 'https://www.who.int/feeds/entity/csr/don/en/rss.xml',
                };
var feedMaxAge = {days: 0, hours: 12};
/*************** DO NOT EDIT BELOW THIS LINE ***************/
$.fn.updateWithTextForce = function(text, speed, force) {
	var dummy = $('<div/>').html(text);
	if (force || ($(this).html() != dummy.html())) {
		$(this).fadeOut(speed/2, function() {
			$(this).html(text);
			$(this).fadeIn(speed/2, function() {
			});
		});
	}
};
$.fn.updateWithText = function(text, speed) {
	var dummy = $('<div/>').html(text);
	if ($(this).html() != dummy.html())
	{
		$(this).fadeOut(speed/2, function() {
			$(this).html(text);
			$(this).fadeIn(speed/2, function() {
			});
		});
	}
};
if(typeof feedURLs == 'undefined'){
	if(typeof feed == 'undefined')
		var feedURLs;
	else
		var feedURLs = {"News" : feed};
}
var Log = (function() {
	return {
		info: Function.prototype.bind.call(console.info, console),
	};
})();
$(document).ready(function($){
	var news = [];
	var newsFeedIndex  = 0;
	var newsStoryIndex = 0;
	for(var key in feedURLs){
		news.push(new Array(0));
	}
	function fetchNews(){
		var cachebuster = new Date().getTime();
		var index       = 0;
		for(var key in feedURLs){
			var url = feedURLs[key] + "&_nocache=" + cachebuster;
			fetchNewsForURL(index++, "rssnews.php?url=" + encodeURI(url));
			Log.info("RSSfeed fetching.");
		}
		setTimeout(fetchNews, 600000);
	}
	fetchNews();
	function fetchNewsForURL(index, url)
   	{
   		$.get( url, function(rssData, textStatus){
   			var oldestDate = moment().subtract(feedMaxAge.days, "days").subtract(feedMaxAge.hours, "hours");
   			var stories = [];
   			$(rssData).find("item").each(function(){
   				addStoryForFeed(stories, oldestDate, $(this));
   			});
   			$(rssData).find("entry").each(function(){
   				addStoryForFeed(stories, oldestDate, $(this));
   			});
   			news[ index ] = stories;
   			var newsCountTotal = 0;
   			for(var i=0; i < news.length; i++){
   				newsCountTotal += news[i].length;
   			}
   			var rssinfo = newsCountTotal + ' stiri din ' + news.length + ' surse';
//          $('.RSS').updateWithText(rssinfo, 2000);
		});
	}
	function addStoryForFeed(stories, oldestDate, story){
		var pubDate = moment(story.find("pubDate").text(), "ddd, DD MMM YYYY HH:mm:ss Z");
		var title = story.find("title").text();
		var desc = story.find("description").text();
		var counter = '<span class="count">' + (title.length + desc.length) + '</span>';
		var update = '<span class="update">(' + counter + '/' + moment().format('HH:mm') + ')</span>';
		if(oldestDate.diff(pubDate) < 0){
		    stories.push(' &bull; ' + title + ' &bull; <span class="desc">' + desc + '</span>');
		}
	}
	(function showNews(){
		var initialFeed = newsFeedIndex;
		if(news.length == 0){
			return;
		}
		for(var i=0; i < news.length+1; i++){
			var newsFeed = news[newsFeedIndex];
			if(newsFeed === undefined)
				continue;
			if(newsFeed.length == 0){
				if(++newsFeedIndex == news.length)
					newsFeedIndex = 0;
				newsStoryIndex = 0;
				continue;
			}
			if(newsStoryIndex >= newsFeed.length){
				newsStoryIndex = 0;
				if(++newsFeedIndex >= news.length){
					newsFeedIndex = 0;
					continue;
				}
			}
		}
		if(news[newsFeedIndex].length == 0){
			setTimeout(showNews, 1000);
			return;
		}
		var i = 0;
		for(var key in feedURLs){
			if(i == newsFeedIndex)
				break;
			i++;
		}
		$('.source').updateWithTextForce('&nbsp;<i class="fa fa-rss-square"></i> ' + key, 2000, true);
		var newsFeed = news[newsFeedIndex];
		newsStory = newsFeed[newsStoryIndex];
		newsStoryIndex++;
		var subject = newsStory.length - 108;
//          $(".story").html(subject);
//        if ((subject >= 0) && (subject < 200)) {
//            $(".feed").css("font-size", "1.6rem");
//        } else
//        if ((subject >= 200) && (subject < 300)) {
//            $(".feed").css("font-size", "1.5rem");
//        } else
//        if ((subject >= 300) && (subject < 400)) {
            $(".feed").css("font-size", "1.4rem");
            $(".feed").css("line-height", "1.4rem");
//        } else
//        if ((subject >= 400) && (subject < 500)) {
//            $(".feed").css("font-size", "1.3rem");
//        } else {
//            $(".feed").css("font-size", "1.2rem");
//        }
    	var nextTimeout = 6000 + (newsStory.length * 100);
    	if( typeof newsStory != 'undefined'){
            Log.info("RSSfeed updated.");
			$('.news').updateWithText(newsStory, 2000);
		}
		setTimeout(showNews, nextTimeout);
		var dots = "";
		for(i=0; i < news.length; i++) {
			if(i == newsFeedIndex)
				dots += "";
			else
				dots += "";
		}
		dots += "";
		for(i=0; i < news[newsFeedIndex].length; i++) {
			if( i == newsStoryIndex)
				dots += "";
			else
				dots += "";
		}
		$('.dots').updateWithTextForce(dots, 2000, true);
	})();
});