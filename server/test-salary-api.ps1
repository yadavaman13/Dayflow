# ============================================
# SALARY ENGINE API TEST SCRIPT (PowerShell)
# ============================================
# Tests all 11 salary engine REST API endpoints

$API_BASE = "http://localhost:5000/api"
$passedTests = 0
$failedTests = 0
$testResults = @()

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "🚀 SALARY ENGINE API TEST SUITE" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "📅 Date: $(Get-Date)" -ForegroundColor Blue
Write-Host "🌐 API Base: $API_BASE" -ForegroundColor Blue
Write-Host ""

# Helper function to make API calls
function Invoke-APITest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null
    )
    
    try {
        $uri = "$API_BASE$Endpoint"
        $params = @{
            Uri = $uri
            Method = $Method
            ContentType = "application/json"
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params
        $data = $response.Content | ConvertFrom-Json
        
        return @{
            Success = $true
            Status = $response.StatusCode
            Data = $data
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            Status = $_.Exception.Response.StatusCode.value__
        }
    }
}

# ============================================
# TEST 1: Get Component Types
# ============================================
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "TEST 1: GET /api/salary/component-types" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$result = Invoke-APITest -Method "GET" -Endpoint "/salary/component-types"

if ($result.Success -and $result.Data.success) {
    Write-Host "✅ Status: $($result.Status)" -ForegroundColor Green
    Write-Host "✅ Component Types: $($result.Data.data.all.Count)" -ForegroundColor Green
    
    foreach ($ct in $result.Data.data.all) {
        Write-Host "  - $($ct.name) ($($ct.component_code)): $($ct.default_mode) $($ct.default_value)" -ForegroundColor Blue
    }
    
    $passedTests++
    $testResults += [PSCustomObject]@{Test=1; Name="Get Component Types"; Status="PASS"}
}
else {
    Write-Host "❌ Failed: $($result.Error)" -ForegroundColor Red
    $failedTests++
    $testResults += [PSCustomObject]@{Test=1; Name="Get Component Types"; Status="FAIL"; Error=$result.Error}
}

# ============================================
# TEST 2: Calculate Salary Components (Preview)
# ============================================
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "TEST 2: POST /api/salary/calculate (Preview)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$calcBody = @{
    wage = 50000
    componentTypeIds = @(1, 2, 3, 4, 5, 6, 7, 8, 9)
}

$result = Invoke-APITest -Method "POST" -Endpoint "/salary/calculate" -Body $calcBody

if ($result.Success -and $result.Data.success) {
    Write-Host "✅ Status: $($result.Status)" -ForegroundColor Green
    Write-Host "✅ Wage: Rs $($result.Data.data.calculation.wage)" -ForegroundColor Green
    Write-Host "✅ Total Earnings: Rs $($result.Data.data.calculation.totalEarnings)" -ForegroundColor Green
    Write-Host "✅ Components: $($result.Data.data.calculation.components.Count)" -ForegroundColor Green
    
    foreach ($c in $result.Data.data.calculation.components) {
        Write-Host "  - $($c.component_name): Rs $($c.computed_amount)" -ForegroundColor Blue
    }
    
    $passedTests++
    $testResults += [PSCustomObject]@{Test=2; Name="Calculate Components"; Status="PASS"}
}
else {
    Write-Host "❌ Failed: $($result.Error)" -ForegroundColor Red
    $failedTests++
    $testResults += [PSCustomObject]@{Test=2; Name="Calculate Components"; Status="FAIL"; Error=$result.Error}
}

# ============================================
# TEST SUMMARY
# ============================================
Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

$testResults | Format-Table -AutoSize

$totalTests = $passedTests + $failedTests
$successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 1) } else { 0 }

Write-Host "Total Tests: $totalTests" -ForegroundColor Blue
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor $(if ($failedTests -gt 0) { "Red" } else { "Green" })
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } else { "Yellow" })
Write-Host "================================================================`n" -ForegroundColor Cyan

if ($failedTests -gt 0) {
    exit 1
}
else {
    exit 0
}
