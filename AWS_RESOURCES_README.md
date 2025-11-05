# AWS Resources Documentation - LP Management System

## 📋 Overview
This document provides a comprehensive overview of all AWS resources used by the LP Management System. The system is deployed across multiple AWS services in the **eu-west-2** (Europe - London) region.

**AWS Account ID**: `393157401543`
**Primary Region**: `eu-west-2` (Europe - London)
**Project**: LP Management System for Water Tap Asset Management

---

## 🏗️ Architecture Overview

The LP Management System uses a serverless architecture with the following components:
- **Frontend**: Next.js web application deployed on AWS Amplify
- **Backend**: AWS Lambda functions for API endpoints
- **Database**: Amazon DynamoDB for data storage
- **Authentication**: Amazon Cognito User Pool
- **File Storage**: Amazon S3 for backups and file uploads
- **Email**: Amazon SES for notifications and reports
- **Scheduling**: Amazon EventBridge for automated tasks

---

## 🔐 Authentication & Authorization

### Amazon Cognito User Pool
- **User Pool ID**: `eu-west-2_uZhfIxAA7`
- **User Pool Name**: `LP-Management-Users-EU`
- **Client ID**: `24a2n8fjsq4tvrtfdgtqkp71fl`
- **Purpose**: User authentication and authorization for the web application
- **Configuration**: Email-based login, no username required
- **Created**: July 6, 2025
- **Status**: ✅ Active

### IAM Roles
1. **lp-management-scheduler-role**
   - **Purpose**: Execution role for EventBridge scheduler Lambda function
   - **Permissions**: CloudWatch Logs (CreateLogGroup, CreateLogStream, PutLogEvents)
   - **Status**: ✅ Active

2. **water-tap-lambda-role**
   - **Purpose**: Execution role for main Lambda function
   - **Permissions**: DynamoDB access, CloudWatch Logs
   - **Status**: ✅ Active

---

## 🗄️ Database Resources

### Amazon DynamoDB Tables

#### Core Application Tables
1. **water-tap-assets** ⭐ *Primary Table*
   - **Purpose**: Main asset data storage
   - **Key Schema**: Partition Key: `id` (String)
   - **Billing**: Pay-per-request
   - **Status**: ✅ Active
   - **Records**: ~2,977 assets

2. **AssetAuditLogs**
   - **Purpose**: Audit trail for asset changes
   - **Key Schema**: Partition Key: `assetId` (String), Sort Key: `timestamp` (String)
   - **Billing**: Pay-per-request
   - **Status**: ✅ Active

3. **AssetTypes**
   - **Purpose**: Asset type definitions
   - **Key Schema**: Partition Key: `typeId` (String)
   - **Billing**: Pay-per-request
   - **Status**: ✅ Active

4. **FilterTypes**
   - **Purpose**: Filter type definitions
   - **Key Schema**: Partition Key: `typeId` (String)
   - **Billing**: Pay-per-request
   - **Status**: ✅ Active

5. **LPItems**
   - **Purpose**: LP (Legionella Prevention) management data
   - **Key Schema**: Partition Key: `id` (String)
   - **Billing**: Pay-per-request
   - **Status**: ✅ Active
   - **Records**: ~774 LP items

6. **SPListItems**
   - **Purpose**: SharePoint list items for filter reconciliation
   - **Key Schema**: Partition Key: `id` (String)
   - **Billing**: Pay-per-request
   - **Status**: ✅ Active
   - **Records**: ~1,395 items

7. **ScheduledReports**
   - **Purpose**: Configuration for automated email reports
   - **Key Schema**: Partition Key: `id` (String)
   - **Billing**: Pay-per-request
   - **Status**: ✅ Active

#### Legacy/Unused Tables (Potential for Cleanup)
8. **WaterTapAssetAssets** ⚠️ *Potentially Redundant*
   - **Status**: Exists but may not be actively used
   - **Recommendation**: Review for deletion if unused

9. **WaterTapAssetLocations** ⚠️ *Potentially Redundant*
   - **Status**: Exists but may not be actively used
   - **Recommendation**: Review for deletion if unused

10. **WaterTapAssetMaintenance** ⚠️ *Potentially Redundant*
    - **Status**: Exists but may not be actively used
    - **Recommendation**: Review for deletion if unused

---

## ⚡ Compute Resources

### AWS Lambda Functions

