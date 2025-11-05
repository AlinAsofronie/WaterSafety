# AWS Resources Renaming/Tagging Guide - WSTP Prefix
**Generated**: October 28, 2025  
**Objective**: Apply "WSTP" prefix/tags to all LP Management project resources for identification and accidental deletion prevention

---

## 📋 Executive Summary

**Challenge**: Many AWS resources cannot be directly renamed without recreation.

**Solution**: 
- ✅ **Tag all resources** with `Project: WSTP` and `Application: LP-Management`
- ✅ **Rename resources** that support renaming (IAM roles, API Gateway names)
- ✅ **Enable deletion protection** where available
- ✅ **Document naming conventions** for future resources

---

## 🔍 AWS Resource Renaming Capabilities

### ✅ Resources That CAN Be Renamed (No Recreation Needed)

1. **IAM Roles** - Can be renamed directly
2. **API Gateway Names** - Can be updated (metadata only)
3. **CloudWatch Log Groups** - Can be renamed
4. **EventBridge Rules** - Can be renamed (but requires recreation)

### ⚠️ Resources That CANNOT Be Renamed (Require Recreation)

1. **DynamoDB Tables** - Must recreate (data migration required)
2. **Lambda Functions** - Must recreate (code redeployment required)
3. **S3 Buckets** - Cannot rename (must create new bucket)
4. **Cognito User Pools** - Cannot rename (use tags)
5. **EventBridge Rules** - Can update name but requires recreation
6. **CloudWatch Log Groups** - Can rename but not recommended

### ✅ Tagging Strategy (Universal Solution)

**All AWS resources support tags!** This is the best approach for identification.

---

## 🏷️ Recommended Tagging Strategy

### Standard Tags for All WSTP Resources

```json
{
  "Project": "WSTP",
  "Application": "LP-Management",
  "Environment": "Production",
  "ManagedBy": "Manual",
  "Owner": "St-Georges-NHS",
  "CostCenter": "Facilities",
  "Backup": "Required"
}
```

### Tag Key-Value Pairs

| Key | Value | Purpose |
|-----|-------|---------|
| `Project` | `WSTP` | Primary identifier |
| `Application` | `LP-Management` | Application name |
| `Environment` | `Production` | Environment type |
| `ManagedBy` | `Manual` | Management method |
| `Owner` | `St-Georges-NHS` | Resource owner |
| `CostCenter` | `Facilities` | Cost allocation |
| `Backup` | `Required` | Backup requirement |

---

## 📊 Resource-Specific Actions

### 1. DynamoDB Tables (10 tables)

**Action**: Tag all tables (cannot rename without recreation)

**Tables to Tag**:
- `water-tap-assets`
- `AssetAuditLogs`
- `AssetTypes`
- `FilterTypes`
- `LPItems`
- `SPListItems`
- `ScheduledReports`
- `WaterTapAssetAssets` (legacy)
- `WaterTapAssetLocations` (legacy)
- `WaterTapAssetMaintenance` (legacy)

**Tagging Command**:
```bash
aws dynamodb tag-resource \
  --resource-arn arn:aws:dynamodb:eu-west-2:393157401543:table/water-tap-assets \
  --tags Key=Project,Value=WSTP Key=Application,Value=LP-Management Key=Environment,Value=Production \
  --region eu-west-2
```

**Alternative**: Use tags only (recommended - no downtime)

---

### 2. Lambda Functions (3 functions)

**Action**: Tag all functions (renaming requires recreation)

**Functions to Tag**:
- `water-tap-asset-lambda`
- `lp-management-scheduler`
- `InsertSPItemToDynamoDB`

**Tagging Command**:
```bash
aws lambda tag-resource \
  --resource arn:aws:lambda:eu-west-2:393157401543:function:water-tap-asset-lambda \
  --tags Project=WSTP,Application=LP-Management,Environment=Production \
  --region eu-west-2
```

