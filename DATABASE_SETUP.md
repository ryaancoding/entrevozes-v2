# Database Setup & Persistence Guide

## Overview

Entrevozes uses **MySQL with Drizzle ORM** for persistent data storage. All content (articles, videos, mind maps, quiz questions) is stored in a real database, not in memory.

## Local Development Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Database URL

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your MySQL connection string:

```env
DATABASE_URL=mysql://username:password@localhost:3306/entrevozes
```

### 3. Run Migrations

Generate and apply database migrations:

```bash
# Generate migrations from schema
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Or do both in one command
pnpm db:push
```

### 4. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:5173` and test creating content.

## Database Structure

### Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts and authentication |
| `articles` | Educational articles with summaries and external links |
| `videos` | Video content with metadata |
| `mind_maps` | Mind map structures stored as JSON |
| `quiz_questions` | Quiz questions with multiple choice options |

### Key Fields

**articles table:**
- `title` - Article title
- `slug` - URL-friendly identifier
- `summary` - Brief summary (displayed in list)
- `articleLink` - External URL to full article
- `author` - Article author name
- `status` - pending, approved, or rejected
- `submittedBy` - Email of submitter
- `createdAt`, `updatedAt` - Timestamps

**videos table:**
- `title` - Video title
- `url` - YouTube or video URL
- `description` - Video description
- `thumbnail` - Thumbnail image URL
- `duration` - Video length in seconds
- `status` - pending, approved, or rejected

**mind_maps table:**
- `title` - Mind map title
- `description` - Description
- `content` - JSON structure of the mind map
- `status` - pending, approved, or rejected

**quiz_questions table:**
- `question` - Question text
- `options` - JSON array of answer options
- `correctAnswer` - Index of correct option
- `explanation` - Explanation of correct answer
- `status` - pending, approved, or rejected

## Available Database Commands

```bash
# Generate migrations based on schema changes
pnpm db:generate

# Apply pending migrations
pnpm db:migrate

# Generate + migrate (recommended)
pnpm db:push

# Run tests
pnpm test

# Format code
pnpm format

# Type check
pnpm check
```

## Data Persistence Verification

To verify that data persists correctly:

1. **Create content:**
   - Go to Articles, Videos, Mind Maps, or Quiz tabs
   - Create a new item
   - Submit for moderation

2. **Verify persistence:**
   - Refresh the page (F5)
   - Content should still be visible

3. **Restart server:**
   - Stop the dev server (Ctrl+C)
   - Run `pnpm dev` again
   - Content should still be there

4. **Check database:**
   - Connect to your MySQL database
   - Query the relevant table
   - Verify records exist

## Troubleshooting

### Error: "DATABASE_URL is not set"

**Solution:** Make sure `.env.local` exists and contains `DATABASE_URL`:

```bash
cp .env.example .env.local
# Edit .env.local and add your database URL
```

### Error: "Failed to connect to database"

**Possible causes:**
1. Invalid connection string
2. Database server is down
3. Firewall blocking connection

**Solutions:**
1. Verify the connection string format: `mysql://user:password@host:port/database`
2. Test connection with MySQL client: `mysql -u user -p -h host -P port database`
3. Check database server status

### Migrations fail to apply

**Solution:**
1. Check if database exists
2. Verify user has CREATE/ALTER TABLE permissions
3. Run migrations again: `pnpm db:push`

### Data not showing after restart

**Causes:**
- Data was stored in memory instead of database
- Database connection not properly configured

**Solution:**
1. Verify `DATABASE_URL` is set correctly
2. Check database logs for errors
3. Confirm data exists in database directly

## Schema Modifications

To add new tables or modify existing ones:

1. **Edit schema:** Update `drizzle/schema.ts`
2. **Generate migration:** Run `pnpm db:generate`
3. **Apply migration:** Run `pnpm db:migrate`
4. **Update queries:** Add helpers in `server/db.ts`
5. **Update API:** Add procedures in `server/routers.ts`
6. **Update UI:** Modify components in `client/src/pages/`

## Production Deployment

For Vercel deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions on:
- Creating a production MySQL database
- Configuring environment variables in Vercel
- Running migrations in production
- Monitoring and troubleshooting

## Security Notes

- ✅ Never commit `.env` files (they're in `.gitignore`)
- ✅ Always use environment variables for sensitive data
- ✅ Database credentials are only in Vercel Settings
- ✅ Use strong passwords for production databases
- ✅ Enable SSL/TLS for database connections in production

## Performance Considerations

- Indexes are automatically created on primary keys
- Consider adding indexes to frequently queried fields
- Monitor database size and connection limits
- Use status filtering to reduce query results

## Backup & Recovery

For production databases:
1. Enable automated backups with your provider
2. Test restore procedures regularly
3. Keep backup retention policy
4. Document recovery procedures

## Support

For issues or questions:
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- Review Drizzle ORM docs: https://orm.drizzle.team
- Check MySQL documentation for your provider
