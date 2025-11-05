# AWS Tagging Explained - Quick Guide

## 🏷️ What Are AWS Tags?

**Tags** are labels you attach to AWS resources. They're like "sticky notes" that help you identify, organize, and manage your resources.

Think of it like:
- **Labels on file folders** - helps you find files quickly
- **Categories in a library** - organizes books by subject
- **Color coding** - visual identification system

---

## 📋 How Tags Work

Tags are **key-value pairs** (like a dictionary):

```
Key: Project
Value: WSTP

Key: Environment  
Value: Production

Key: Owner
Value: IT-Team
```

You can attach **multiple tags** to each resource:
- `Project = WSTP`
- `Application = LP-Management`
- `Environment = Production`
- `Owner = St-Georges-NHS`
- `CostCenter = Facilities`

---

## ✅ Benefits of Tagging

### 1. **Resource Identification** 🔍

**Problem**: You have 50+ AWS resources across multiple projects. How do you know which ones belong to LP Management?

**Solution**: Tag them with `Project: WSTP`

**Example**:
```bash
# Find all WSTP resources
aws resourcegroupstaggingapi get-resources \
  --tag-filters Key=Project,Values=WSTP \
  --region eu-west-2
```

**Result**: You see only LP Management resources!

---

### 2. **Prevent Accidental Deletion** 🛡️

**Problem**: Someone might accidentally delete resources from the wrong project.

**Solution**: Tag resources, then use tags in deletion scripts/automation to prevent mistakes.

**Example Script**:
```bash
# Only delete resources tagged with Project=WSTP
RESOURCES=$(aws resourcegroupstaggingapi get-resources \
  --tag-filters Key=Project,Values=WSTP \
  --region eu-west-2)

# Before deletion, verify tags
if [[ $RESOURCES == *"Project=WSTP"* ]]; then
  echo "✅ Safe to delete - WSTP resource"
else
  echo "❌ STOP - Not a WSTP resource!"
  exit 1
fi
```

**Visual Example**:
```
Without Tags:
[water-tap-assets] ❓ Which project?
[hospitality-orders] ❓ Which project?
[lp-management-scheduler] ❓ Which project?

With Tags:
[water-tap-assets] 🏷️ Project=WSTP, Application=LP-Management ✅
[hospitality-orders] 🏷️ Project=Hospitality, Application=Orders ✅
[lp-management-scheduler] 🏷️ Project=WSTP, Application=LP-Management ✅
```

---

### 3. **Cost Tracking** 💰

**Problem**: Your AWS bill shows total costs but not per-project breakdown.

**Solution**: Tag resources, then AWS Cost Explorer shows costs by tag.

**Example**:
```
AWS Cost Explorer Report:
- Project=WSTP: $150/month
- Project=Hospitality: $80/month
- Project=SDIRS: $40/month
```

**How It Works**:
- AWS automatically tracks costs for each tag
- Generate reports: "How much does WSTP project cost?"
- Budget alerts: "Alert if WSTP costs exceed $200/month"

---

### 4. **Resource Organization** 📊

**Problem**: Resources scattered across AWS console - hard to find what you need.

**Solution**: Tag resources, then filter by tags in AWS console.

**Example**:
```
AWS Console → Filter by Tags:
- Filter: Project = WSTP
- Result: Shows only LP Management resources

AWS Console → Filter by Tags:
- Filter: Application = LP-Management AND Environment = Production
- Result: Shows only production LP Management resources
```

---

### 5. **Automation & Scripting** 🤖

**Problem**: You want to automate operations but need to target specific resources.

**Solution**: Use tags to identify resources automatically.

**Example**: Backup all WSTP resources
```bash
# Find all DynamoDB tables tagged with Project=WSTP
TABLES=$(aws dynamodb list-tables --region eu-west-2 | \
  jq -r '.TableNames[]')

for table in $TABLES; do
  TAGS=$(aws dynamodb list-tags-of-resource \
    --resource-arn "arn:aws:dynamodb:eu-west-2:393157401543:table/$table" \
    --region eu-west-2)
  
  if echo "$TAGS" | grep -q "Project.*WSTP"; then
    echo "✅ Backing up $table (WSTP resource)"
    # Backup logic here
  fi
done
```

---

### 6. **Compliance & Auditing** 📋

**Problem**: Auditors ask "Which resources belong to which project?"

**Solution**: Tags provide clear documentation.

**Example**:
```
Compliance Report:
- All WSTP resources tagged with Project=WSTP ✅
- All resources have Owner tag ✅
- All production resources have Environment=Production ✅
```

---

### 7. **Resource Grouping** 🔗

**Problem**: You want to see all related resources together.

**Solution**: AWS Resource Groups uses tags to group resources.

**Example**:
```
Create Resource Group:
Name: "WSTP-Production"
Tags: Project=WSTP, Environment=Production

Result: Shows all WSTP production resources in one view:
- DynamoDB Tables (7 tables)
- Lambda Functions (3 functions)
- IAM Roles (3 roles)
- S3 Buckets (1 bucket)
- API Gateway (1 API)
- Cognito User Pool (1 pool)
- EventBridge Rule (1 rule)
```

---

## 🎯 Real-World Example: Your LP Management Project

### Before Tagging:
```
AWS Console shows:
- water-tap-assets (Which project? ❓)
- lp-management-scheduler (Which project? ❓)
- hospitality-order-api (Which project? ❓)
- SDIRS_API (Which project? ❓)
- water-tap-asset-management-1750893967 (Which project? ❓)
```

**Problem**: Can't tell which resources belong to LP Management!