**Note**: Renaming would require:
- Creating new Lambda function
- Updating all integrations (API Gateway, EventBridge)
- Redeploying code
- Updating IAM policies
- **Not recommended** - Use tags instead

---

### 3. IAM Roles (3 roles)

**Action**: ✅ **CAN RENAME** + Tag

**Roles to Rename**:
- `water-tap-lambda-role` → `WSTP-water-tap-lambda-role`
- `lp-management-scheduler-role` → `WSTP-lp-management-scheduler-role`
- `InsertSPItemToDynamoDB-role-b4bz7std` → `WSTP-InsertSPItemToDynamoDB-role`

**Renaming Process**:
1. Create new role with WSTP prefix
2. Copy policies from old role
3. Update Lambda functions to use new role
4. Delete old role
5. Tag new role

**Note**: Requires updating Lambda function configurations

---

### 4. S3 Buckets (5 buckets)

**Action**: Tag all buckets (cannot rename - must create new)

**Buckets to Tag**:
- `water-tap-asset-management-1750893967` (active)
- `water-tap-asset-management-1750892238` (legacy)
- `water-tap-asset-management-1750892601` (legacy)
- `water-tap-asset-management-1750892972` (legacy)
- `water-tap-asset-management-1750893177` (legacy)

**Tagging Command**:
```bash
aws s3api put-bucket-tagging \
  --bucket water-tap-asset-management-1750893967 \
  --tagging 'TagSet=[{Key=Project,Value=WSTP},{Key=Application,Value=LP-Management},{Key=Environment,Value=Production}]' \
  --region eu-west-2
```

**Note**: Bucket names are globally unique - cannot rename

---

### 5. API Gateway (HTTP API - 1 instance)

**Action**: Tag + Update name (metadata only)

**API to Tag**:
- `InsertSPItemToDynamoDB-API` → `WSTP-InsertSPItemToDynamoDB-API`

**API ID**: `3n6nzhlksa`

**Update Name Command**:
```bash
aws apigatewayv2 update-api \
  --api-id 3n6nzhlksa \
  --name WSTP-InsertSPItemToDynamoDB-API \
  --region eu-west-2
```

**Tagging Command**:
```bash
aws apigatewayv2 tag-resource \
  --resource-arn arn:aws:apigateway:eu-west-2::/apis/3n6nzhlksa \
  --tags Project=WSTP,Application=LP-Management,Environment=Production \
  --region eu-west-2
```

---

### 6. EventBridge Rules (1 rule)

**Action**: Tag + Enable deletion protection

**Rule to Tag**:
- `lp-management-email-reports-scheduler` → `WSTP-lp-management-email-reports-scheduler`

**Tagging Command**:
```bash
aws events tag-resource \
  --resource-arn arn:aws:events:eu-west-2:393157401543:rule/lp-management-email-reports-scheduler \
  --tags Key=Project,Value=WSTP Key=Application,Value=LP-Management Key=Environment,Value=Production \
  --region eu-west-2
```

**Note**: Renaming requires recreation (not recommended)

---

### 7. Cognito User Pool (1 pool)

**Action**: Tag only (cannot rename)

**User Pool**: `LP-Management-Users-EU` (ID: `eu-west-2_uZhfIxAA7`)

**Tagging Command**:
```bash
aws cognito-idp tag-resource \
  --resource-arn arn:aws:cognito-idp:eu-west-2:393157401543:userpool/eu-west-2_uZhfIxAA7 \
  --tags Project=WSTP,Application=LP-Management,Environment=Production \
  --region eu-west-2
```

---

### 8. CloudWatch Log Groups

**Action**: Tag all log groups (renaming not recommended)

**Log Groups to Tag**:
- `/aws/lambda/water-tap-asset-lambda`
- `/aws/lambda/lp-management-scheduler`
- `/aws/lambda/InsertSPItemToDynamoDB`

