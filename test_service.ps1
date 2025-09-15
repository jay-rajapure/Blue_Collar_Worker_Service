# First, let's register the worker if not exists, then login
Write-Host "Attempting to register worker (if not exists)..."

$registerHeaders = @{
    'Content-Type' = 'application/json'
}

$registerBody = @{
    email = 'jayrajapure@gmail.com'
    name = 'Sambhav Asati'
    passwordHash = 'plumber123'
    role = 'WORKER'
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri 'http://localhost:8080/auth/signUp' -Method POST -Headers $registerHeaders -Body $registerBody
    Write-Host "Registration successful! (or user already exists)"
    $authToken = "Bearer $($registerResponse.jwt)"
    Write-Host "Got token from registration: $($authToken.Substring(0, 20))..."
} catch {
    Write-Host "Registration failed (user already exists): $($_.Exception.Message)"
    
    # Try to login with different possible passwords
    $passwords = @('plumber123', 'password', '123456', 'password123', 'admin123', 'worker123')
    $loginSuccess = $false
    
    foreach ($pwd in $passwords) {
        Write-Host "Trying password: $pwd"
        
        $loginHeaders = @{
            'Content-Type' = 'application/json'
        }
        
        $loginBody = @{
            email = 'jayrajapure@gmail.com'
            password = $pwd
        } | ConvertTo-Json
        
        try {
            $loginResponse = Invoke-RestMethod -Uri 'http://localhost:8080/auth/signIn' -Method POST -Headers $loginHeaders -Body $loginBody
            Write-Host "Login successful with password: $pwd"
            $authToken = "Bearer $($loginResponse.jwt)"
            Write-Host "Got token from login: $($authToken.Substring(0, 20))..."
            $loginSuccess = $true
            break
        } catch {
            Write-Host "Failed with password: $pwd"
        }
    }
    
    if (-not $loginSuccess) {
        Write-Host "All login attempts failed. The password may be different."
        exit 1
    }
}

Write-Host "\nNow testing service creation..."

# Test multipart form data submission with fresh token
$boundary = [System.Guid]::NewGuid().ToString()
$headers = @{
    'Authorization' = $authToken
    'Content-Type' = "multipart/form-data; boundary=$boundary"
}

# Create multipart form data body
$LF = "`r`n"
$body = ""
$body += "--$boundary$LF"
$body += "Content-Disposition: form-data; name=`"userId`"$LF$LF"
$body += "2$LF"
$body += "--$boundary$LF"
$body += "Content-Disposition: form-data; name=`"title`"$LF$LF"
$body += "Test Plumbing Service$LF"
$body += "--$boundary$LF"
$body += "Content-Disposition: form-data; name=`"description`"$LF$LF"
$body += "Professional plumbing services for homes and offices. Experienced plumber available for all types of plumbing work.$LF"
$body += "--$boundary$LF"
$body += "Content-Disposition: form-data; name=`"charges`"$LF$LF"
$body += "500$LF"
$body += "--$boundary$LF"
$body += "Content-Disposition: form-data; name=`"estimatedTimeHours`"$LF$LF"
$body += "2$LF"
$body += "--$boundary$LF"
$body += "Content-Disposition: form-data; name=`"category`"$LF$LF"
$body += "Plumbing$LF"
$body += "--$boundary--$LF"

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:8080/api/works' -Method POST -Headers $headers -Body $body
    Write-Host "Success!"
    Write-Host "Created Work ID: $($response.id)"
    Write-Host "Title: $($response.title)"
    Write-Host "Category: $($response.category)"
    Write-Host "Charges: $($response.charges)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody"
        } catch {
            Write-Host "Could not read response body"
        }
    }
}