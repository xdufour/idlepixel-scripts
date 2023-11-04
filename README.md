# idlepixel-scripts

## Tampermonkey setup for developping locally

1) Go to the TM dashboard
2) Edit the installed version of this script
3) Delete everything but the UserScript header
4) Add this line, making sure the file URL points to your cloned file on disk:
```// @require      file://E:\git\idlepixel-scripts\src\market_overhaul.js```
5) You should now be able to freely edit in an external editor like VSCode, and only have to reload the page once you've saved your changes.