**Tagging Command**:
```bash
aws logs tag-log-group \
  --log-group-name /aws/lambda/water-tap-asset-lambda \
  --tags Project=WSTP,Application=LP-Management,Environment=Production \
  --region eu-west-2
```

---

## 🛡️ Deletion Protection

### Enable Deletion Protection Where Available

1. **DynamoDB Tables**:
   ```bash
   aws dynamodb update-table \
     --table-name water-tap-assets \
     --deletion-protection-enabled \
     --region eu-west-2
   ```

2. **Lambda Functions** (via policies - no direct setting)

3. **S3 Buckets** (via bucket policies)

4. **EventBridge Rules** (via tags and IAM policies)

---

## 📝 Implementation Plan

### Phase 1: Tagging (Zero Downtime, Low Risk) ✅ **RECOMMENDED**

1. **Tag all resources** with WSTP tags
2. **Verify tags** are applied correctly
3. **Document** tagged resources

**Time**: 30-60 minutes  
**Risk**: ✅ **ZERO** - Tagging does not affect functionality  
**Downtime**: None

### Phase 2: IAM Role Renaming (Low-Medium Risk)

1. **Create new IAM roles** with WSTP prefix
2. **Copy policies** from old roles
3. **Update Lambda functions** to use new roles
4. **Test** all Lambda functions
5. **Delete old roles** after verification

**Time**: 2-3 hours  
**Risk**: ⚠️ **LOW-MEDIUM** - Requires Lambda updates  
**Downtime**: Minimal (during role update)

### Phase 3: API Gateway Name Update (Low Risk)

1. **Update API Gateway name** with WSTP prefix
2. **Tag API Gateway**
3. **Verify Power Automate** still works

**Time**: 15 minutes  
**Risk**: ✅ **LOW** - Only metadata change  
**Downtime**: None

### Phase 4: Enable Deletion Protection (Low Risk)

1. **Enable deletion protection** on DynamoDB tables
2. **Configure S3 bucket policies** for protection
3. **Document** protection mechanisms

**Time**: 30 minutes  
**Risk**: ✅ **LOW** - Adds protection  
**Downtime**: None

---

## 🎯 Recommended Approach

### ✅ **Option 1: Tagging Only (Recommended)**

**Pros**:
- ✅ Zero downtime
- ✅ Zero risk
- ✅ Works for all resources
- ✅ Easy to implement
- ✅ Allows filtering/identification

**Cons**:
- ⚠️ Names remain unchanged (but tags identify them)

**Action**: Tag all resources with `Project: WSTP` tag

### ⚠️ **Option 2: Full Renaming (Not Recommended)**

**Pros**:
- ✅ Consistent naming with WSTP prefix

**Cons**:
- ❌ Requires recreation of many resources
- ❌ High risk of downtime
- ❌ Data migration required
- ❌ Code updates required
- ❌ Testing required for all changes

**Action**: Only rename IAM roles (lowest impact)

---

## 📋 Resource Tagging Checklist

### Immediate Actions (Tagging Only)

- [ ] Tag all DynamoDB tables (10 tables)
- [ ] Tag all Lambda functions (3 functions)
- [ ] Tag all IAM roles (3 roles)
- [ ] Tag all S3 buckets (5 buckets)
- [ ] Tag API Gateway (1 HTTP API)
- [ ] Tag EventBridge rule (1 rule)
- [ ] Tag Cognito User Pool (1 pool)
- [ ] Tag CloudWatch Log Groups (3 log groups)

### Optional Actions (Renaming)

- [ ] Rename IAM roles (3 roles)
- [ ] Update API Gateway name (1 API)
- [ ] Enable deletion protection on DynamoDB tables

---

## 🔧 Implementation Scripts

### Tag All Resources Script

