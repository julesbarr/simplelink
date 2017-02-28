# AUTOLINK

CLI tool for automatically link bower_packages or node_modules

## Usage
  Usage: autolink [options] <package>

  Options:

    -h, --help          output usage information
    -p, --path [route]  Specifies a path where the packages should be storage
    -b, --bower         Autolink the package in bower_components
    -n, --npm           Autolink the package in node_modules

## Installation

- Install [Node.js](http://nodejs.org/) and [npm](https://npmjs.org/)
- Run `npm install -g autolink`
- Run `autolink --help`

## Path configuration

Before start using it, configure the path where the packages will be stores
- Run `autolink -p <path>`
