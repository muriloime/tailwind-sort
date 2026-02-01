# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-01-31

### Breaking Changes
- **`sortClassString` is now async** - All functions now return Promises and must be awaited
- **Removed `sortOrder` parameter** - The `classOrder` parameter has been removed from `sortClassString`
- **Removed `classOrder` from Options** - Options interface no longer includes `classOrder` property
- **Now uses @herb-tools/tailwind-class-sorter** - Switched to Prettier-compatible sorting algorithm
- **Sort orders may change** - Due to different sorting algorithm, class order may differ from v1.x
- **Minimum Node.js version** - Now requires Node.js 14 or higher for async/await support

### Added
- New `processText` function for processing text with language-specific matchers
- New `processFile` function for processing entire files and writing them back
- CLI tool (`tailwind-sort`) for command-line usage
- Support for `headwind-ignore` comments to skip sorting specific class strings
- Support for `headwind-ignore-all` comments to skip sorting entire files
- `customTailwindPrefix` option for custom Tailwind CSS prefixes (e.g., "tw-")
- Optional `separator` and `replacement` parameters in Options interface
- Prettier-compatible class ordering via @herb-tools/tailwind-class-sorter
- CLI options: `--config`, `--no-duplicates`, `--prepend-custom`, `--prefix`
- Automatic language detection in CLI based on file extension

### Changed
- All functions now return Promises (async)
- `sortClassString` signature changed to remove `sortOrder` parameter
- Options interface now includes `customTailwindPrefix`, `separator`, and `replacement`
- Improved TypeScript types and documentation
- Updated README with comprehensive API documentation and migration guide
- Enhanced error handling with graceful fallbacks

### Fixed
- Better handling of edge cases in class sorting
- Improved regex matching for nested language constructs

### Deprecated
- None

### Removed
- `classOrder` parameter from `sortClassString` function
- `classOrder` property from Options interface

## [1.0.0] - 2026-01-31

### Added
- Initial release of tailwind-sort
- Core sorting functionality extracted from Headwind VS Code extension
- `sortClassString` function for sorting Tailwind CSS classes
- `buildMatchers` function for building regex matchers
- `getTextMatch` function for extracting class strings
- Full TypeScript support with type definitions
- Comprehensive Jest test suite