```bash
#!/bin/bash
# Tag all WSTP resources with Project=WSTP

REGION="eu-west-2"
TAGS="Project=WSTP,Application=LP-Management,Environment=Production"

# DynamoDB Tables
for table in water-tap-assets AssetAuditLogs AssetTypes FilterTypes LPItems SPListItems ScheduledReports; do
  aws dynamodb tag-resource \
    --resource-arn "arn:aws:dynamodb:${REGION}:393157401543:table/${table}" \
    --tags Key=Project,Value=WSTP Key=Application,Value=LP-Management Key=Environment,Value=Production \
    --region ${REGION}
done

# Lambda Functions
for func in water-tap-asset-lambda lp-management-scheduler InsertSPItemToDynamoDB; do
  aws lambda tag-resource \
    --resource "arn:aws:lambda:${REGION}:393157401543:function:${func}" \
    --tags ${TAGS} \
    --region ${REGION}
done

# IAM Roles
for role in water-tap-lambda-role lp-management-scheduler-role; do
  aws iam tag-role \
    --role-name ${role} \
    --tags Key=Project,Value=WSTP Key=Application,Value=LP-Management Key=Environment,Value=Production
done

# S3 Buckets
for bucket in water-tap-asset-management-1750893967; do
  aws s3api put-bucket-tagging \
    --bucket ${bucket} \
    --tagging "TagSet=[{Key=Project,Value=WSTP},{Key=Application,Value=LP-Management},{Key=Environment,Value=Production}]" \
    --region ${REGION}
done

# API Gateway
aws apigatewayv2 tag-resource \
  --resource-arn "arn:aws:apigateway:${REGION}::/apis/3n6nzhlksa" \
  --tags ${TAGS} \
  --region ${REGION}

# EventBridge Rule
aws events tag-resource \
  --resource-arn "arn:aws:events:${REGION}:393157401543:rule/lp-management-email-reports-scheduler" \
  --tags Key=Project,Value=WSTP Key=Application,Value=LP-Management Key=Environment,Value=Production \
  --region ${REGION}

# Cognito User Pool
aws cognito-idp tag-resource \
  --resource-arn "arn:aws:cognito-idp:${REGION}:393157401543:userpool/eu-west-2_uZhfIxAA7" \
  --tags ${TAGS} \
  --region ${REGION}

echo "✅ All resources tagged successfully!"
```

---

## 💡 Best Practices Going Forward

### For New Resources

1. **Use WSTP prefix** in all new resource names
2. **Apply tags immediately** when creating resources
3. **Enable deletion protection** where available
4. **Document** all resource names in AWS_RESOURCES_README.md

### Naming Convention

```
WSTP-{resource-type}-{purpose}-{environment}

Examples:
- WSTP-dynamodb-assets-prod
- WSTP-lambda-scheduler-prod
- WSTP-s3-backups-prod
- WSTP-iam-lambda-role-prod
```

---

## 📊 Cost Impact

- **Tagging**: $0 (no cost)
- **Renaming**: $0 (but may require brief downtime)
- **Deletion Protection**: $0

---

## 🚨 Important Notes

1. **Tagging is Reversible**: Can remove tags anytime
2. **Renaming Requires Planning**: Test thoroughly before renaming
3. **Backup Before Changes**: Always backup before major changes
4. **Test After Changes**: Verify functionality after renaming
5. **Document Changes**: Update documentation after renaming

---

## 📞 Next Steps

1. **Review this guide** and decide on approach
2. **Choose Option 1 (Tagging)** or Option 2 (Full Renaming)
3. **Approve implementation** plan
4. **Execute tagging** (recommended first step)
5. **Verify tags** are applied correctly
6. **Consider renaming** IAM roles if desired

---

**Status**: Ready for implementation  
**Recommended**: Start with tagging only (Phase 1)  
**Risk Level**: ✅ **ZERO** for tagging, ⚠️ **LOW** for renaming

---

*Generated by AWS resource management analysis*  
*Last Updated: October 28, 2025*


