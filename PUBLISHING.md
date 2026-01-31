# Publishing Guide for tailwind-class-sorter

This guide covers testing and publishing the tailwind-class-sorter package to npm.

## Prerequisites

1. **npm Account**: You need an npm account with publishing permissions
   - Create account at https://www.npmjs.com/signup
   - Verify your email address

2. **npm Login**: Authenticate your local npm client
   ```bash
   npm login
   ```
   - Enter your npm username
   - Enter your npm password
   - Enter your email address
   - Enter OTP if you have 2FA enabled

3. **Git Status**: Ensure all changes are committed
   ```bash
   git status
   # Should show: "nothing to commit, working tree clean"
   ```

## Pre-Publishing Checklist

### 1. Run All Tests

```bash
npm test
```

**Expected output:**
```
PASS src/processor.spec.ts
PASS src/index.spec.ts

Test Suites: 2 passed, 2 total
Tests:       39 passed, 39 total
```

**If tests fail:** Fix all failing tests before proceeding.

### 2. Build the Package

```bash
npm run build
```

**Expected output:**
```
> tailwind-class-sorter@2.0.0 build
> tsc
```

**Verify build output:**
```bash
ls -la dist/
```

Should contain:
- `index.js`
- `index.d.ts`
- `processor.js`
- `processor.d.ts`
- `types.js`
- `types.d.ts`
- `cli.js`
- `cli.d.ts`

### 3. Test the CLI Locally

```bash
# Test CLI help
node ./bin/tailwind-class-sorter --help

# Test on a sample file (if you have one)
echo '<div class="px-4 container mx-auto text-center">Test</div>' > test.html
node ./bin/tailwind-class-sorter test.html
cat test.html
rm test.html
```

### 4. Verify package.json

Check that these fields are correct:

```bash
cat package.json | grep -E '"name"|"version"|"description"|"main"|"types"|"bin"'
```

Should show:
```json
"name": "tailwind-class-sorter",
"version": "2.0.0",
"description": "A standalone Tailwind CSS class sorter utility for sorting, deduplicating, and organizing Tailwind classes",
"main": "dist/index.js",
"types": "dist/index.d.ts",
"bin": {
```

### 5. Check Files to be Published

```bash
npm pack --dry-run
```

This shows what will be included in the published package. Verify:
- ✅ `dist/` directory is included
- ✅ `bin/` directory is included
- ✅ `README.md` is included
- ✅ `LICENSE` is included
- ✅ `node_modules/` is NOT included
- ✅ `src/` is NOT included (only dist should be published)
- ✅ `.git/` is NOT included

### 6. Test Package Installation (Optional but Recommended)

Create a local tarball and test it:

```bash
# Create tarball
npm pack

# This creates: tailwind-class-sorter-2.0.0.tgz

# Test in a temporary directory
mkdir /tmp/test-package
cd /tmp/test-package
npm init -y
npm install /path/to/tailwind-class-sorter/tailwind-class-sorter-2.0.0.tgz

# Test it works
node -e "const { sortClassString } = require('tailwind-class-sorter'); sortClassString('px-4 container', {}).then(console.log)"

# Test CLI
npx tailwind-class-sorter --help

# Cleanup
cd /path/to/tailwind-class-sorter
rm -rf /tmp/test-package
rm tailwind-class-sorter-2.0.0.tgz
```

## Publishing to npm

### First Time Publishing (v2.0.0)

If this is the first time publishing this package name to npm:

```bash
# Publish with public access
npm publish --access public
```

**Expected output:**
```
npm notice
npm notice 📦  tailwind-class-sorter@2.0.0
npm notice === Tarball Contents ===
npm notice 2.5kB  README.md
npm notice 1.1kB  LICENSE
npm notice 1.0kB  package.json
npm notice ...
npm notice === Tarball Details ===
npm notice name:          tailwind-class-sorter
npm notice version:       2.0.0
npm notice filename:      tailwind-class-sorter-2.0.0.tgz
npm notice package size:  XX.X kB
npm notice unpacked size: XXX.X kB
npm notice total files:   XX
npm notice
+ tailwind-class-sorter@2.0.0
```

### Publishing Updates (Future Versions)

For future updates after 2.0.0:

