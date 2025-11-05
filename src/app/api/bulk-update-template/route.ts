import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// Configure DynamoDB client with better error handling
const createDynamoDBClient = () => {
  try {
    const region = process.env.AMPLIFY_AWS_REGION || process.env.AWS_REGION || 'eu-west-2';
    const accessKeyId = process.env.AMPLIFY_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.AMPLIFY_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';

    console.log('DynamoDB Config:', { 
      region, 
      hasAccessKey: !!accessKeyId, 
      hasSecretKey: !!secretAccessKey 
    });

    if (!accessKeyId || !secretAccessKey) {
      console.warn('Missing AWS credentials for DynamoDB');
    }

    const client = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    return DynamoDBDocumentClient.from(client);
  } catch (error) {
    console.error('Error creating DynamoDB client:', error);
    throw error;
  }
};

const ASSETS_TABLE = 'water-tap-assets';

/**
 * Format date for display (YYYY-MM-DD to DD/MM/YYYY)
 */
function formatDateForDisplay(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
}

/**
 * Format boolean for display
 */
function formatBooleanForDisplay(value: any): string {
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === 'false') return lower.toUpperCase();
  }
  return value ? 'TRUE' : 'FALSE';
}

export async function GET(request: NextRequest) {
  console.log('=== BULK UPDATE TEMPLATE DOWNLOAD STARTED ===');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv'; // csv or excel
    const includeData = searchParams.get('includeData') === 'true';

    console.log('Template request:', { format, includeData });

    // Get all assets from DynamoDB (only if includeData is true)
    let assets: any[] = [];
    
    if (includeData) {
      console.log('Fetching assets from DynamoDB for template with data...');
      
      try {
        const ddbClient = createDynamoDBClient();
        let lastEvaluatedKey: any = undefined;
        let totalFetched = 0;
        const maxAssets = 1000; // Limit to prevent timeouts in production
        
        do {
          const scanCommand = new ScanCommand({
            TableName: ASSETS_TABLE,
            ExclusiveStartKey: lastEvaluatedKey,
            Limit: 100 // Process in batches to avoid memory issues
          });
          
          const result = await ddbClient.send(scanCommand);
          
          if (result.Items && result.Items.length > 0) {
            assets.push(...result.Items);
            totalFetched += result.Items.length;
            console.log(`Fetched ${result.Items.length} assets for template (total so far: ${totalFetched})`);
          }
          
          lastEvaluatedKey = result.LastEvaluatedKey;
          
          // Break if we've fetched enough assets to prevent timeouts
          if (totalFetched >= maxAssets) {
            console.log(`Limiting template to ${maxAssets} assets to prevent timeout`);
            break;
          }
          
        } while (lastEvaluatedKey);
        
        console.log(`Total assets fetched for template: ${assets.length}`);
        
      } catch (dbError) {
        console.error('Error fetching assets from DynamoDB:', dbError);
        // Continue with empty template if DB fails
        console.log('Continuing with empty template due to DB error');
        assets = [];
      }
    } else {
      console.log('Creating empty template (no data fetch required)');
    }

    // Define all possible columns based on the asset schema
    const columns = [
      'Asset Barcode',
      'Asset Type',
      'Status',
      'Primary Identifier',
      'Secondary Identifier',
      'Wing',
      'Wing In Short',
      'Room',
      'Floor',
      'Floor In Words',
      'Room No',
      'Room Name',
      'Filter Needed',
      'Filters On',
      'Filter Expiry Date',
      'Filter Installed On',
      'Filter Type',
      'Need Flushing',
      'Notes',
      'Augmented Care',
      'Low Usage Asset',
      'Filter Removed'
    ];

    // Create template data
    const templateData: any[] = [];

    if (includeData && assets.length > 0) {
      // Include existing asset data
      for (const asset of assets) {
        const row: any = {};
        
        // Map database fields to CSV columns
        row['Asset Barcode'] = asset.assetBarcode || '';
        row['Asset Type'] = asset.assetType || '';
        row['Status'] = asset.status || '';
        row['Primary Identifier'] = asset.primaryIdentifier || '';
        row['Secondary Identifier'] = asset.secondaryIdentifier || '';
        row['Wing'] = asset.wing || '';
        row['Wing In Short'] = asset.wingInShort || '';
        row['Room'] = asset.room || '';
        row['Floor'] = asset.floor || '';
        row['Floor In Words'] = asset.floorInWords || '';
        row['Room No'] = asset.roomNo || '';
        row['Room Name'] = asset.roomName || '';
        row['Filter Needed'] = formatBooleanForDisplay(asset.filterNeeded);
        row['Filters On'] = formatBooleanForDisplay(asset.filtersOn);
        row['Filter Expiry Date'] = formatDateForDisplay(asset.filterExpiryDate);
        row['Filter Installed On'] = formatDateForDisplay(asset.filterInstalledOn);
        row['Filter Type'] = asset.filterType || '';
        row['Need Flushing'] = formatBooleanForDisplay(asset.needFlushing);
        row['Notes'] = asset.notes || '';
        row['Augmented Care'] = formatBooleanForDisplay(asset.augmentedCare);
        row['Low Usage Asset'] = formatBooleanForDisplay(asset.lowUsageAsset);
        row['Filter Removed'] = 'FALSE'; // Default to FALSE, user can change to TRUE if needed
        
        templateData.push(row);
      }
    } else {
      // Create empty template with sample data
      const sampleRow: any = {};
      
      sampleRow['Asset Barcode'] = 'SAMPLE-001';
      sampleRow['Asset Type'] = 'Water Tap';
      sampleRow['Status'] = 'ACTIVE';
      sampleRow['Primary Identifier'] = 'Main Water Tap';
      sampleRow['Secondary Identifier'] = 'Kitchen Area';
      sampleRow['Wing'] = 'North Wing';
      sampleRow['Wing In Short'] = 'NW';
      sampleRow['Room'] = 'Kitchen';
      sampleRow['Floor'] = 'Ground Floor';
      sampleRow['Floor In Words'] = 'Ground';
      sampleRow['Room No'] = '101';
      sampleRow['Room Name'] = 'Main Kitchen';
      sampleRow['Filter Needed'] = 'TRUE';
      sampleRow['Filters On'] = 'TRUE';
      sampleRow['Filter Expiry Date'] = '31/12/2024';
      sampleRow['Filter Installed On'] = '01/01/2024';
      sampleRow['Filter Type'] = 'Standard';
      sampleRow['Need Flushing'] = 'FALSE';
      sampleRow['Notes'] = 'Sample notes here';
      sampleRow['Augmented Care'] = 'FALSE';
      sampleRow['Low Usage Asset'] = 'FALSE';
      sampleRow['Filter Removed'] = 'FALSE';
      
      templateData.push(sampleRow);
    }

    console.log(`Creating ${format} template with ${templateData.length} rows`);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData, { header: columns });

    // Set column widths for better readability
    const columnWidths = columns.map(col => ({ width: Math.max(col.length, 15) }));
    worksheet['!cols'] = columnWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');

    // Generate file based on format
    let responseBody: Buffer | string;
    let filename: string;
    let contentType: string;

    try {
      if (format === 'excel') {
        // Excel: Use buffer approach (this works)
        responseBody = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        filename = `bulk-update-template-${new Date().toISOString().split('T')[0]}.xlsx`;
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else {
        // CSV: Use string approach like the working flushlist-template
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        responseBody = csv;
        filename = `bulk-update-template-${new Date().toISOString().split('T')[0]}.csv`;
        contentType = 'text/csv';
      }

      const responseSize = typeof responseBody === 'string' ? responseBody.length : responseBody.length;
      console.log(`Generated ${format} file: ${filename}, size: ${responseSize} bytes`);

      // Return the file with enhanced headers for better compatibility
      return new NextResponse(responseBody, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': responseSize.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          // Add CORS headers for production compatibility
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });

    } catch (xlsxError) {
      console.error('Error generating XLSX/CSV file:', xlsxError);
      throw new Error(`Failed to generate ${format} file: ${xlsxError instanceof Error ? xlsxError.message : 'Unknown error'}`);
    }

  } catch (error) {
    console.error('=== BULK UPDATE TEMPLATE ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Return detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate template';
    const errorDetails = {
      message: errorMessage,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      hasAwsCredentials: !!(process.env.AMPLIFY_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID),
      region: process.env.AMPLIFY_AWS_REGION || process.env.AWS_REGION || 'eu-west-2'
    };

    console.error('Error response details:', errorDetails);

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 