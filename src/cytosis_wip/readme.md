


# Cytosis


#### Notice
Cytosis is a very early prototype. Use with caution, as it might overwrite everything in your Airtable... so keep backups!



## What is Cytosis

Cytosis turns Airtable into a simple content management system. It wraps the official Airtable javascript API with some additional functionality that makes it easy to programmatically grab any kinds of data.



## How it works

Cytosis comes in many different flavors. There's a CDN-backed browser version, an npm module, and two node/express-based examples of how to pull data into your site (Endocytosis) and writing data back into Airtable (Exocytosis).


### Browser

[todo] 
- add include script
- add in-browser JS example of replacing data


### NPM module

[todo]
- Import Cytosis using npm into existing projects 
- Include cytosis.js with a CDN or locally into static sites and platforms like Squarespace and Wordpress


### Endo- & Exocytosis

[todo]
- `npm install` / `yarn install` for each of them and running them in browser


## Development

- clone this repo, you'll find the various builds, including the docs / demo site
- Use webpack `npm run build` to create a single JS file for CDNs or local file import w/o the need for Node. 
- Publish a demo site on surge w/ link to surge asset as CDN
- Publish changes as npm modules for easy npm integration








