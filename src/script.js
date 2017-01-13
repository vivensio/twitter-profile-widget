var TwitterProfileWidget = TwitterProfileWidget = TwitterProfileWidget || {};

TwitterProfileWidget.methods = (function () {
    var widgetID = '',
        TWITTER_URL = 'http://www.twitter.com/',
        ERROR = 'Something went wrong. Please try again later.';

    var initListener = function (fn) {
        if (document.readyState != 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    };
    var TwitterUser = function (banner, image, name, verified, username, description, location, url, tweets, followers, friends, urlText) {
        return {
            banner: banner,
            image: image,
            name: name,
            verified: verified,
            username: username,
            description: description,
            location: location,
            url: url,
            tweets: tweets,
            followers: followers,
            friends: friends,
            urlText: urlText,
            getImage: function () {
                var ext = this.image.split('.').pop();
                return this.image.slice(0, -(7 + ext.length) ) + '200x200.' + ext;  // changing to 200x200 image src
            },
            getBanner: function () {
                if (!this.banner) this.banner = '';
                return "url('"+ this.banner +"')";
            },
            getProfileLink: function () {
               return TWITTER_URL + this.username;
            },
            getUsernameText: function () {
                return '@' + this.username;
            }
        }
    };
    var fetchTwitterUser = function (username, widgetId) {
        var queryUrl = (document.location.protocol === "https:" ? "https" : "http") + "://query.yahooapis.com/v1/public/yql?q=select * from html where url='http://twitter.com/"+ username +"'&format=json";

        getJSON(queryUrl, function (data) {
            widgetID = widgetId;
            if (!isValid(data.query.results)) return;
            var calculated = doLaundry(data),
                parsed = JSON.parse(data.query.results.body.input[0].value),
                user = parsed.profile_user,
                description = parseDescription(data, user.description);
            var profile = TwitterUser(user.profile_banner_url, user.profile_image_url, user.name, user.verified, user.screen_name, description, user.location, user.url, calculated.tweets, calculated.followers, calculated.following, calculated.urlText);
            renderTwitterUser(profile);
        });
    };
    var appendStyles = function () {
         var style = document.createElement('style');
        style.innerHTML = 'SRC_STYLE';
        
        document.querySelector('body').appendChild(style);
    };
    var init = function () {
        appendStyles();
        var widgets = document.querySelectorAll('.twitter-profile-widget');
        for (var i = 0; i < widgets.length; i++) {
            var parentNode = widgets[i];
            var widgetId = 'twitter-profile-widget--' + i;
            parentNode.setAttribute('id', widgetId);
            widgetID = widgetId = '#' + widgetId;
            var username = parentNode.dataset.twitterUsername;
            document.querySelector(widgetId).innerHTML = '<div class="tpw-loader"><span class="tpw-loader--inner"></span></div><div class="tpw-error"></div><div class="tpw-container"></div>';
            
            if (!username) {
                ERROR = "No username provided.";
                displayError();
            } else fetchTwitterUser(username, widgetId);
        }
    };
    var getJSON = function (url, callback) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function() {
            if (request.status === 200) {
                callback(JSON.parse(request.responseText));
            }
        };
        request.send();
    };
    var isValid = function (value) {
        var isValid = true,
        t = value.body.div[0].div[1].div.div[1].div.div.div[0].div.div.div.div;
        if (!value) isValid = false;
        else if (t.h1) {
            if (t.h1.span.a.span.class.indexOf("protected") > -1) {
                ERROR = "It's a protected account. twitter-profile-widget only supports public accounts";
                isValid = false;
                displayError();
            }   
        }

        return isValid;
    };
    var displayError = function () {
        setProperty('innerHTML', 'error', ERROR);
        document.querySelector(widgetID + ' .tpw-error').style.display = 'block';
        document.querySelector(widgetID + ' .tpw-loader').classList.add('tpw-loaded');
    };
    var renderTwitterUser = function (profile) {
        var markup = 'SRC_MARKUP';

        document.querySelector(widgetID + ' .tpw-container').insertAdjacentHTML('beforeend', markup);
        document.querySelector(widgetID + ' .tpw-banner').style.backgroundImage = profile.getBanner();
        setProperty('src', 'avatar', profile.getImage());
        setProperty('href', 'link', profile.getProfileLink());
        setProperty('href', 'url', profile.url);
        setProperty('title', 'url', profile.url);
        setProperty('innerHTML', 'url', profile.urlText);
        setProperty('innerHTML', 'name', profile.name);
        setProperty('innerHTML', 'description', profile.description);
        setProperty('innerHTML', 'location', profile.location);
        setProperty('innerHTML', 'tweets', profile.tweets);
        setProperty('innerHTML', 'followers', profile.followers);
        setProperty('innerHTML', 'friends', profile.friends);
        setProperty('innerHTML', 'username', profile.getUsernameText());

        if (!profile.location) document.querySelector(widgetID + ' .tpw-middot').style.display = 'none';
        if (!profile.verified) document.querySelector(widgetID + ' .tpw-verified-wrap').style.display = 'none';

        document.querySelector(widgetID + ' .tpw-loader').classList.add('tpw-loaded');
    };
    var setProperty = function (prop, className, value) {
        document.querySelector(widgetID + ' .tpw-' + className)[prop] = value;
    };
    var doLaundry = function (data) {
        var profile = { 'tweets' : 0, 'followers': 0, 'following': 0 },
        shortNumbers = data.query.results.body.div[0].div[1].div.div[0].div.div[1].div.div.div[1].div.div.ul.li,
        urlWhere = data.query.results.body.div[0].div[1].div.div[1].div.div.div[0].div.div.div.div[0].div[1].span[1].a;
    
        for (var i = 0; i <shortNumbers.length; i++) {
            if (shortNumbers[i]["a"]) {
                var curr = shortNumbers[i]["a"];
                if (profile.hasOwnProperty(curr["data-nav"]))
                    profile[curr["data-nav"]] = curr["span"][1].content;
            }
        }
        
        profile.urlText = urlWhere ? urlWhere.content : '';

        return profile;
    };
    var parseDescription = function(data, description) {
        //BEWARE : codebarf ahead
        var descUrls = data.query.results.body.div[0].div[1].div.div[1].div.div.div[0].div.div.div.div[0].p;
        description = prettifyUrls(descUrls, description);

        return prettifyHandles(description);
    };
    var prettifyHandles = function (description) {
        var isHandle = false;
        var handleRegex = /^[_]?\w{1,14}$/;
        var handle = '';
        var prettyDescription = '';

        for (var i = 0; i < description.length; i++) {
            var char = description[i]
            if (char == '@' || isHandle) {
                isHandle = true; 
                if (char == '@') prettyDescription += '<a class="tpw-description-link" target="_blank" href="' + TWITTER_URL;

                if (i == description.length - 1) {
                    handle += char;
                    prettyDescription += char;
                    prettyDescription += '">'+ handle + '</a>';
                    break;
                }

                if (!handleRegex.test(char) && char != '@') {
                    prettyDescription += '">'+ handle + '</a>' + char;
                    isHandle = false;
                    handle = '';
                }

                if (isHandle) {
                    if (char != '@') prettyDescription += char;
                    handle += char;
                }

            }
            else prettyDescription += char;
        }

        return prettyDescription;
    };
    var prettifyUrls = function (descUrls, description) {
        var urls = [];
        var urlQuantity = 0;
        
        if (!descUrls.a) urlQuantity = 0;
        else if (Object.prototype.toString.call(descUrls.a) === '[object Array]') urlQuantity = '2';
        else urlQuantity = 1;

        if (urlQuantity == 1) {
            if (descUrls.a["data-expanded-url"]) urls.push(descUrls.a);
        } else if (urlQuantity > 1) {
            for (var i = 0; i < descUrls.a.length ; i++) {
                if (descUrls.a[i]["data-expanded-url"]) {
                    urls.push(descUrls.a[i]);
                }
            }
        }

        for (var i = 0; i < urls.length; i++) {
            var urlObj = urls[i];
            var which;

            // the link in description is sometimes a t.co link so we need to find the match.
            if (description.indexOf(urlObj["data-expanded-url"]) > -1) which = urlObj["data-expanded-url"]
            else if (description.indexOf(urlObj["href"]) > -1) which = urlObj["href"];
            else if (description.indexOf(urlObj["title"]) > -1 ) which = urlObj["title"];

            description = wrapUrl(which, urlObj);
        }

        function wrapUrl(str, urlObj) {
            var html = '<a class="tpw-description-link" target="_blank" href="' + urlObj["span"][0]["content"] + urlObj["span"][1]["content"] + '">';
            html += urlObj["span"][1]["content"];
            html += '</a>';
            return description.replace(str, html);
        }

        return description;
    }

    initListener(init);

    return {
        fetchTwitterUser: fetchTwitterUser
    };

})();