1. **water-tap-asset-lambda** ⭐ *Primary API Function*
   - **ARN**: `arn:aws:lambda:eu-west-2:393157401543:function:water-tap-asset-lambda`
   - **Purpose**: Main API endpoints for asset management, bulk operations, and data processing
   - **Runtime**: Node.js 18.x
   - **Handler**: `index.handler`
   - **Role**: `water-tap-lambda-role`
   - **Triggers**: API Gateway (multiple water-tap-asset-api instances), Direct invocation
   - **Status**: ✅ Active
   - **Log Group**: `/aws/lambda/water-tap-asset-lambda`
   - **Environment Variables**: 
     - `ASSETS_TABLE`: `WaterTapAssetAssets`
     - `MAINTENANCE_TABLE`: `WaterTapAssetMaintenance`
     - **⚠️ Note**: Environment variables point to legacy table names, but code uses `water-tap-assets`

2. **lp-management-scheduler**
   - **ARN**: `arn:aws:lambda:eu-west-2:393157401543:function:lp-management-scheduler`
   - **Purpose**: Automated scheduler for email reports
   - **Runtime**: Node.js 18.x
   - **Handler**: `lambda-scheduler.handler`
   - **Role**: `lp-management-scheduler-role`
   - **Triggers**: EventBridge rule (hourly)
   - **Status**: ✅ Active
   - **Log Group**: `/aws/lambda/lp-management-scheduler`
   - **Environment Variables**: `APP_URL=https://water.facilities-stg.co.uk`

3. **InsertSPItemToDynamoDB** ⭐ *Data Integration Function*
   - **ARN**: `arn:aws:lambda:eu-west-2:393157401543:function:InsertSPItemToDynamoDB`
   - **Purpose**: Handles bulk data insertion from external systems (Power Automate/SharePoint)
   - **Runtime**: Node.js 18.x
   - **Handler**: `index.handler`
   - **Role**: `service-role/InsertSPItemToDynamoDB-role-b4bz7std`
   - **Status**: ✅ Active
   - **Log Group**: `/aws/lambda/InsertSPItemToDynamoDB`
   - **Note**: Supports both `SPListItems` and `LPItems` table operations

---

## 📁 Storage Resources

### Amazon S3 Buckets

#### Active Buckets
1. **water-tap-asset-management-1750893967** ⭐ *Primary Backup Bucket*
   - **Purpose**: Backup file storage for automated database exports
   - **Created**: June 26, 2025
   - **Status**: ✅ Active
   - **Usage**: Excel file backups, scheduled reports
   - **Access**: Private with programmatic access

#### Legacy Buckets (Potential for Cleanup)
2. **water-tap-asset-management-1750892238** ⚠️ *Legacy*
   - **Created**: June 25, 2025
   - **Status**: May be unused
   - **Recommendation**: Review for deletion

3. **water-tap-asset-management-1750892601** ⚠️ *Legacy*
   - **Created**: June 26, 2025
   - **Status**: May be unused
   - **Recommendation**: Review for deletion

4. **water-tap-asset-management-1750892972** ⚠️ *Legacy*
   - **Created**: June 26, 2025
   - **Status**: May be unused
   - **Recommendation**: Review for deletion

5. **water-tap-asset-management-1750893177** ⚠️ *Legacy*
   - **Created**: June 26, 2025
   - **Status**: May be unused
   - **Recommendation**: Review for deletion

---

## 📧 Communication Resources

### Amazon SES (Simple Email Service)
- **From Email**: `noreply@water.facilities-stg.co.uk`
- **Purpose**: Sending automated backup reports and notifications
- **Region**: eu-west-2
- **Status**: ✅ Active
- **Usage**: Scheduled backup emails, system notifications

---

## ⏰ Scheduling Resources

### Amazon EventBridge

1. **lp-management-email-reports-scheduler**
   - **ARN**: `arn:aws:events:eu-west-2:393157401543:rule/lp-management-email-reports-scheduler`
   - **Schedule**: `rate(1 hour)` (runs every hour)
   - **Description**: Triggers LP Management email reports scheduler every hour
   - **Target**: `lp-management-scheduler` Lambda function
   - **Status**: ✅ Active

---

## 🌐 API Gateway Resources

### HTTP APIs (API Gateway v2)

