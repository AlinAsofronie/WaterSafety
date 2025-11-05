# Water Tap Management API Documentation

## Base URL
The application uses Next.js API routes directly. All endpoints are available at:
```
https://water.facilities-stg.co.uk/api/
```
or for local development:
```
http://localhost:3000/api/
```

## Available Endpoints

### 1. Assets Endpoint
**GET** `/api/assets`

Returns a comprehensive list of all water tap assets with detailed information.

**Response Structure:**
```json
{
  "items": [...],     // Array of asset objects (primary)
  "assets": [...],    // Array of asset objects (duplicate)
  "count": 10         // Total number of assets
}
```

**Asset Object Structure:**
```json
{
  "id": "string",
  "assetBarcode": "string",
  "status": "ACTIVE|INACTIVE|MAINTENANCE",
  "assetType": "string",
  "primaryIdentifier": "string",
  "secondaryIdentifier": "string",
  "wing": "string",
  "wingInShort": "string",
  "room": "string",
  "floor": "string",
  "floorInWords": "string",
  "roomNo": "string",
  "roomName": "string",
  "filterNeeded": boolean,
  "filtersOn": boolean,
  "filterExpiryDate": "YYYY-MM-DD",
  "filterInstalledOn": "YYYY-MM-DD",
  "notes": "string",
  "augmentedCare": boolean,
  "created": "ISO 8601 timestamp",
  "createdBy": "string",
  "modified": "ISO 8601 timestamp",
  "modifiedBy": "string"
}
```

### 2. Dashboard Endpoint
**GET** `/api/dashboard`

Returns aggregated statistics and breakdowns for dashboard display.

**Response Structure:**
```json
{
  "totalAssets": 10,
  "activeAssets": 10,
  "maintenanceAssets": 0,
  "filtersNeeded": 9,
  "statusBreakdown": {
    "ACTIVE": 10
  },
  "assetTypeBreakdown": {
    "LNS Outlet - TMT": 3,
    "LNS Shower - TMT": 2,
    "Water Tap": 4,
    "Water Cooler": 1
  },
  "wingBreakdown": {
    "Las": 1,
    "Unknown": 6,
    "Test Wing": 1,
    "North Wing": 2
  },
  "filterStatus": {
    "filtersOn": 5,
    "filtersNeeded": 9,
    "augmentedCare": 2
  }
}
```

## Authentication
- All API endpoints require authentication via AWS Cognito
- Users must be logged in to access API endpoints

## Error Responses
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "ISO 8601"
}
```

## Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": {...},           // Response data
  "timestamp": "ISO 8601"
}
```

## Asset Types Found
- LNS Outlet - TMT
- LNS Shower - TMT  
- Water Tap
- Water Cooler

## Status Values
- ACTIVE
- INACTIVE
- MAINTENANCE

## Wing Classifications
- Las (LNS)
- North Wing (N/NW)
- Test Wing
- Unknown (empty wing field)

## Filter Information
- `filterNeeded`: Boolean indicating if filter replacement is needed
- `filtersOn`: Boolean/string indicating if filters are currently installed
- `filterExpiryDate`: Date when current filter expires
- `filterInstalledOn`: Date when filter was installed
- `augmentedCare`: Boolean for special care requirements

## Usage Examples

### Fetch All Assets
```javascript
const response = await fetch('/api/assets');
const data = await response.json();
if (data.success) {
  const assets = data.data.items || data.data.assets || [];
}
```

### Fetch Dashboard Stats
```javascript
const response = await fetch('/api/dashboard');
const data = await response.json();
if (data.success) {
  const stats = data.data;
}
```

## Current Data Summary
- **Total Assets**: 10
- **Active Assets**: 10  
- **Filters Needed**: 9
- **Asset Types**: 4 different types
- **Wings**: 4 different wings/locations
- **Last Updated**: Assets have timestamps from June 2025 