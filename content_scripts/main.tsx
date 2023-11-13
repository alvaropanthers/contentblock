import { print } from "./utils";

const currentWeb = window.location.href;

chrome.storage.local.get(["websites", "html"])
.then((value: any) => {
    if (value && value.websites) {
        for (let i = 0; i < value.websites.length; ++i) {
            const v = value.websites[i];
            if (currentWeb.toLocaleLowerCase().includes(v.toLocaleLowerCase())) {
                if (value.html) {
                    document.body.innerHTML = value.html;
                }
            }
        }
    }
})
.catch((error) => console.log(error));