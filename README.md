## Installtion and Usage

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/ziaahsan/ElectronBrowserJS
# Go into the directories ex and ex-server
cd ex
# Install dependencies
npm install
# Run the app client (ex)
npm start
```
---
## Purpose of the ElectronJS Browser (so far):
0. Handle complex synchronous logic (BrowserWindows are tricky, buggy, and annyoing as hell)
1. A powerful tool to get any information from the webpage and update an external tool with that information. Example case, using a stock page you can monitor the price change in a live or dynamic manner creating a fully fledged local API.
2. Monitor history, cookies, and session personally for any website. Take it further by using it with RaspberryPi and you can create a local database for training an AI on your dataset
3. Follow network flow with ease (basically chromium since electronJS runs on it)
4. See what kind of information website are sending out, and how to manage such information (For example certificate handling, cookies, session, etc)  This is acutally a problem for electronJS as of now. For example using Netflix.com is not as easy as for ElectronJS browser.
You need stuff (Still waiting on Widevine DRM Certificate been like 6 months) @https://www.electronjs.org/docs/tutorial/testing-widevine-cdm Tried doesn't quite work.


## Browser Interface
1. Title Bar handling URL and other dynamic changes
![alt text](https://github.com/ziaahsan/ElectronBrowserJS/blob/master/images/TopBar.gif)

2. Tab Bar handling complex tab switching, loading and navigation
![alt text](https://github.com/ziaahsan/ElectronBrowserJS/blob/master/images/TopBar2.gif)

3. Browser
![alt text](https://github.com/ziaahsan/ElectronBrowserJS/blob/master/images/Browser.gif)
