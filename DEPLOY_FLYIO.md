# Deploy to Fly.io

Fly.io is great for Docker-based deployments with global edge locations.

## Prerequisites

1. **GitHub account**
2. **Fly.io account** - Sign up at https://fly.io (free)
3. **Docker** (optional, for local testing)

## Step-by-Step Deployment

### Step 1: Install Fly CLI

```bash
# macOS
curl -L https://fly.io/install.sh | sh

# Or using Homebrew
brew install flyctl

# Verify installation
flyctl version
```

### Step 2: Login to Fly.io

```bash
flyctl auth login
```

This will open your browser to authenticate.

### Step 3: Initialize Your App

From your project directory:

```bash
flyctl launch
```

This will:
- Detect your Dockerfile
- Ask for app name (or generate one)
- Ask for region (choose closest to you)
- Create `fly.toml` configuration file

### Step 4: Configure Environment Variables

```bash
flyctl secrets set MINO_API_KEY=sk-mino-kyyCNJHechyq8fR9q22EQFxs5TE3IcXf
flyctl secrets set DB_PATH=/tmp/price_monitor.db
flyctl secrets set PYTHONUNBUFFERED=1
```

### Step 5: Deploy

```bash
flyctl deploy
```

Your app will be live at: `https://your-app-name.fly.dev`

## Configuration File

Fly.io creates a `fly.toml` file. You can customize it:

```toml
app = "your-app-name"
primary_region = "iad"  # Change to your preferred region

[build]

[env]
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

## Fly.io Free Tier

- **3 shared-cpu-1x VMs** (256MB RAM each)
- **3GB persistent volume storage**
- **160GB outbound data transfer**
- **No sleep** (machines auto-stop/start)

## Scaling

```bash
# Scale to 2 instances
flyctl scale count 2

# Scale memory
flyctl scale vm shared-cpu-2x --memory 512
```

## Custom Domain

```bash
# Add domain
flyctl domains add yourdomain.com

# Check DNS
flyctl domains show
```

Fly.io provides free SSL certificates.

## Database Options

Fly.io offers managed Postgres:

```bash
# Create Postgres database
flyctl postgres create --name your-db-name

# Attach to app
flyctl postgres attach --app your-app-name your-db-name
```

## Monitoring

```bash
# View logs
flyctl logs

# View metrics
flyctl status

# SSH into VM
flyctl ssh console
```

## Troubleshooting

### Issue: Build fails
- Check Dockerfile is correct
- Verify all dependencies in requirements.txt
- Check build logs: `flyctl logs`

### Issue: App not responding
- Check logs: `flyctl logs`
- Verify PORT environment variable matches fly.toml
- Check VM status: `flyctl status`

## Support

- **Fly.io Docs**: https://fly.io/docs
- **Community**: https://community.fly.io
- **Status**: https://status.fly.io

