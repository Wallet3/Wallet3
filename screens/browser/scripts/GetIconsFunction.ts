export default `function getIcons() {
    var links = document.getElementsByTagName('link');
    var icons = [];

    for(var i = 0; i < links.length; i++) {
        var link = links[i];

        //Technically it could be null / undefined if someone didn't set it!
        //People do weird things when building pages!
        var rel = link.getAttribute('rel');
        if(rel) {
            //I don't know why people don't use indexOf more often
            //It is faster than regex for simple stuff like this
            //Lowercase comparison for safety
            if(rel.toLowerCase().indexOf('icon') > -1) {
                var href = link.getAttribute('href');

                //Make sure href is not null / undefined            
                if(href) {
                    //Relative
                    //Lowercase comparison in case some idiot decides to put the 
                    //https or http in caps
                    //Also check for absolute url with no protocol
                    if(href.toLowerCase().indexOf('https:') == -1 && href.toLowerCase().indexOf('http:') == -1
                        && href.indexOf('//') != 0) {

                        //This is of course assuming the script is executing in the browser
                        //Node.js is a different story! As I would be using cheerio.js for parsing the html instead of document.
                        //Also you would use the response.headers object for Node.js below.

                        var absoluteHref = window.location.protocol + '//' + window.location.host;

                        if(window.location.port) {
                            absoluteHref += ':' + window.location.port;
                        }

                        //We already have a forward slash
                        //On the front of the href
                        if(href.indexOf('/') == 0) {
                            absoluteHref += href;
                        }
                        //We don't have a forward slash
                        //It is really relative!
                        else {
                            var path = window.location.pathname.split('/');
                            path.pop();
                            var finalPath = path.join('/');

                            absoluteHref += finalPath + '/' + href;
                        }

                        icons.push(absoluteHref);
                    }
                    //Absolute url with no protocol
                    else if(href.indexOf('//') == 0) {
                        var absoluteUrl = window.location.protocol + href;

                        icons.push(absoluteUrl);
                    }
                    //Absolute
                    else {
                        icons.push(href);
                    }
                }
            }
        }
    }

    return icons.sort((a1, a2) => a2.length - a1.length).filter(i => i.startsWith('http') && !i.endsWith('.svg'))[0] || '';
}`;