### After Tagging:
```
AWS Console shows:
- water-tap-assets 🏷️ Project=WSTP, Application=LP-Management ✅
- lp-management-scheduler 🏷️ Project=WSTP, Application=LP-Management ✅
- hospitality-order-api 🏷️ Project=Hospitality ✅
- SDIRS_API 🏷️ Project=SDIRS ✅
- water-tap-asset-management-1750893967 🏷️ Project=WSTP ✅
```

**Benefit**: Instantly identify WSTP resources!

---

## 🔍 Practical Use Cases

### Use Case 1: Find All WSTP Resources

```bash
# List all resources tagged with Project=WSTP
aws resourcegroupstaggingapi get-resources \
  --tag-filters Key=Project,Values=WSTP \
  --region eu-west-2
```

**Result**: Complete list of all LP Management resources!

---

### Use Case 2: Calculate WSTP Monthly Costs

```bash
# Generate cost report for WSTP project
aws ce get-cost-and-usage \
  --time-period Start=2025-10-01,End=2025-10-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=TAG,Key=Project \
  --filter-by Tags Key=Project,Values=WSTP
```

**Result**: "WSTP project costs $150/month"

---

### Use Case 3: Prevent Accidental Deletion

```bash
# Before deleting, check tags
RESOURCE_ARN="arn:aws:dynamodb:eu-west-2:393157401543:table/water-tap-assets"

TAGS=$(aws dynamodb list-tags-of-resource \
  --resource-arn $RESOURCE_ARN \
  --region eu-west-2)

# Check if it's a WSTP resource
if echo "$TAGS" | grep -q "Project.*WSTP"; then
  echo "⚠️ WARNING: This is a WSTP resource!"
  echo "Are you sure you want to delete? (yes/no)"
  read confirmation
  if [ "$confirmation" != "yes" ]; then
    echo "❌ Deletion cancelled"
    exit 1
  fi
fi
```

**Result**: Extra safety check before deletion!

---

### Use Case 4: Filter Resources in AWS Console

**Steps**:
1. Go to AWS Console
2. Select "Resource Groups" → "Tag Editor"
3. Search: `Project = WSTP`
4. **Result**: See all WSTP resources in one view!

---

## 📊 Tagging Best Practices

### Standard Tags (Recommended)

```json
{
  "Project": "WSTP",                    // Project identifier
  "Application": "LP-Management",       // Application name
  "Environment": "Production",           // prod/staging/dev
  "Owner": "St-Georges-NHS",            // Owner/team
  "CostCenter": "Facilities",           // Cost allocation
  "ManagedBy": "Manual",                // Manual/IaC
  "Backup": "Required",                 // Backup policy
  "Shutdown": "Never"                   // Auto-shutdown policy
}
```

### Tag Naming Conventions

- **Use consistent keys**: `Project`, `Environment`, `Owner` (not `project`, `env`, `owner`)
- **Use consistent values**: `WSTP`, `Production` (not `wstp`, `prod`)
- **Limit tag count**: Maximum 50 tags per resource
- **Use lower case for values**: `WSTP` or `wstp` (be consistent)

---

## 🚀 How to Use Tags

### 1. View Tags in AWS Console

**Steps**:
1. Go to any AWS resource (e.g., DynamoDB table)
2. Click on the resource
3. Scroll to "Tags" tab
4. See all tags attached to that resource

### 2. Add Tags in AWS Console

**Steps**:
1. Go to resource
2. Click "Tags" tab
3. Click "Manage tags"
4. Click "Add tag"
5. Enter Key: `Project`, Value: `WSTP`
6. Click "Save changes"

### 3. Search by Tags

**AWS Console**:
- Resource Groups → Tag Editor
- Search: `Project = WSTP`
- Shows all matching resources

**AWS CLI**:
```bash
aws resourcegroupstaggingapi get-resources \
  --tag-filters Key=Project,Values=WSTP \
  --region eu-west-2
```

---

## 💡 Tagging vs Renaming

### Tagging (Recommended) ✅
- **No downtime** - tags added instantly
- **Zero risk** - doesn't affect functionality
- **Works for all resources** - universal solution
- **Reversible** - can remove tags anytime
- **Visual identification** - see tags in console

### Renaming ⚠️
- **May require downtime** - some resources need recreation
- **Risk of errors** - breaking integrations
- **Not all resources** - many can't be renamed
- **Irreversible** - must recreate to change back
- **Code updates** - may need to update code references

**Conclusion**: Tagging is safer and more flexible!

---

## 🎯 Summary: Why Tagging is Useful

| Benefit | Without Tags | With Tags |
|---------|--------------|-----------|
| **Find Resources** | ❌ Search manually | ✅ Filter by tag |
| **Cost Tracking** | ❌ No breakdown | ✅ Costs by project |
| **Prevent Deletion** | ❌ No protection | ✅ Tag-based checks |
| **Organization** | ❌ Scattered resources | ✅ Grouped by tag |
| **Automation** | ❌ Hard to target | ✅ Easy filtering |
| **Documentation** | ❌ No clear ownership | ✅ Clear tags |

---

## 📝 Example: Tagging Your Resources

### Current State (No Tags):
```
Resource: water-tap-assets
Tags: (none)
❓ Which project? Unknown!
```

### After Tagging:
```
Resource: water-tap-assets
Tags:
  Project: WSTP
  Application: LP-Management
  Environment: Production
  Owner: St-Georges-NHS
✅ Clear identification!
```

---

## 🚀 Next Steps

1. **Understand**: Tags are like labels for identification
2. **Apply**: Tag all WSTP resources with `Project: WSTP`
3. **Use**: Filter and search resources by tags
4. **Benefit**: Easy identification, cost tracking, and safety

---

**Bottom Line**: Tags are like "name tags" for your AWS resources. They don't change the resource itself, but they help you identify, organize, and protect them!

---

*Tags are FREE and have ZERO impact on functionality - they're just metadata!*


