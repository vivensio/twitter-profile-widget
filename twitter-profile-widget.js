/*! twitter-profile-widget v0.1.1 
    License: MIT
    @vivensio
*/

var TwitterProfileWidget = TwitterProfileWidget = TwitterProfileWidget || {};
window.TPW_TWITTER_URL = 'http://www.twitter.com/';

TwitterProfileWidget.methods = (function () {
  var widgetID = '',
      ERROR = 'Something went wrong. Please try again later.';

  var initListener = function (fn) {
    if (document.readyState != 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };
  var fetchTwitterUser = function (username, widgetId) {
    var queryUrl = (document.location.protocol === "https:" ? "https" : "http") + "://query.yahooapis.com/v1/public/yql?q=select * from html where url='http://twitter.com/"+ username +"'&format=json";

    getJSON(queryUrl, function (data) {
      widgetID = widgetId;
      if (!isValid(data.query.results)) return;
      var calculated = doLaundry(data),
          parsed = JSON.parse(data.query.results.body.input[0].value),
          user = parsed.profile_user,
          description = Prettify().init(data, user.description);
      var profile = TwitterUser(user.profile_banner_url, user.profile_image_url, user.name, user.verified, user.screen_name, description, user.location, user.url, calculated.tweets, calculated.followers, calculated.following, calculated.urlText);
      renderTwitterUser(profile);
    });
  };
  var appendStyles = function () {
    var style = document.createElement('style');
    style.innerHTML = '.twitter-profile-widget,.twitter-profile-widget *{margin:0;padding:0;box-sizing:border-box}.twitter-profile-widget{font-size:16px;max-width:300px;position:relative;color:#292f33}.tpw-error{background:#6495ed;display:none;color:#fff;min-height:12em;padding:50px 20px;width:300px;text-align:center}.tpw-loader{z-index:1;transition:all .5s ease-in-out;min-height:12em}.tpw-loader.tpw-loaded{z-index:-1;opacity:0;display:none}.tpw-loader.tpw-loaded~.tpw-container{opacity:1}.tpw-loader .tpw-loader--inner{display:block;position:absolute;top:45%;left:49%;width:10px;height:10px;border-radius:50%;background-color:#fff;animation:a .6s linear infinite alternate-reverse}@keyframes a{0%{background-color:#fff;transform:scale(.1)}50%{transform:scale(1.1)}to{background-color:#6495ed;transform:scale(2)}}.tpw-container{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica Neue,sans-serif;font-size:16px;opacity:0;transition:all .3s linear;transition-delay:.4s}.tpw-container,.tpw-container *{background-color:#fff}.tpw-container .tpw-banner{background-size:cover;background-color:#63aeee;height:6em}.tpw-container .tpw-content{background-color:#fff;border:1px solid #e1e8ed;border-top:0}.tpw-container .tpw-body{padding-top:.4em;font-size:.5em}.tpw-container .tpw-body>.tpw-link{padding-right:.2em;margin:0 .2em .4em 0;float:left;width:25%}.tpw-container .tpw-body>.tpw-link .tpw-avatar-wrap{margin-top:6em;display:block;position:relative}.tpw-container .tpw-body>.tpw-link .tpw-avatar-wrap .tpw-avatar{border:2px solid #fff;border-radius:.4em;position:absolute;bottom:0;margin:0 0 -2px 5px;width:75px}.tpw-container .tpw-names{overflow:hidden;text-align:left;word-wrap:break-word;margin-left:2em;display:inline-block}.tpw-container .tpw-names .tpw-name-wrap{font-size:2em;color:initial}.tpw-container .tpw-names .tpw-name-wrap .tpw-verified-wrap{height:1.25em;display:inline-block;vertical-align:text-bottom}.tpw-container .tpw-names .tpw-name-wrap .tpw-verified-wrap .tpw-verified-svg{height:100%;fill:#77c7f7}.tpw-container .tpw-names .tpw-username{color:#aab8c2;direction:ltr;margin-top:.1rem;font-size:1.7em}.tpw-container .tpw-details{padding:0 .6em;margin-top:2.5em}.tpw-container .tpw-details .tpw-description{margin-bottom:.5em;word-wrap:break-word;font-size:1.5em}.tpw-container .tpw-details .tpw-description .tpw-description-link{color:#1b95e0;text-decoration:none}.tpw-container .tpw-details .tpw-location{max-width:100%;display:inline-block;font-size:1.4em;font-weight:700}.tpw-container .tpw-details .tpw-middot{display:inline-block;max-width:100%;text-align:center;width:1.2em}.tpw-container .tpw-details .tpw-url{color:#3b94d9;text-decoration:none;display:inline-block;max-width:100%;font-size:1.5em}.tpw-container .tpw-stats{width:100%;margin-top:1em;padding-bottom:1em}.tpw-container .tpw-stats .tpw-stat-wrap{width:32.5%;padding:1em 2em 0 1em;display:inline-block}.tpw-container .tpw-stats .tpw-stat-wrap span{display:block}.tpw-container .tpw-stats .tpw-stat-wrap .tpw-stat-title{font-size:1.4em;text-transform:uppercase;color:#657787}.tpw-container .tpw-stats .tpw-stat-wrap .tpw-stat-number{font-size:2em;color:#14171a;margin-top:.1em}';
    
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
    var markup = '<div class="tpw-banner"></div><div class="tpw-content"><div class="tpw-body"><a class="tpw-link" target="_blank"><span class="tpw-avatar-wrap"><img class="tpw-avatar"></span></a><div class="tpw-names"><h1 class="tpw-name-wrap"><a class="tpw-name"></a> <span class="tpw-verified-wrap" title="Verified account"><svg viewBox="0 0 60 72" class="tpw-verified-svg"><path d="M3 37.288c0 3.84 2.013 7.193 4.993 8.96-.052.435-.083.874-.083 1.323 0 5.683 4.392 10.284 9.818 10.284 1.207 0 2.368-.218 3.434-.638C22.758 60.644 26.115 63 30 63c3.887 0 7.246-2.356 8.837-5.784 1.068.42 2.224.638 3.436.638 5.423 0 9.818-4.6 9.818-10.283 0-.448-.034-.886-.085-1.322C54.982 44.48 57 41.128 57 37.288c0-4.07-2.25-7.59-5.52-9.26.396-1.12.612-2.328.612-3.598 0-5.683-4.394-10.283-9.818-10.283-1.212 0-2.368.216-3.436.64C37.246 11.357 33.888 9 30 9c-3.885 0-7.242 2.357-8.837 5.787-1.066-.424-2.228-.64-3.434-.64-5.426 0-9.82 4.6-9.82 10.283 0 1.27.216 2.478.612 3.598-3.27 1.67-5.52 5.19-5.52 9.26z"/><path fill="#fff" d="M16.846 38.93l6.53 6.498c.545.542 1.258.813 1.97.813.717 0 1.434-.274 1.98-.822.32-.322 14.878-14.872 14.878-14.872 1.09-1.09 1.09-2.86 0-3.95-1.09-1.09-2.858-1.09-3.95 0L25.342 39.5l-4.554-4.532c-1.093-1.087-2.862-1.084-3.95.01-1.088 1.093-1.084 2.862.01 3.95z"/></svg></span></h1><div class="tpw-username"></div></div><div class="tpw-details"><p class="tpw-description" dir="ltr"></p><div class="tpw-location"></div><span class="tpw-middot">·</span> <a class="tpw-url" dir="ltr" target="_blank"></a></div><div class="tpw-stats"><div class="tpw-stat-wrap"><span class="tpw-stat-title">Tweets</span> <span class="tpw-stat-number tpw-tweets"></span></div><div class="tpw-stat-wrap"><span class="tpw-stat-title">Following</span> <span class="tpw-stat-number tpw-friends"></span></div><div class="tpw-stat-wrap"><span class="tpw-stat-title">Followers</span> <span class="tpw-stat-number tpw-followers"></span></div></div></div></div>';

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
  }

  initListener(init);

  return {
      fetchTwitterUser: fetchTwitterUser
  };

})();

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
      return TPW_TWITTER_URL + this.username;
    },
    getUsernameText: function () {
      return '@' + this.username;
    }
  }
};

