document.documentElement.style.height = '100%';
document.body.style.height = '100%';
document.documentElement.style.width = '100%';
document.body.style.width = '100%';

var div = document.createElement('div');
var selectedDiv = document.createElement('div');
var divid = document.getElementById('overlay');

console.log(divid);

//set attributes for div
div.id = 'overlay';
div.style.position = 'fixed';
div.style.top = '0%';
div.style.left = '0%';
div.style.width = '100%';   
div.style.height = '100%';
div.style.zIndex = 99999;
div.style.border = "thick solid #CFB53B"

selectedDiv.id = 'selectedOverlay';
selectedDiv.style.position = 'fixed';
selectedDiv.style.width = '10px';   
selectedDiv.style.height = '10px';
selectedDiv.style.left = '10px';   
selectedDiv.style.top = '10px';
selectedDiv.style.zIndex = 999999;
selectedDiv.style.backgroundColor = 'red';
selectedDiv.style.opacity = '0';
selectedDiv.style.resize = 'both'
document.body.appendChild(selectedDiv);
var isDown = false;

if (divid) {
	divid.parentNode.removeChild(divid);
} else {
	document.body.appendChild(div);
}

div.addEventListener('mousedown', function(event) {
	chrome.runtime.sendMessage({event:'mousedown', x: event.clientX, y: event.clientY}, function(response) {
	});
    isDown = true;
    selectedDiv.style.left = '' + event.clientX + 'px';   
    selectedDiv.style.top = '' + event.clientY + 'px';
    selectedDiv.style.opacity = '0.25';
});

div.addEventListener('mousemove', function(event) {
    chrome.runtime.sendMessage({event:'mousemove', x: event.clientX, y: event.clientY}, function(response) {
    });
    if (isDown) {
        var width = event.clientX - parseInt(selectedDiv.style.left);
        var height = event.clientY - parseInt(selectedDiv.style.top);
        selectedDiv.style.width = width + "px";
        selectedDiv.style.height =  height + "px";
    };   
});

div.addEventListener('mouseup', function(event) {
    selectedDiv.style.opacity = '0';
    setTimeout(function() {    
        chrome.runtime.sendMessage({event:'mouseup', x: event.clientX, y: event.clientY}, function(response) {

        });
    }, 100);

    isDown = false;
});



chrome.runtime.onMessage.addListener(function(msg, sender){
    //console.log(msg);
    if(msg == "toggleSidebar"){
        toggleSidebar();
    } else {
        console.log(msg);
        //sidebar.innerHTML = sidebar.innerHTML + msg;
        sidebar.innerHTML = msg;
        //$("#mySidebar").append(msg);

    }
})

if (sidebarOpen) {
    toggleSidebar();
}

var sidebarOpen = false;
var sidebar;

function toggleSidebar() {
    if(sidebarOpen) {
        var el = document.getElementById('mySidebar');
        el.parentNode.removeChild(el);
        sidebarOpen = false;
    }
    else {
        /*var header = document.createElement('h1');
        header.innerHTML = "FIREFLY GRAB";
        header.style.cssText = "\
            background:#06c;\
            text-align:center;\
            position: relative;\
            float: left;\
            left: 50%;\
            transform: translate(-50%, 0%);\
        ";*/
        sidebar = document.createElement('div');
        sidebar.id = "mySidebar";
        /*sidebar.innerHTML = "\
            <h1>FIREFLY GRAB</h1>\
        ";*/
        sidebar.style.cssText = "\
            position:fixed;\
            top:0px;\
            left:0px;\
            width:30%;\
            height:100%;\
            background:white;\
            z-index:9999999999;\
            float:right;\
            border:1px solid black;\
            overflow:auto;\
            z-index:9999999999;\
            float:right\
        ";
        document.body.appendChild(sidebar);
        sidebarOpen = true;
    }
}