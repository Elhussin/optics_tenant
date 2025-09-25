# Create apps folder if not exists
if (!(Test-Path -Path "apps")) {
    New-Item -ItemType Directory -Path "apps"
}

# List of apps you want to move (edit this list)
$apps = @("branches", "users", "tenants", "accounting", "products")

foreach ($app in $apps) {
    if (Test-Path $app) {
        Move-Item $app apps/
        Write-Host "Moved $app to apps/"
    }
}

# Update settings.py INSTALLED_APPS
(Get-Content core/settings.py) `
    -replace "'tenants'", "'apps.tenants'" `
    -replace "'branches'", "'apps.branches'" `
    -replace "'users'", "'apps.users'" `
    -replace "'accounting'", "'apps.accounting'" `
    -replace "'products'", "'apps.products'" |
    Set-Content core/settings.py

# Update imports in the whole project
Get-ChildItem -Recurse -Include *.py | ForEach-Object {
    (Get-Content $_.FullName) `
        -replace "from tenants", "from apps.tenants" `
        -replace "from branches", "from apps.branches" `
        -replace "from users", "from apps.users" `
        -replace "from accounting", "from apps.accounting" `
        -replace "from products", "from apps.products" `
        -replace "import tenants", "import apps.tenants" `
        -replace "import branches", "import apps.branches" `
        -replace "import users", "import apps.users" `
        -replace "import accounting", "import apps.accounting" `
        -replace "import products", "import apps.products" |
        Set-Content $_.FullName
    Write-Host "Updated imports in $($_.FullName)"
}
