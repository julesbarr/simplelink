# SIMPLELINK

CLI tool for automatically link bower_packages or node_modules, this library will:
- Look for the package URL for you.
- Clone the repo in the folder you have specified.
- Link in the package manager that you have specified.

## Usage
  Usage: simplelink [options] <package>

  Options:

    -h, --help          output usage information
    -p, --path [route]  Specifies a path where the packages should be storage
    -b, --bower         Simplelink the package in bower_components
    -n, --npm           Simplelink the package in node_modules

1. Run `simplelink -p <path>` to specify where the packages should be stored.
2. Run `simplelink -b/n <packageName>` to link a package.

## Installation

- Install [Node.js](http://nodejs.org/) and [npm](https://npmjs.org/)
- Run `npm install -g simplelink`
- Run `simplelink --help`

## Path configuration

Before start using it, configure the path where the packages will be stores
- Run `simplelink -p <path>`
