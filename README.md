# Koop-Provider-OpenGround
<ins>**The problem**</ins>: Inability to easily incorporate up-to-date boring data hosted on OpenGround Cloud with project GIS viewers

<ins>**The solution**</ins>: Koop provider that pulls the needed data from the OpenGround database, translates it to an ESRI readable format, then hosts it at a link accessible by a feature class

## What is Koop?
Koop is a JavaScript toolkit built on Node.js for connecting spatial APIs — in this case connecting OpenGround Cloud boring data to ArcGIS Pro and online ESRI viewers. More information about Koop can be found on their [main GitHub page](https://koopjs.github.io/). 

**What is a Koop Provider?** A "provider" is a term used by Koop to describe a set of code that requests data and converts it to GeoJSON. All API requesting, data translating, and hosting are accomplished behind the scenes of this Koop-OpenGround-Provider running on a Node.js server.

**How is the OpenGround Data Accessed?** All data is hosted on a USACE cloud, Bentley owned server. To access the data, we must provide authentication and a request to the OpenGround API. This allows us to request the data we need from the API and have it returned to us in a usable, JSON format. More information about the API [can be found here](https://documenter.getpostman.com/view/5790939/RzfniRf1) This provider is currently set up with temporary authorization codes provided when logging into the OpenGround Web Portal.

## Current Status
This Koop provider is in the early stages of development. The following are pieces that have been proven to work in testing:
1. Pull data from the OpenGround API into Koop

2. Merge data and translate to GeoJSON format

3. Filtering null coordinates and handling errors
   
4. Adding a projects provider

5. Create README for documentation

The following are pieces that are still in development:
1. Configure application to utilize service account credentials

2. Create connection to AGOL feature class

3. Test Koop on a CorpsNet Node.js server

4. QA check data and lcoations

5. Add table and JSON output service for projects

## Getting Started
To get started using Koop, it is highly recommended to do each of the following:
1. Read through Koop documentation including:
    - [Koop Quickstart Guide](https://koopjs.github.io/docs/basics/quickstart)
    - [Providers](https://koopjs.github.io/docs/usage/provider) documentation 
    - [Koop Core](https://koopjs.github.io/docs/usage/koop-core) documentation
2. [Download Node.js](https://nodejs.org/en/download) to your machine for testing the provider
3. Install a developer environment like [VS Code](https://code.visualstudio.com/download) to view the Provider .js code
   
4. [Download Google Chrome](https://www.google.com/chrome/) and enable the "Inspect" developer tool

5. *Optional*: [Watch this video](https://www.youtube.com/watch?v=mhdLEUuE3dk) for a visual demonstration of getting started (connecting to web map at 23:35)

6. This repo has an INCOMPLETE config.json file. Contact the owner of this repo for the complete config.json file which will give the application access to utilize the service account.

### Initialize NPM and Koop CLI
This provider ships with the base provider and a server file. After following the quick start guide, be sure you have installed npm (Node Package Manager) which can be utilized through the CMD command line. In the CMD using npm, download and install the Koop CLI (command line interface) using: 

`npm install -g @koopjs/cli`

The out of the box outputs also require the following modules be installed via command or terminal line (in addition to any installed during an app initialization):

`npm install flat`

**Note:** There are known issues installing the above packages when connected to VPN. Disconnect VPN and use only network to install the necessary packages.

### Initialize Files From Provider
Clone this repository to your local machine and open with VS Code. To start the server and pulling data, open `server.js` and start a new terminal. In the terminal enter `node server.js`. This will initialize the server and register the provider. The terminal output will also provide an example link to access data.

### Accessing Project Data URL
`http://localhost:8080/opengroundprojects/rest/services/projects::OUTPUT/FeatureServer/0/query`

Complete Example:
[`http://localhost:8080/opengroundprojects/rest/services/projects::table/FeatureServer/0/query`](http://localhost:8080/opengroundprojects/rest/services/projects::table/FeatureServer/0/query)

### Accessing Boring Data URL
All data will be viewed and accessed using a web browser (Google Chrome is recommended). Data is requested and accessed by correctly formatting a URL link in the following format:

`http://localhost:8080/opengroundcloud/rest/services/PROJECT_UID::DATA_TABLE/FeatureServer/0/query`

- **8080** is the default port the server will listen on. This is configurable in `server.js`
- **PROJECT_UID** is a unique identifier for a project. To lookup the UID for a specific project, use this link: *LINK UNDER CONSTRUCTION*
- **DATA_TABLE** is the OpenGround data table information you want to access. Currently, the provider is only configured to handle the "LocationDetails" input, however future version may expand functionality as needed

Complete Example:
[`http://localhost:8080/opengroundcloud/rest/services/c613f0c4-e46d-4a7a-8e67-f7c9501169d0::LocationDetails/FeatureServer/0/query`](http://localhost:8080/opengroundcloud/rest/services/c613f0c4-e46d-4a7a-8e67-f7c9501169d0::LocationDetails/FeatureServer/0/query)

### Example Data
This repo also contains an example JSON response from the provider using the project link above. That file is found in `example-data/boringData.txt`.

## Accessing the Data as a Feature Class

## Configuring the Provider for a Server

## Interpreting Unexpected Responses and Errors
Most errors will be caught and explained by the program either displayed in the URL link or the terminal. Common examples of errors currently include the following:

1. **401 - Forbidden**: Your token is out of date and you should populate `token` in `config/default.json`
2. **Cannot GET**: This is usually accompanied by a white background and an error message. The URL you are trying to access cannot be routed through Koop. Verify you have the correct URL and that it is formatted correctly