#### Active APIs for LP Management
1. **InsertSPItemToDynamoDB-API** ⭐ *Power Automate Integration*
   - **API ID**: `3n6nzhlksa`
   - **Type**: HTTP API (API Gateway v2)
   - **Created**: July 29, 2025
   - **Purpose**: Receives data from Power Automate/SharePoint workflows
   - **Endpoint**: `https://3n6nzhlksa.execute-api.eu-west-2.amazonaws.com`
   - **Route**: `ANY /InsertSPItemToDynamoDB`
   - **Connected Lambda**: `InsertSPItemToDynamoDB`
   - **Status**: ✅ Active (Critical - Used by Power Automate)

### REST APIs (API Gateway v1)

#### Deleted APIs (October 28, 2025) ✅
The following unused REST API Gateway instances were successfully deleted:
- ❌ `r1iqp059n5` - water-tap-asset-api (Deleted)
- ❌ `t44zpnjrsh` - water-tap-asset-api (Deleted)
- ❌ `jmdx3s0q6h` - water-tap-asset-api (Deleted)
- ❌ `9ztt1tzaca` - water-tap-asset-api (Deleted)
- ❌ `uliwzluwwi` - water-tap-asset-api-v2 (Deleted)

**Reason for Deletion**: These APIs were unused duplicates. The application uses Next.js API routes directly (not through API Gateway), and Power Automate uses the HTTP API (`3n6nzhlksa`).

**Impact**: None - Application functionality unaffected. Estimated savings: $10-50/month.

#### Legacy/Unused APIs (Potential Cleanup)
- Multiple hospitality APIs (`hospitality-order-api`, `hospitality-orders-api`, etc.)
- Guest booking APIs (`guestBookingAPI-staging`)
- PAM RAG Dashboard API (`q0u58huag2`)
- SDIRS API (`y8ur7pf75j`)
- Timekeeper API (`s2g7a5lq14`)

---

## 🌐 Frontend Deployment

### AWS Amplify
- **App ID**: `d1xccxyuhu9vi`
- **Primary Domain**: `https://d1xccxyuhu9vi.amplifyapp.com`
- **Custom Domain**: `https://water.facilities-stg.co.uk` (used in scheduler)
- **Purpose**: Hosting the Next.js web application
- **Build Configuration**: `amplify.yml`
- **Auto-deployment**: Enabled from GitHub main branch
- **Environment Variables**: 
  - `AMPLIFY_ACCESS_KEY_ID`
  - `AMPLIFY_SECRET_ACCESS_KEY`
  - `AMPLIFY_AWS_REGION`
  - `SES_FROM_EMAIL`

---

## 📊 Monitoring & Logging

### Amazon CloudWatch
- **Log Groups**:
  - `/aws/lambda/water-tap-asset-lambda`
  - `/aws/lambda/lp-management-scheduler`
- **Purpose**: Application logging and monitoring
- **Retention**: Default CloudWatch retention policy
- **Status**: ✅ Active

---

## 🔧 Environment Configuration

### Environment Variables
```bash
# AWS Configuration
AWS_REGION=eu-west-2
AMPLIFY_AWS_REGION=eu-west-2
AMPLIFY_ACCESS_KEY_ID=[Configured in Amplify]
AMPLIFY_SECRET_ACCESS_KEY=[Configured in Amplify]

# Email Configuration
SES_FROM_EMAIL=noreply@water.facilities-stg.co.uk

# Backup Configuration
BACKUP_BUCKET=water-tap-asset-management-1750893967
BACKUP_EMAIL=[Configured per scheduled report]

# Application URLs
APP_URL=https://d1xccxyuhu9vi.amplifyapp.com
```

---

## ⚠️ Redundant Resources Analysis

### Potentially Unused Resources

#### DynamoDB Tables
- **WaterTapAssetAssets**: May be from an earlier version
- **WaterTapAssetLocations**: May be from an earlier version  
- **WaterTapAssetMaintenance**: May be from an earlier version

#### S3 Buckets
- **water-tap-asset-management-1750892238**: Likely superseded
- **water-tap-asset-management-1750892601**: Likely superseded
- **water-tap-asset-management-1750892972**: Likely superseded
- **water-tap-asset-management-1750893177**: Likely superseded

### Cleanup Recommendations
1. **Review Legacy DynamoDB Tables**: Check if `WaterTapAsset*` tables contain important data before deletion
2. **Consolidate S3 Buckets**: Keep only the latest bucket (`water-tap-asset-management-1750893967`)
3. ✅ **API Gateway Cleanup**: ✅ **COMPLETED** (October 28, 2025) - Deleted 5 unused REST API Gateway instances
4. **Clean up Lambda Environment Variables**: Update `water-tap-asset-lambda` environment variables to point to correct table names
5. **Remove Unused APIs**: Delete hospitality, guest booking, PAM, SDIRS, and timekeeper APIs if not actively used
6. **Monitor Usage**: Use CloudWatch metrics to confirm zero usage before deletion
7. **Backup Before Cleanup**: Export any data from legacy resources before deletion

