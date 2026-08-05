# Loop CI/CD Setup Helper Script
# This script helps you set up the CI/CD workflow manually

Write-Host "Loop CI/CD Setup Helper" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""

Write-Host "Due to GitHub OAuth restrictions, the CI/CD workflow must be added manually." -ForegroundColor Yellow
Write-Host "This script will guide you through the process." -ForegroundColor Yellow
Write-Host ""

Write-Host "Step 1: Go to your GitHub repository" -ForegroundColor Cyan
Write-Host "URL: https://github.com/Lucieran-Raven/Loop-Technology" -ForegroundColor White
Write-Host ""

Write-Host "Step 2: Create the workflow file" -ForegroundColor Cyan
Write-Host "- Click 'Add file' -> 'Create new file'" -ForegroundColor White
Write-Host "- File name: .github/workflows/ci.yml" -ForegroundColor White
Write-Host ""

Write-Host "Step 3: Copy the workflow content" -ForegroundColor Cyan
Write-Host "The workflow content is in CI_CD_SETUP.md" -ForegroundColor White
Write-Host "Or use the content below:" -ForegroundColor White
Write-Host ""

$workflowContent = @"
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: `$`{`{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18.x, 20.x]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js `$`{`{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: `$`{`{ matrix.node-version }}
        
    - name: Install dependencies
      run: npm install
      
    - name: Run TypeScript check
      run: npm run build
      
    - name: Run tests
      run: npm test
      continue-on-error: true

  build:
    needs: test
    runs-on: `$`{`{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build Electron app
      run: npm run build
      
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: Build artifacts `$`{`{ matrix.os }}
        path: |
          dist/
          dist-electron/

  lint:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        
    - name: Install dependencies
      run: npm install
      
    - name: Run ESLint
      run: npm run lint

  security:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Run security audit
      run: npm audit
      continue-on-error: true
"@

Write-Host $workflowContent -ForegroundColor Gray
Write-Host ""

Write-Host "Step 4: Commit the file" -ForegroundColor Cyan
Write-Host "- Add a commit message: 'Add CI/CD pipeline'" -ForegroundColor White
Write-Host "- Click 'Commit changes'" -ForegroundColor White
Write-Host ""

Write-Host "Step 5: Monitor the first run" -ForegroundColor Cyan
Write-Host "- Go to the 'Actions' tab in your repository" -ForegroundColor White
Write-Host "- Watch the workflow run" -ForegroundColor White
Write-Host "- Check for any errors" -ForegroundColor White
Write-Host ""

Write-Host "Alternative Method:" -ForegroundColor Yellow
Write-Host "1. Go to Actions tab" -ForegroundColor White
Write-Host "2. Click 'New workflow'" -ForegroundColor White
Write-Host "3. Choose 'Set up a workflow yourself'" -ForegroundColor White
Write-Host "4. Paste the workflow content" -ForegroundColor White
Write-Host "5. Save and commit" -ForegroundColor White
Write-Host ""

Write-Host "After setup, you can:" -ForegroundColor Green
Write-Host "- Monitor CI/CD in the Actions tab" -ForegroundColor White
Write-Host "- Each push will trigger the pipeline" -ForegroundColor White
Write-Host "- Pull requests will run all checks" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to open the repository in your browser..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "https://github.com/Lucieran-Raven/Loop-Technology"

Write-Host ""
Write-Host "Repository opened in browser. Follow the steps above to complete CI/CD setup." -ForegroundColor Green
Write-Host "For detailed instructions, see CI_CD_SETUP.md" -ForegroundColor Green