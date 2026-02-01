# Repository Setup Guide

This guide covers setting up the tailwind-sort repository on GitHub before publishing to npm.

## Current Status

The package has been extracted from the Headwind extension and is ready to be published as a standalone npm package. All code is committed locally but not yet pushed to a remote repository.

## Local Repository State

Current commits ready to push:
- `4f7c367` - docs: add comprehensive publishing guide for npm
- `5592aa0` - docs: update documentation for v2.0.0 release
- `94ad351` - fix: correct CLI option handling and improve error messages
- `8262c56` - feat: add CLI tool for standalone usage
- `beb850f` - feat: add processFile function for file processing
- `9c52c8a` - feat: add processText function for text processing
- `ef0e66e` - refactor: use @herb-tools/tailwind-class-sorter for sorting
- `78394c3` - feat: add @herb-tools/tailwind-class-sorter dependency
- `b5d5c4b` - test: add comprehensive test suite with Jest
- `a66b9ac` - feat: extract core sorting logic from Headwind
- `b1a5e4f` - chore: initialize npm package structure

## Setup Steps

### 1. Create GitHub Repository

Go to GitHub and create a new repository:

**Option A: Via Web Interface**
1. Go to https://github.com/new
2. Repository name: `tailwind-sort`
3. Description: `A standalone Tailwind CSS class sorter utility powered by @herb-tools/tailwind-class-sorter`
4. Visibility: **Public** (required for npm publishing)
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

**Option B: Via GitHub CLI**

```bash
gh repo create tailwind-sort \
  --public \
  --description "A standalone Tailwind CSS class sorter utility powered by @herb-tools/tailwind-class-sorter" \
  --source=. \
  --remote=origin \
  --push
```

If using the CLI option, skip to step 3 (verification).

### 2. Add Remote and Push

After creating the repository on GitHub, add it as a remote:

```bash
cd /mnt/data/code/aio/tailwind-sort

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/tailwind-sort.git

# Or using SSH
git remote add origin git@github.com:YOUR_USERNAME/tailwind-sort.git

# Verify remote was added
git remote -v

# Push all commits
git push -u origin main

# Push tags if any
git push --tags
```

### 3. Verify Repository

Check that everything is on GitHub:

```bash
# View repository in browser
gh repo view --web

# Or manually visit:
# https://github.com/YOUR_USERNAME/tailwind-sort
```

Verify:
- ✅ All 11+ commits are visible
- ✅ README.md is displayed on the main page
- ✅ CHANGELOG.md is present
- ✅ PUBLISHING.md is present
- ✅ package.json shows version 2.0.0
- ✅ LICENSE file is present

### 4. Configure Repository Settings (Optional)

#### Add Topics

Add relevant topics to help others discover your package:
- `tailwind`
- `tailwindcss`
- `css`
- `sorting`
- `prettier`
- `cli-tool`
- `typescript`
- `nodejs`

#### Repository Description

Update the repository description to:
```
A standalone Tailwind CSS class sorter utility powered by @herb-tools/tailwind-class-sorter. Includes CLI tool and programmatic API.
```

#### Add Homepage

Set homepage to:
```
https://www.npmjs.com/package/tailwind-sort
```
(after publishing to npm)

### 5. Update package.json with Repository Info

The repository field in package.json is already set to:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/muriloime/tailwind-sort"
  }
}
```

**Update this URL if using a different username:**

```bash
cd /mnt/data/code/aio/tailwind-sort

# Edit package.json and update the repository URL
# Then commit:
git add package.json
git commit -m "chore: update repository URL"
git push
```

### 6. Create Initial Release (Optional)

Create a GitHub release for v2.0.0:

```bash
# Tag the current commit
git tag -a v2.0.0 -m "Release v2.0.0

Major refactor to use @herb-tools/tailwind-class-sorter for Prettier-compatible sorting.

Breaking Changes:
- All functions are now async
- sortOrder parameter removed
- Options interface changed

New Features:
- CLI tool for command-line usage
- processText function for text processing
- processFile function for file processing
- headwind-ignore support
"

# Push the tag
git push origin v2.0.0

# Create GitHub release
gh release create v2.0.0 \
  --title "v2.0.0 - Major Refactor" \
  --notes "See CHANGELOG.md for full details"
```

Or create the release manually:
1. Go to https://github.com/YOUR_USERNAME/tailwind-sort/releases/new
2. Choose tag: `v2.0.0` (create new tag)
3. Release title: `v2.0.0 - Major Refactor`
4. Description: Copy content from CHANGELOG.md v2.0.0 section
5. Click "Publish release"

## Next Steps

After completing this setup, you can proceed with publishing to npm:

1. Follow the instructions in [PUBLISHING.md](./PUBLISHING.md)
2. Run the pre-publishing checklist
3. Publish to npm with `npm publish --access public`
4. Update package homepage on GitHub to point to npm

## Verification Checklist

Before publishing to npm, verify:

- [ ] GitHub repository is public
- [ ] All commits are pushed to main branch
- [ ] README.md is displayed correctly on GitHub
- [ ] package.json repository URL is correct
- [ ] LICENSE file is present
- [ ] v2.0.0 tag is created (optional but recommended)
- [ ] Repository has appropriate topics/description
- [ ] Tests pass: `npm test`
- [ ] Build succeeds: `npm run build`

## Repository Structure

```
tailwind-sort/
├── src/                    # TypeScript source files
│   ├── index.ts           # Main exports
│   ├── processor.ts       # Text/file processing
│   ├── types.ts           # TypeScript types
│   ├── cli.ts             # CLI implementation
│   └── *.spec.ts          # Test files
├── bin/                    # CLI executable
│   └── tailwind-sort
├── dist/                   # Compiled JavaScript (generated by build)
├── node_modules/           # Dependencies (not committed)
├── docs/                   # Documentation (if needed in future)
├── .gitignore             # Git ignore rules
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript configuration
├── jest.config.js         # Jest test configuration
├── README.md              # Main documentation
├── CHANGELOG.md           # Version history
├── PUBLISHING.md          # Publishing guide
├── SETUP.md               # This file
└── LICENSE                # MIT License
```

## Troubleshooting

### Error: Remote already exists

If you get "remote origin already exists":

```bash
# Remove existing remote
git remote remove origin

# Add the correct remote
git remote add origin https://github.com/YOUR_USERNAME/tailwind-sort.git
```

### Error: Permission denied (publickey)

If using SSH and getting permission denied:

```bash
# Use HTTPS instead
git remote set-url origin https://github.com/YOUR_USERNAME/tailwind-sort.git

# Or add your SSH key to GitHub
# https://docs.github.com/en/authentication/connecting-to-github-with-ssh
```

### Error: Repository not found

Verify:
1. Repository was created on GitHub
2. Repository is public
3. Username in URL is correct
4. You have access to the repository

---

**Ready to set up the repository?**

```bash
cd /mnt/data/code/aio/tailwind-sort

# Option 1: Using GitHub CLI (recommended)
gh repo create tailwind-sort --public --source=. --remote=origin --push

# Option 2: Manual setup
# 1. Create repo on GitHub
# 2. git remote add origin https://github.com/YOUR_USERNAME/tailwind-sort.git
# 3. git push -u origin main
```
