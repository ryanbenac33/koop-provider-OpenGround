# Koop-Provider-OpenGround
<ins>**The problem**</ins>: Inability to easily incorporate up-to-date boring data hosted on OpenGround Cloud with project GIS viewers

<ins>**The solution**</ins>: Koop provider that pulls the needed data from the OpenGround database, translates it to an ESRI readable format, then hosts it at a link accessible by a feature class

## What is Koop?
Koop is a JavaScript toolkit for connecting spatial APIs — in this case connecting OpenGround Cloud boring data to ArcGIS Pro and online ESRI viewers. More information about Koop can be found on their [main GitHub page](https://koopjs.github.io/). 

**What is a Koop Provider?** A "provider" is a term used by Koop to describe a set of code that requests data and converts it to GeoJSON. All API requesting, data translating, and hosting is accomplished behind the scenes of this Koop-OpenGround-Provider running on a Node.js server.

## Getting Started
To get started using Koop, it is highly recommended to do each of the following:
1. Read through Koop documentation including:
    - [Koop Quickstart Guide](https://koopjs.github.io/docs/basics/quickstart)
    - [Providers](https://koopjs.github.io/docs/usage/provider) documentation 
    - [Koop Core](https://koopjs.github.io/docs/usage/koop-core) documentation
2. [Download Node.js](https://nodejs.org/en/download) to your machine for testing the provider
3. Install a developer environment like [VS Code](https://code.visualstudio.com/download) to view the Provider .js code
4.[Download Google Chrome](https://www.google.com/chrome/) and enable the "Inspect" developer tool

### Initialize NPM and Koop CLI
This provider ships with the base provider and a server file. After following the quick start guide, be sure you have installed npm (Node Package Manager) which can be utilized through the CMD command line. In the CMD using npm, download and install the Koop CLI (command line interface) using: 

`npm install -g @koopjs/cli`

### Initialize Files From Provider
Clone this repository to your local machine and open with VS Code. To start the server and pulling data, open `server.js` and start a new terminal. In the terminal enter `node server.js`. This will initialize the server and register the provider. The terminal output will also provide an example link to access data.

### Accessing the Data URL
All data will be viewed and accessed using a web browser (Google Chrome is recommended). Data is requested and accessed by correctly formatting a URL link in the following format:

`http://localhost:8080/opengroundcloud/rest/services/PROJECT_UID::DATA_TABLE/FeatureServer/0/query`

- **8080** is the default port the server will listen on. This is configurable in `server.js`
- **PROJECT_UID** is a unique identifier for a project. To lookup the UID for a specific project, use this link: *LINK UNDER CONSTRUCTION*
- **DATA_TABLE** is the OpenGround data table information you want to access. Currently, the provider is only configured to handle the "LocationDetails" input, however future version may expand functionality as needed

Complete Example:
[`http://localhost:8080/opengroundcloud/rest/services/c613f0c4-e46d-4a7a-8e67-f7c9501169d0::LocationDetails/FeatureServer/0/query`](http://localhost:8080/opengroundcloud/rest/services/c613f0c4-e46d-4a7a-8e67-f7c9501169d0::LocationDetails/FeatureServer/0/query)

## Accessing the Data as a Feature Class

## Configuring the Provider for a Server

## Interpreting Unexpected Responses and Errors
Most errors will be caught and explained by the program either displayed in the URL link or the terminal. Common examples of errors currently include the following:

1. **401 - Forbidden**: Your token is out of date and you should populate `token` in `config/default.json`