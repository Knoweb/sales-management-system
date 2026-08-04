$ErrorActionPreference = "Stop"

Write-Host "1. Logging in..."
$loginBody = @{
    email = "admin@knoweb.lk"
    password = "Admin1234"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/auth/login" -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.accessToken
    Write-Host "Login successful. Token obtained."
} catch {
    Write-Host "Login failed: $($_.Exception.Message)"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`n2. Getting eligible briefs..."
$briefsResponse = Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/technical-routing/eligible-briefs" -Headers $headers
$briefsResponse.content | ConvertTo-Json -Depth 5 | Write-Host

$briefId = $null
if ($briefsResponse.content.Count -gt 0) {
    $briefId = $briefsResponse.content[0].id
    Write-Host "`n3. Initializing technical project for brief: $briefId"
    try {
        Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/technical-routing/project-briefs/$briefId/initialize" -Headers $headers
        Write-Host "Initialized successfully."
    } catch {
        Write-Host "Initialization returned an error (might already be initialized): $($_.Exception.Message)"
    }
} else {
    Write-Host "`nNo eligible briefs found."
}

Write-Host "`n4. Getting paginated technical projects..."
$projectsResponse = Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/technical-routing/projects?page=0&size=10" -Headers $headers
$projectsResponse.content | ConvertTo-Json -Depth 5 | Write-Host

if ($projectsResponse.content.Count -gt 0) {
    $projectId = $projectsResponse.content[0].id
    Write-Host "`n5. Getting single project: $projectId"
    $detailResponse = Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/technical-routing/projects/$projectId" -Headers $headers
    $detailResponse | ConvertTo-Json -Depth 5 | Write-Host
    
    Write-Host "`n6. Routing project with empty departments..."
    try {
        Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/technical-routing/projects/$projectId/route" -Headers $headers -Body '{"departments":[]}'
    } catch {
        Write-Host "Expected failure for empty departments: $($_.Exception.Message)"
        $response = $_.Exception.Response
        if ($response) {
            $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
            $errBody = $reader.ReadToEnd()
            Write-Host "Error Body: $errBody"
        }
    }
}

Write-Host "`n7. Testing invalid token..."
try {
    Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/technical-routing/projects" -Headers @{"Authorization" = "Bearer invalid_token"}
} catch {
    Write-Host "Expected failure for invalid token: $($_.Exception.Message)"
}

Write-Host "`n8. Testing unauthenticated request..."
try {
    Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/technical-routing/projects"
} catch {
    Write-Host "Expected failure for unauthenticated request: $($_.Exception.Message)"
}
