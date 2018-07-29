var id = 100;
var start = {};
var end = {};
var image;

function cropImage(url, callback) {
    var sourceImage = new Image();

    sourceImage.onload = function() {
        var canvas = document.createElement("canvas");
        canvas.width = sourceImage.width;
        canvas.height = sourceImage.height;
        var ctx = canvas.getContext("2d");
        ctx.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio);

        ctx.drawImage(sourceImage, 0, 0);
        var imageData = ctx.getImageData(start.x, start.y, end.x - start.x, end.y - start.y);

        /*
        console.log('start.x = ' + start.x);
        console.log('start.y = ' + start.y);
        console.log('end.x - start.x = ' + (end.x - start.x));
        console.log('end.y - start.y = ' + (end.y - start.y));
        */

        // create destination canvas
        var canvas1 = document.createElement("canvas");
        canvas1.width = end.x - start.x;
        canvas1.height = end.y - start.y;
        var ctx1 = canvas1.getContext("2d");
        ctx1.rect(0, 0, canvas1.width, canvas1.height);
        ctx1.fillStyle = 'white';
        ctx1.fill();
        ctx1.putImageData(imageData, 0, 0);

        //console.log();

        /*var link = document.createElement("a");
        link.setAttribute("href", canvas1.toDataURL("image/jpeg").replace(/^data:image\/(png|jpeg);base64,/, ""));
        link.setAttribute("download", "hack_image.jpg");
        link.click();*/

        callback(canvas1.toDataURL("image/jpeg").replace(/^data:image\/(png|jpeg);base64,/, ""));
        //callback(canvas1.toDataURL("image/jpeg"));
    }
    sourceImage.src = url;
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    //console.log(msg.x, msg.y);
    switch (msg.event) {
        case 'mousedown': {
            start.x = msg.x;
            start.y = msg.y;
            break;
        }
        case 'mousemove': {
            end.x = msg.x;
            end.y = msg.y;
            break;
        }
        case 'mouseup': {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                console.log(tabs[0].id);
                chrome.tabs.sendMessage(tabs[0].id,"toggleSidebar");
            })

            chrome.tabs.captureVisibleTab(null, {format:"jpeg", quality:100}, function(screenshotUrl) {
                cropImage(screenshotUrl, function (url) {
                    console.log(url);
                    /*$.ajax({
                        url: 'https://yqdxdtgu2h.execute-api.us-east-1.amazonaws.com/dev/imgmatch',
                        data: url,
                        dataType: 'html',
                        type: 'POST',
                        contentType: 'image/jpeg',
                        async: true,
                        success: function(data) {
                            //console.log(data);
                            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                                //console.log(tabs[0].id);
                                chrome.tabs.sendMessage(tabs[0].id, data);
                            })
                            // populate panel with data
                        },
                        error: function(data) {
                            console.log(data);
                            // populate panel with data
                        }
                    });*/

                    var xmlHttp = new XMLHttpRequest();
                    xmlHttp.onreadystatechange = function() { 
                        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                                //console.log(tabs[0].id);
                                chrome.tabs.sendMessage(tabs[0].id, xmlHttp.responseText);
                            })
                    }
                    xmlHttp.open("POST", 'https://yqdxdtgu2h.execute-api.us-east-1.amazonaws.com/dev/imgmatch', true); // true for asynchronous 
                    xmlHttp.send(url);




                    /*var viewTabUrl = chrome.extension.getURL('screenshot.html?id=' + id++)
                    var targetId = null;
                    chrome.tabs.onUpdated.addListener(function listener(tabId, changedProps) {
                        if (tabId != targetId || changedProps.status != "complete")
                            return;

                        chrome.tabs.onUpdated.removeListener(listener);
                        var views = chrome.extension.getViews();
                        for (var i = 0; i < views.length; i++) {
                            var view = views[i];
                            if (view.location.href == viewTabUrl) {
                                view.setScreenshotUrl(url);
                                break;
                            }
                        }
                    });

                    chrome.tabs.create({url: viewTabUrl}, function(tab) {
                        targetId = tab.id;
                    });*/
                })
            });
            break;
        }
    }

});

// Listen for a click on the camera icon. On that click, take a screenshot.
chrome.browserAction.onClicked.addListener(function() {
    document.body.style.zoom = "100%";
    //console.log('foo');
    chrome.tabs.executeScript(null, { // defaults to the current tab
        file: "window.js", // script to inject into page and run in sandbox
        allFrames: true // This injects script into iframes in the page and doesn't work before 4.0.266.0.
    });

});