var Prettify = function () {
  var descUrls = null,
    description = null;

  var init = function (data, desc) {
    descUrls = data.query.results.body.div[0].div[1].div.div[1].div.div.div[0].div.div.div.div[0].p;
    description = desc;

    Urls(descUrls);
    Hashtags();
    Handles();

    return description;
  }
  var Urls = function (descUrls) {
    var urls = [],
      urlCount = 0;
    
    if (!descUrls.a) urlCount = 0;
    else if (Object.prototype.toString.call(descUrls.a) === '[object Array]') urlCount = '2';
    else urlCount = 1;

    if (urlCount == 1) {
      if (descUrls.a["data-expanded-url"]) urls.push(descUrls.a);
    } else if (urlCount > 1) {
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
      
  }
  var Handles = function () {
    var isHandle = false,
      handleRegex = /^[_]?\w{1,14}$/,
      handle = '',
      prettyDescription = '';

    for (var i = 0; i < description.length; i++) {
      var char = description[i]
      if (char == '@' || isHandle) {
        isHandle = true; 
        if (char == '@') prettyDescription += '<a class="tpw-description-link" target="_blank" href="' + TPW_TWITTER_URL;

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

    description = prettyDescription;
  };
  var Hashtags = function () {
    var isHashtag = false,
        handleRegex = /^\w+$/,
        hashtag = '',
        prettyDescription = '';

    for (var i = 0; i < description.length; i++) {
      var char = description[i]
      if (char == '#' || isHashtag) {
        isHashtag = true; 
        if (char == '#') prettyDescription += '<a class="tpw-description-link" target="_blank" href="' + TPW_TWITTER_URL + 'hashtag/';

        if (i == description.length - 1) {
          hashtag += char;
          prettyDescription += char;
          prettyDescription += '">'+ hashtag + '</a>';
          break;
        }

        if (!handleRegex.test(char) && char != '#') {
          prettyDescription += '">'+ hashtag + '</a>' + char;
          isHashtag = false;
          hashtag = '';
        }

        if (isHashtag) {
          if (char != '#') prettyDescription += char;
          hashtag += char;
        }

      }
      else prettyDescription += char;
    }

    description = prettyDescription;
  }

  return {
    init: init
  }
}
