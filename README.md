## Boom Amazing...

... is a CouchApp that allows you to zoom/rotate/pan around an svg file, record the different positions and then replay those for a presentation... or something else.

## Running it

* Install CouchApp
* push the app to a CouchDB database
* create a document and upload your svg file, for example using Futon (http://localhost:5984/_utils)
* Go to http://localhost:5984/your_db/boom_amazing/_design/boom_amazing/index.html?svg={relative path to svg file}
* Start moving around, click save to add a slide
* Replay the saved positions by clicking the next/previous links
* Hack the code, add something awesome, share it on GitHub

## URLs

* http://github.com/langalex/boom_amazing

## Contact

Alexander Lang
alex@upstream-berlin.com

## Disclaimer

I have only tested this on Safari4/OSX