1. **Update version in package.json:**
   ```bash
   # For patch releases (bug fixes): 2.0.0 -> 2.0.1
   npm version patch

   # For minor releases (new features): 2.0.0 -> 2.1.0
   npm version minor

   # For major releases (breaking changes): 2.0.0 -> 3.0.0
   npm version major
   ```

2. **Update CHANGELOG.md** with new version entry

3. **Commit version bump:**
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore: bump version to X.X.X"
   git push
   ```

4. **Publish:**
   ```bash
   npm publish
   ```

5. **Create git tag:**
   ```bash
   git tag vX.X.X
   git push --tags
   ```

## Verification After Publishing

### 1. Check npm Registry

```bash
# View package info
npm view tailwind-class-sorter

# Check specific version
npm view tailwind-class-sorter@2.0.0
```

### 2. Test Installation from npm

```bash
# In a clean directory
mkdir /tmp/test-npm-install
cd /tmp/test-npm-install
npm init -y
npm install tailwind-class-sorter

# Test it works
node -e "const { sortClassString } = require('tailwind-class-sorter'); sortClassString('px-4 container', {shouldRemoveDuplicates: true, shouldPrependCustomClasses: false, customTailwindPrefix: ''}).then(console.log)"

# Test CLI
npx tailwind-class-sorter --help

# Cleanup
cd -
rm -rf /tmp/test-npm-install
```

### 3. Check Package Page

Visit: https://www.npmjs.com/package/tailwind-class-sorter

Verify:
- ✅ README is displayed correctly
- ✅ Version shows 2.0.0
- ✅ Dependencies are listed correctly
- ✅ License is shown

## Troubleshooting

### Error: "You do not have permission to publish"

**Solution:** Ensure you're logged in with the correct npm account:
```bash
npm whoami
npm login
```

### Error: "Package name already exists"

**Solution:** The package name is taken. You need to either:
1. Use a scoped package name: `@yourusername/tailwind-class-sorter`
2. Choose a different package name

### Error: "Version 2.0.0 already published"

**Solution:** You cannot republish the same version. Bump the version:
```bash
npm version patch  # Creates 2.0.1
npm publish
```

### Tests Fail After npm Install

**Solution:**
1. Check that `dependencies` in package.json includes `@herb-tools/tailwind-class-sorter`
2. Verify `dist/` files are included in the published package
3. Check that TypeScript types are properly exported

### CLI Not Working After Install

**Solution:**
1. Verify `bin` field in package.json points to correct file
2. Ensure `bin/tailwind-class-sorter` has shebang: `#!/usr/bin/env node`
3. Check file permissions: `chmod +x bin/tailwind-class-sorter`

## Rollback / Unpublish

**⚠️ Warning:** npm has strict unpublish policies. You can only unpublish within 72 hours, and it may affect users.

### Deprecate a Version (Recommended)

Instead of unpublishing, deprecate:

```bash
npm deprecate tailwind-class-sorter@2.0.0 "This version has critical bugs. Please upgrade to 2.0.1+"
```

### Unpublish (Use with Caution)

Only within 72 hours of publishing:

```bash
npm unpublish tailwind-class-sorter@2.0.0
```

## Publishing Checklist Summary

Before running `npm publish`, verify:

- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] CLI works locally
- [ ] Version in package.json is correct
- [ ] CHANGELOG.md is updated
- [ ] README.md is accurate
- [ ] All changes are committed to git
- [ ] `npm pack --dry-run` shows correct files
- [ ] You're logged into npm (`npm whoami`)
- [ ] Optional: Local tarball test passed

After publishing:

- [ ] Verify on npm registry (`npm view tailwind-class-sorter`)
- [ ] Test installation from npm
- [ ] Check package page on npmjs.com
- [ ] Create git tag for version
- [ ] Update any dependent projects (like Headwind extension)

## Continuous Integration (Future Enhancement)

Consider setting up GitHub Actions for automated publishing:

1. Create `.github/workflows/publish.yml`
2. Use `npm publish` with `NPM_TOKEN` secret
3. Trigger on git tags matching `v*`
4. Automatically run tests before publishing

This ensures consistent, tested releases.

---

**Ready to publish?**

```bash
cd /mnt/data/code/aio/tailwind-class-sorter
npm test && npm run build && npm publish --access public
```
