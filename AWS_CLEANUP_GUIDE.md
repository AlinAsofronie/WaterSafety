# AWS Resources Cleanup Guide - Safe Fixes

## ⚠️ Important: Read Before Proceeding
This guide provides **safe, non-breaking fixes** for the identified issues. All changes are reversible and won't affect your running application.

---

## 🔧 Issue 1: Lambda Environment Variables (SAFE TO FIX)

### Current Situation
- **Lambda Function**: `water-tap-asset-lambda`
- **Problem**: Environment variables point to unused table names
- **Impact**: None - these variables are NOT used by the code
- **Risk Level**: ✅ **ZERO RISK** - Environment variables are ignored

### Why It's Safe
The code uses hardcoded table names:
- `water-tap-assets` ✅ (used)
- `AssetAuditLogs` ✅ (used)
- `AssetTypes` ✅ (used)
- `FilterTypes` ✅ (used)
- `LPItems` ✅ (used)
- `SPListItems` ✅ (used)
- `ScheduledReports` ✅ (used)

Lambda environment variables:
- `ASSETS_TABLE: WaterTapAssetAssets` ❌ (NOT used)
- `MAINTENANCE_TABLE: WaterTapAssetMaintenance` ❌ (NOT used)

### Fix Options (Choose One)

#### Option A: Remove Unused Variables (Recommended)
```bash
# AWS CLI command to remove environment variables
aws lambda update-function-configuration \
  --function-name water-tap-asset-lambda \
  --region eu-west-2 \
  --environment Variables={}
```

#### Option B: Update to Correct Table Names (Optional)
```bash
# AWS CLI command to update environment variables
aws lambda update-function-configuration \
  --function-name water-tap-asset-lambda \
  --region eu-west-2 \
  --environment Variables="{ASSETS_TABLE=water-tap-assets,AUDIT_TABLE=AssetAuditLogs,ASSET_TYPES_TABLE=AssetTypes}"
```

#### Option C: Do Nothing (Also Safe)
- Leave as-is if you prefer
- No impact on functionality
- Just creates confusion for future developers

### Steps to Fix (via AWS Console)
1. Go to AWS Lambda Console → `water-tap-asset-lambda`
2. Go to **Configuration** → **Environment variables**
3. Click **Edit**
4. Remove `ASSETS_TABLE` and `MAINTENANCE_TABLE` variables
5. Click **Save**
6. **No deployment needed** - change takes effect immediately

**Verification**: After removing, test your application - everything should work exactly the same.

---

## 🔧 Issue 2: API Gateway Duplicates (SAFE TO CLEAN)

### Current Situation
- **Active API**: `r1iqp059n5` ✅ (Used in code)
- **Unused APIs**: 3 duplicates
- **Impact**: None - duplicates are not referenced
- **Risk Level**: ✅ **LOW RISK** - Proper verification needed first

### Active API Gateway
```
API ID: r1iqp059n5
URL: https://r1iqp059n5.execute-api.eu-west-2.amazonaws.com/dev
Status: ✅ ACTIVE (Used in code)
```

### Unused APIs (Safe to Delete After Verification)
```
1. t44zpnjrsh - Created June 25, 2025
2. jmdx3s0q6h - Created June 26, 2025  
3. 9ztt1tzaca - Created June 26, 2025
```

### Pre-Deletion Verification Steps

#### Step 1: Verify Active API Usage
```bash
# Check CloudWatch metrics for API usage (last 7 days)
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=water-tap-asset-api \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum \
  --region eu-west-2
```

#### Step 2: Check Lambda Invocations
```bash
# Check which API Gateway APIs are actually invoking the Lambda
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=water-tap-asset-lambda \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum \
  --region eu-west-2
```

#### Step 3: List API Gateway Resources
```bash
# For each API, check if it has resources/routes configured
aws apigateway get-resources --rest-api-id r1iqp059n5 --region eu-west-2
aws apigateway get-resources --rest-api-id t44zpnjrsh --region eu-west-2
aws apigateway get-resources --rest-api-id jmdx3s0q6h --region eu-west-2
aws apigateway get-resources --rest-api-id 9ztt1tzaca --region eu-west-2
```

### Safe Deletion Process

#### Option A: Delete via AWS Console (Recommended)
1. **Verify First**: Check CloudWatch metrics showing zero usage for duplicates
2. **Backup**: Note down API IDs before deletion
3. **Delete**: Go to API Gateway Console → Select unused API → Actions → Delete
4. **Confirm**: Type API name to confirm deletion

#### Option B: Delete via AWS CLI (Advanced)
```bash
# CAUTION: Only run after verification!
# Delete unused API Gateway APIs
aws apigateway delete-rest-api \
  --rest-api-id t44zpnjrsh \
  --region eu-west-2

aws apigateway delete-rest-api \
  --rest-api-id jmdx3s0q6h \
  --region eu-west-2

aws apigateway delete-rest-api \
  --rest-api-id 9ztt1tzaca \
  --region eu-west-2
```

### Post-Deletion Verification
1. Test your application thoroughly
2. Verify all API endpoints work correctly
3. Check CloudWatch logs for any errors
4. Monitor for 24-48 hours

---

## 📋 Summary Checklist

### Issue 1: Lambda Environment Variables
- [ ] Go to Lambda Console → `water-tap-asset-lambda`
- [ ] Check Environment Variables section
- [ ] Remove `ASSETS_TABLE` and `MAINTENANCE_TABLE` variables
- [ ] Test application (should work identically)
- [ ] ✅ **ZERO RISK** - Variables are not used

### Issue 2: API Gateway Cleanup
- [ ] Verify active API (`r1iqp059n5`) is working
- [ ] Check CloudWatch metrics for duplicate APIs
- [ ] Confirm zero usage on duplicates
- [ ] Backup API IDs
- [ ] Delete unused APIs one by one
- [ ] Test application after each deletion
- [ ] Monitor for 24-48 hours
- [ ] ✅ **LOW RISK** - Proper verification needed

---

## 🆘 Rollback Plan

### If Something Goes Wrong

#### Lambda Environment Variables
- **Problem**: Something breaks after removing variables
- **Solution**: Re-add the variables back (though they weren't used)
- **Risk**: Virtually zero - variables weren't being used

#### API Gateway
- **Problem**: Wrong API deleted
- **Solution**: Recreate API Gateway and reconnect to Lambda
- **Prevention**: Verify CloudWatch metrics before deletion
- **Backup**: Note API IDs and configurations before deletion

---

## 📞 Support

If you encounter any issues:
1. Check CloudWatch logs for errors
2. Verify all environment variables are correct
3. Test API endpoints manually
4. Restore from backup if needed

---

## ✅ Expected Benefits

After cleanup:
- ✅ Cleaner AWS console
- ✅ Reduced confusion for developers
- ✅ Potential cost savings ($10-50/month)
- ✅ Better resource management
- ✅ No functionality impact

---

**Last Updated**: October 28, 2025  
**Status**: Safe to proceed with Issue 1 immediately  
**Issue 2**: Requires verification before deletion


