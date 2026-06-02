$ErrorActionPreference = "Stop"

$frontend_modules = @("auth", "security", "users", "labs", "courses", "experiments", "resources", "discussion", "classroom", "ai", "assessments", "certificates", "passport", "analytics", "shared")
$backend_modules = @("auth", "security", "users", "institutions", "labs", "courses", "experiments", "resources", "discussion", "classroom", "ai", "assessments", "certificates", "passport", "analytics", "shared")

$template = @"
Module Name: {0}
Purpose: [Brief description of the module's core responsibility]
Owners: [@github_username1, @github_username2]
Allowed Modifications: [What files/logic owners can modify freely]
Forbidden Modifications: [What cannot be modified without cross-module approval]
Public APIs: [List of APIs/Endpoints or Frontend Hooks exposed to other modules]
Dependencies: [Other modules this module depends on (e.g., auth, shared)]
Future Responsibilities: [Upcoming features or planned scope]
"@

# Base directories
$null = New-Item -ItemType Directory -Force -Path "frontend/src/modules"
$null = New-Item -ItemType Directory -Force -Path "backend/src/modules"
$null = New-Item -ItemType Directory -Force -Path "docs"
$null = New-Item -ItemType Directory -Force -Path ".github"
$null = New-Item -ItemType Directory -Force -Path "scripts"

foreach ($mod in $frontend_modules) {
    $path = "frontend/src/modules/$mod"
    $null = New-Item -ItemType Directory -Force -Path "$path/components"
    $null = New-Item -ItemType Directory -Force -Path "$path/pages"
    $null = New-Item -ItemType Directory -Force -Path "$path/services"
    $null = New-Item -ItemType Directory -Force -Path "$path/hooks"
    $null = New-Item -ItemType Directory -Force -Path "$path/types"
    
    $content = $template -f $mod
    Set-Content -Path "$path/MODULES.txt" -Value $content
}

foreach ($mod in $backend_modules) {
    $path = "backend/src/modules/$mod"
    $null = New-Item -ItemType Directory -Force -Path $path
    
    $content = $template -f $mod
    Set-Content -Path "$path/MODULES.txt" -Value $content
    
    $null = New-Item -ItemType File -Force -Path "$path/routes.rs"
    $null = New-Item -ItemType File -Force -Path "$path/service.rs"
    $null = New-Item -ItemType File -Force -Path "$path/repository.rs"
    $null = New-Item -ItemType File -Force -Path "$path/models.rs"
    $null = New-Item -ItemType File -Force -Path "$path/dto.rs"
}
Write-Output "Architecture skeleton generation completed."
