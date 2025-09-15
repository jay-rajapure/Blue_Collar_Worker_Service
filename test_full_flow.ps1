# Test script to add a service
$loginResponse = Invoke-RestMethod -Uri 'http://localhost:8080/auth/signIn' -Method POST -ContentType 'application/json' -InFile 'test_worker_login.json'
$workerToken = $loginResponse.jwt

Write-Host "Worker logged in with token: $($workerToken.Substring(0,20))..."

# Create service form data
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = @()
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"title`""
$bodyLines += ""
$bodyLines += "Professional Plumbing Service"
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"description`""
$bodyLines += ""
$bodyLines += "Expert plumbing services for homes and offices. 24/7 emergency service available."
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"charges`""
$bodyLines += ""
$bodyLines += "500"
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"estimatedTimeHours`""
$bodyLines += ""
$bodyLines += "2"
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"category`""
$bodyLines += ""
$bodyLines += "Plumbing"
$bodyLines += "--$boundary--"

$body = $bodyLines -join $LF

$headers = @{
    'Authorization' = "Bearer $workerToken"
    'Content-Type' = "multipart/form-data; boundary=$boundary"
}

try {
    $serviceResponse = Invoke-RestMethod -Uri 'http://localhost:8080/api/works' -Method POST -Headers $headers -Body $body
    Write-Host "Service created successfully!"
    Write-Host "Service ID: $($serviceResponse.id)"
    Write-Host "Title: $($serviceResponse.title)"
} catch {
    Write-Host "Error creating service: $($_.Exception.Message)"
}

# Now test customer login and service fetching
Write-Host "`nTesting customer login..."
$customerResponse = Invoke-RestMethod -Uri 'http://localhost:8080/auth/signIn' -Method POST -ContentType 'application/json' -InFile 'test_login.json'
$customerToken = $customerResponse.jwt

Write-Host "Customer logged in with token: $($customerToken.Substring(0,20))..."

# Test customer services endpoint
Write-Host "`nTesting customer services endpoint..."
try {
    $customerHeaders = @{
        'Authorization' = "Bearer $customerToken"
        'Content-Type' = 'application/json'
    }
    $servicesResponse = Invoke-RestMethod -Uri 'http://localhost:8080/api/works/customer' -Method GET -Headers $customerHeaders
    Write-Host "Found $($servicesResponse.Count) services for customer"
    
    if ($servicesResponse.Count -gt 0) {
        Write-Host "First service: $($servicesResponse[0].title)"
    }
} catch {
    Write-Host "Error fetching customer services: $($_.Exception.Message)"
}