### Critical Configuration Issues
1. **⚠️ Lambda Environment Variables Mismatch**: 
   - `water-tap-asset-lambda` environment variables point to `WaterTapAssetAssets` and `WaterTapAssetMaintenance`
   - But the application code uses `water-tap-assets`, `AssetAuditLogs`, etc.
   - **Action Required**: Update Lambda environment variables or verify which tables are actually being used

2. ✅ **API Gateway Cleanup**: ✅ **RESOLVED** (October 28, 2025)
   - Deleted 5 unused REST API Gateway instances
   - Power Automate API Gateway (`3n6nzhlksa`) remains active and protected
   - Application uses Next.js API routes directly

---

## 💰 Cost Optimization

### Current Cost Drivers
1. **DynamoDB**: Pay-per-request billing for 7+ active tables (including 3 potentially unused legacy tables)
2. **Lambda**: Execution time and invocations (40+ functions total, 3 for LP Management)
3. **API Gateway**: Request charges for 18+ REST APIs (many potentially unused)
4. **S3**: Storage costs for 5 buckets (4 potentially unused)
5. **Amplify**: Hosting and build minutes
6. **SES**: Email sending costs
7. **EventBridge**: Rule executions (minimal cost)
8. **CloudWatch**: Log storage and monitoring

### Optimization Opportunities
1. **Delete unused S3 buckets**: Potential savings on storage costs (4 legacy buckets)
2. **Review DynamoDB table usage**: Consider deleting unused legacy tables (3 WaterTapAsset* tables)
3. ✅ **API Gateway Cleanup**: ✅ **COMPLETED** (October 28, 2025) - Deleted 5 unused REST APIs, saved $10-50/month
4. **Optimize Lambda memory allocation**: Review and adjust based on actual usage
5. **Clean up unused Lambda functions**: 35+ functions exist, many for other projects
6. **S3 lifecycle policies**: Implement for backup files if long-term retention needed
7. **CloudWatch log retention**: Set appropriate retention periods to reduce storage costs

### Estimated Monthly Savings Potential
- ✅ **API Gateway**: ✅ **$10-50/month ACHIEVED** (Deleted 5 unused REST APIs on October 28, 2025)
- **S3 Storage**: $5-20/month (depending on bucket sizes)
- **DynamoDB**: $5-15/month (if legacy tables have ongoing read/write activity)
- **CloudWatch Logs**: $2-10/month (with proper retention policies)

---

## 🔒 Security Considerations

### Current Security Measures
1. **IAM Roles**: Least privilege access for Lambda functions
2. **Cognito Authentication**: Secure user authentication
3. **Private S3 Buckets**: No public access configured
4. **VPC**: Not currently used (serverless architecture)

### Security Recommendations
1. **Enable CloudTrail**: For API call auditing
2. **S3 Bucket Policies**: Review and tighten access policies
3. **DynamoDB Encryption**: Ensure encryption at rest is enabled
4. **Lambda Environment Variables**: Use AWS Secrets Manager for sensitive data

---

## 📞 Support Information

### Key Contacts
- **AWS Account**: 393157401543
- **Primary Region**: eu-west-2
- **Project Owner**: [To be filled]
- **Technical Contact**: [To be filled]

### Important ARNs
```
# Cognito User Pool
arn:aws:cognito-idp:eu-west-2:393157401543:userpool/eu-west-2_uZhfIxAA7

# Primary Lambda Function
arn:aws:lambda:eu-west-2:393157401543:function:water-tap-asset-lambda

# Scheduler Lambda Function  
arn:aws:lambda:eu-west-2:393157401543:function:lp-management-scheduler

# EventBridge Rule
arn:aws:events:eu-west-2:393157401543:rule/lp-management-email-reports-scheduler

# Primary S3 Bucket
arn:aws:s3:::water-tap-asset-management-1750893967
```

---

## 📅 Last Updated
**Date**: October 28, 2025  
**Version**: 1.0  
**Next Review**: November 28, 2025

---

*This documentation should be reviewed monthly to ensure accuracy and identify optimization opportunities.*
