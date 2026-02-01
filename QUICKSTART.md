# Quick Start: Setup → Test → Publish

This is your quick reference guide to get the tailwind-sort package from the current state to published on npm.

## Current Status

✅ Package extracted from Headwind extension
✅ Code fully implemented with @herb-tools integration
✅ All 39 tests passing
✅ Documentation complete (README, CHANGELOG)
✅ Version set to 2.0.0
⏳ **Next:** Push to GitHub → Publish to npm

## Three-Step Workflow

### Step 1: Setup GitHub Repository

**Quick Command (using GitHub CLI):**

```bash
cd /mnt/data/code/aio/tailwind-sort
gh repo create tailwind-sort --public --source=. --remote=origin --push
```

**Manual Setup:**
1. Create repository at https://github.com/new
2. Name: `tailwind-sort`
3. Visibility: **Public**
4. Don't initialize with README

```bash
cd /mnt/data/code/aio/tailwind-sort
git remote add origin https://github.com/YOUR_USERNAME/tailwind-sort.git
git push -u origin main
```

**Verify:** Visit https://github.com/YOUR_USERNAME/tailwind-sort

📖 **Detailed guide:** [SETUP.md](./SETUP.md)

---

### Step 2: Test Everything

**Run pre-publish checks:**

```bash
cd /mnt/data/code/aio/tailwind-sort

# 1. Run tests
npm test

# 2. Build package
npm run build

# 3. Test CLI
node ./bin/tailwind-sort --help

# 4. Check what will be published
npm pack --dry-run

# 5. Verify version
cat package.json | grep version
```

**Expected results:**
- ✅ 39 tests pass
- ✅ Build completes without errors
- ✅ CLI shows help output
- ✅ Dry run shows dist/, bin/, README.md, LICENSE
- ✅ Version shows "2.0.0"

📖 **Detailed guide:** [PUBLISHING.md](./PUBLISHING.md)

---

### Step 3: Publish to npm

**Prerequisites:**
```bash
# Login to npm (first time only)
npm login
```

**Publish:**

```bash
cd /mnt/data/code/aio/tailwind-sort

# All-in-one command (test, build, publish)
npm test && npm run build && npm publish --access public
```

**Verify:**

```bash
# Check on npm
npm view tailwind-sort

# Test installation
mkdir /tmp/test-install && cd /tmp/test-install
npm install tailwind-sort
npx tailwind-sort --help
cd - && rm -rf /tmp/test-install
```

**View on npm:** https://www.npmjs.com/package/tailwind-sort

📖 **Detailed guide:** [PUBLISHING.md](./PUBLISHING.md)

---

## One-Liner for Experienced Users

If you've already done Step 1 (GitHub setup) and are ready to publish:

```bash
cd /mnt/data/code/aio/tailwind-sort && npm test && npm run build && npm publish --access public
```

## After Publishing

### Update Headwind Extension

Once published to npm, update the Headwind extension's package.json:

```bash
cd /mnt/data/code/aio/headwind
npm install tailwind-sort@2.0.0
git add package.json package-lock.json
git commit -m "chore: update to tailwind-sort@2.0.0"
git push
```

### Create GitHub Release

```bash
cd /mnt/data/code/aio/tailwind-sort
git tag -a v2.0.0 -m "Release v2.0.0"
git push origin v2.0.0
gh release create v2.0.0 --title "v2.0.0 - Major Refactor" --notes-file CHANGELOG.md
```

## Common Issues

| Issue | Quick Fix |
|-------|-----------|
| "Permission denied" on npm publish | Run `npm login` |
| "Package name already taken" | Use scoped name: `@yourusername/tailwind-sort` |
| Tests fail | Fix tests before publishing |
| "No remote configured" | Run Step 1 (GitHub setup) |
| "Version already published" | Bump version: `npm version patch` |

## File Overview

- **SETUP.md** - GitHub repository setup (Step 1)
- **PUBLISHING.md** - Full npm publishing guide (Steps 2-3)
- **README.md** - Package documentation for users
- **CHANGELOG.md** - Version history
- **package.json** - Package configuration (check version here)

## Support

- **Issues:** https://github.com/YOUR_USERNAME/tailwind-sort/issues
- **npm:** https://www.npmjs.com/package/tailwind-sort
- **Headwind Extension:** https://github.com/muriloime/headwind

---

**Ready to go?**

```bash
# 1. Setup (if not done)
cd /mnt/data/code/aio/tailwind-sort
gh repo create tailwind-sort --public --source=. --remote=origin --push

# 2. Test & Publish
npm test && npm run build && npm publish --access public

# 3. Verify
npm view tailwind-sort
```
