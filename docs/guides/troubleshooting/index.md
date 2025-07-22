Since `plotjs` does many things via JavaScript (e.g, in your browser when you open your html file), you may easily encounter "silent" errors.

In practice you will run you Python and everything will seems fine, but that does not mean what you'll see in the output is what you expected. There may multiple reasons for this. Here I'll explain common things that can happen, and how to debug them.

## Developer tools

Your browser has a thing called developer tools. It allows you to view many things, but here we're mostly interested in its "console" section.

The console displays all the messages, including error messages, that the web page encountered at some point. Many of them are not necessarly interesting and are standard messages, but some of them might come from `plotjs` doing something wrong.

How to open the developer tools is browser-specific, but there's likely a shortcut to make it convenient. For instance, on macOS + Firefox I use ++cmd+option+i++

## Debug `plotjs`

If you don't see what you expect in your chart, the first thing to do is to check the console. If you see any error message in it, that might be related to why it's not working as expected.
