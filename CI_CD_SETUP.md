# CI/CD Setup Guide

## Overview

Due to GitHub security restrictions on OAuth apps, the automated CI/CD workflow needs to be set up manually. This guide provides step-by-step instructions.

## Manual CI/CD Setup

### Option 1: Add Workflow File Manually

1. **Go to your GitHub repository**: https://github.com/Lucieran-Raven/Loop-Technology

2. **Create the workflow file**:
   - Click on "Add file" → "Create new file"
   - Name it: `.github/workflows/ci.yml`
   - Paste the content from the README section

3. **Commit the file**:
   - Add a commit message: "Add CI/CD pipeline"
   - Click "Commit changes"

### Option 2: Use GitHub Actions via Web UI

1. Go to your repository
2. Click on "Actions" tab
3. Click "New workflow"
4. Choose "Simple workflow" or "Set up a workflow yourself"
5. Paste the CI/CD configuration
6. Save the workflow

## CI/CD Configuration

The workflow includes:
- **Testing**: Automated tests across multiple OS and Node versions
- **Building**: Build verification for different platforms
- **Linting**: Code quality checks with ESLint
- **Security**: Dependency vulnerability scanning

## Local Development

Before pushing changes, run these commands:

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Build the project
npm run build

# Run tests (when available)
npm test
```

## GitHub Actions Status

After setting up the workflow, you can monitor CI/CD status:
- Check the "Actions" tab in your repository
- Each push will trigger the pipeline
- Pull requests will run all checks automatically

## Troubleshooting

### Workflow Not Triggering
- Ensure the file is in `.github/workflows/` directory
- Check the workflow file syntax is correct
- Verify GitHub Actions is enabled in repository settings

### Build Failures
- Check the Actions tab for detailed error logs
- Ensure all dependencies are installed
- Verify Node.js version compatibility

### Permission Issues
- Go to repository Settings → Actions → General
- Ensure "Allow all actions and reusable workflows" is enabled
- Check workflow permissions under "Workflow permissions"

## Alternative: GitHub Actions Starter Workflows

If manual setup doesn't work, you can use GitHub's starter workflows:

1. Go to Actions tab
2. Click "New workflow"
3. Browse starter workflows
4. Choose "Node.js" or "Electron" workflow
5. Customize it for Loop's needs

## Next Steps

1. Add the workflow file manually via GitHub web interface
2. Monitor the first run in the Actions tab
3. Adjust configuration based on results
4. Add more stages as needed (deployment, release, etc.)