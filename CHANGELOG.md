# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.3] - 2018-05-21

### Deprecated
* nodejs 4 is no longer maintained. Support for it will be removed in the next release.

### Security
* Upgraded dependencies.

## [2.2.2] - 2018-02-19

### Security
* Upgraded dependencies

## [2.2.1] - 2018-01-06

### Added
* Better version output
* Examples in cli

## [2.2.0] - 2018-01-01

### Changed
* Replaced meow with commander
* External module for determining options
* Used only required modules instead of entire lodash

## [2.1.3] - 2017-12-26

### Added
* Screenshot of cli

## [2.1.2] - 2017-12-23

### Fixed
* Missing dependency

## [2.1.1] - 2017-12-22

### Added
* Verbose option for detailed output
* Colorful output

### Fixed
* Files were written in the wrong directory

## [2.1.0] - 2017-12-20

### Added
* Minify output html
* Watch for file changes
* Use clean urls

## [2.0.1] - 2017-12-14

### Fixed
* Corrected typos

### Changed
* Unified modules to a single file
* Replaced lodash with external module for reading nested files

## [2.0.0] - 2017-12-03

### Added
* Render files and directories containing nunjucks templates to html
* Render markdown with marked
* Specify global data for templates as a json file or a directory with yaml files
* Access data specified in front-matter with page object inside templates

[Unreleased]: https://github.com/mohitsinghs/njk/compare/v2.2.3...HEAD
[2.2.3]: https://github.com/mohitsinghs/njk/compare/v2.2.2...v2.2.3
[2.2.2]: https://github.com/mohitsinghs/njk/compare/v2.2.1...v2.2.2
[2.2.1]: https://github.com/mohitsinghs/njk/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/mohitsinghs/njk/compare/v2.1.3...v2.2.0
[2.1.3]: https://github.com/mohitsinghs/njk/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/mohitsinghs/njk/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/mohitsinghs/njk/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/mohitsinghs/njk/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/mohitsinghs/njk/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/mohitsinghs/njk/compare/v1.1.6...v2.0.0
