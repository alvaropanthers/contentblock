(()=>{"use strict";var e=window.location.href;chrome.storage.local.get(["websites","html"]).then((function(t){if(t&&t.websites)for(var o=0;o<t.websites.length;++o){var s=t.websites[o];e.toLocaleLowerCase().includes(s.toLocaleLowerCase())&&t.html&&(document.body.innerHTML=t.html)}})).catch((function(e){return console.log(e)}))})();