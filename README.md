# WaterSafety - Water Asset Management System

A comprehensive water asset management system built with Next.js, featuring real-time monitoring, maintenance tracking, and automated reporting for water safety compliance.

## Features

- Asset tracking and management with barcode scanning
- Filter expiry monitoring and alerts
- Automated email reports and scheduling
- DynamoDB-backed data storage
- AWS Cognito authentication
- Real-time dashboard with analytics
- Bulk asset import/export capabilities
- Audit logging and compliance tracking

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Library**: Mantine v7
- **Styling**: Tailwind CSS
- **Authentication**: AWS Cognito
- **Database**: AWS DynamoDB
- **Email**: AWS SES
- **Barcode Scanning**: HTML5-QRCode

## Prerequisites

**For Local Development (Recommended):**
- Node.js 18+ and npm only!
- No AWS account or credentials needed

**For Production/AWS Integration:**
- Node.js 18+ and npm
- AWS Account with:
  - DynamoDB access
  - Cognito User Pool (pre-configured)
  - SES for email notifications
  - Valid AWS credentials (Access Key ID and Secret Access Key)

## Local Development Setup (No AWS Required!)

This application can run entirely locally without any AWS services. This is the **recommended setup for development**.

### 1. Clone the repository

```bash
git clone <repository-url>
cd WaterSafety
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Configure for local development

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

The default configuration in `.env.local` enables local-only mode:

```env
# Local Development Mode - No AWS required!
USE_LOCAL_STORAGE=true
NEXT_PUBLIC_USE_LOCAL_AUTH=true
```

**That's it!** You don't need any AWS credentials for local development.

### 4. Run the development server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### What's Different in Local Mode?

When running locally (with `USE_LOCAL_STORAGE=true` and `NEXT_PUBLIC_USE_LOCAL_AUTH=true`):

- **Database**: Uses in-memory storage instead of DynamoDB
  - Sample data is automatically loaded
  - Data persists during the session but resets on restart
  - All CRUD operations work normally

- **Authentication**: Bypasses AWS Cognito
  - Automatically logs you in as a local developer
  - No username/password required
  - You can test auth flows without Cognito

- **Email**: Mocks AWS SES
  - Email content is logged to the console instead of being sent
  - Perfect for testing email features without sending real emails

### Switching to AWS Services

To connect to real AWS services, update your `.env.local`:

```env
# Disable local mode
USE_LOCAL_STORAGE=false
NEXT_PUBLIC_USE_LOCAL_AUTH=false

# Add your AWS credentials
AMPLIFY_ACCESS_KEY_ID=your-actual-aws-access-key
AMPLIFY_SECRET_ACCESS_KEY=your-actual-aws-secret-key
AMPLIFY_AWS_REGION=eu-west-2
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

## AWS Resources

### Cognito Configuration

The application uses AWS Cognito for authentication with the following configuration:
- **User Pool ID**: eu-west-2_uZhfIxAA7
- **Client ID**: 24a2n8fjsq4tvrtfdgtqkp71fl
- **Region**: eu-west-2

### DynamoDB Tables

The application uses the following DynamoDB tables:
- `water-tap-assets` - Main asset data
- `AssetAuditLogs` - Audit trail
- `AssetTypes` - Asset type definitions

## API Endpoints

All API routes are available at `/api/*`. For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

Key endpoints:
- `GET /api/assets` - Retrieve all assets
- `POST /api/assets` - Create new asset
- `GET /api/dashboard` - Get dashboard statistics
- `POST /api/scheduled-reports` - Schedule automated reports

## Project Structure

```
WaterSafety/
├── src/
│   ├── app/           # Next.js App Router pages and API routes
│   ├── components/    # React components
│   ├── contexts/      # React contexts (Auth, etc.)
│   └── lib/           # Utility functions and services
├── public/            # Static assets
├── lambda-backup/     # Lambda function backups
└── lambda-deployment/ # Lambda deployment scripts
```

## Additional Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [AWS Resources Guide](./AWS_RESOURCES_README.md)
- [AWS Cleanup Guide](./AWS_CLEANUP_GUIDE.md)
- [Backup Guide](./BACKUP_GUIDE.md)
- [Bulk Upload Guide](./BULK_UPLOAD_GUIDE.md)
- [Tagging Documentation](./TAGGING_EXPLAINED.md)

## Security Notes

- Never commit AWS credentials to the repository
- The `.env.local` file is gitignored by default
- Ensure proper IAM permissions for AWS services
- Review [AWS_CREDENTIALS_SECURITY_REPORT.md](./AWS_CREDENTIALS_SECURITY_REPORT.md) for security best practices

## Deployment

The application is configured for deployment on AWS Amplify. See [amplify.yml](./amplify.yml) for the build configuration.

## License

Proprietary - St Georges Water Safety Team

## Support

For issues and questions, please contact the Water Safety Team.