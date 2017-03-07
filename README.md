# SIMPLELINK

CLI tool for automatically link bower_packages or node_modules

## Usage
  Usage: simplelink [options] <package>

  Options:

    -h, --help          output usage information
    -p, --path [route]  Specifies a path where the packages should be storage
    -b, --bower         Simplelink the package in bower_components
    -n, --npm           Simplelink the package in node_modules

## Installation

- Install [Node.js](http://nodejs.org/) and [npm](https://npmjs.org/)
- Run `npm install -g simplelink`
- Run `simplelink --help`

## Path configuration

Before start using it, configure the path where the packages will be stores
- Run `simplelink -p <path>`
