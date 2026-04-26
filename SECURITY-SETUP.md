# Security Setup Guide

## ⚠️ Important: API Token Security

This project uses sensitive API tokens that **MUST NOT** be committed to Git.

## Environment Variables Setup

### 1. Root `.env` File (Shared Secrets)

All API tokens are stored in the **root `.env` file**:

```bash
# .env (in project root)
HF_API_TOKEN=your_huggingface_token
GEMINI_API_KEY=your_gemini_api_key
```

**✅ This file is in `.gitignore` and will NOT be committed to Git**

### 2. Service-Specific Configuration

Each service can have its own `.env` file for service-specific settings:

- `ai-service/.env` - AI service configuration (model names, URLs, etc.)
- Other services can have their own `.env` files as needed

**Service `.env` files should NOT contain API tokens** - they inherit from root `.env`

## How It Works

### Batch Scripts (Windows)

All batch scripts now use `load-env.bat` to load environment variables:

```batch
call load-env.bat
if errorlevel 1 (
    echo Failed to load environment variables!
    pause
    exit /b 1
)
```

This ensures tokens are loaded from `.env` file, not hardcoded.

### Python Services

The AI service loads environment variables in this order:

1. **Root `.env`** - Shared secrets (HF_API_TOKEN, GEMINI_API_KEY)
2. **Local `.env`** - Service-specific config (doesn't override root)

```python
# ai-service/main.py
root_env = Path(__file__).parent.parent / ".env"
local_env = Path(__file__).parent / ".env"

if root_env.exists():
    load_dotenv(root_env)  # Load root .env first
if local_env.exists():
    load_dotenv(local_env, override=False)  # Load local config
```

### Java Services

Java services receive environment variables from the batch scripts that start them:

```batch
start "Baby Preview Service" cmd /k "set HF_API_TOKEN=%HF_API_TOKEN% && java -jar service.jar"
```

## First-Time Setup

1. **Copy the example file:**
   ```bash
   copy .env.example .env
   ```

2. **Edit `.env` and add your actual API keys:**
   ```bash
   HF_API_TOKEN=your_actual_huggingface_token
   GEMINI_API_KEY=your_actual_gemini_key
   ```

3. **Verify `.env` is in `.gitignore`:**
   ```bash
   # Should see .env listed
   type .gitignore | findstr .env
   ```

## Getting API Keys

### Hugging Face Token
1. Go to https://huggingface.co/settings/tokens
2. Create a new token with "Read" access
3. Copy and paste into `.env`

### Google Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy and paste into `.env`

## Security Checklist

- ✅ `.env` file is in `.gitignore`
- ✅ `.env.example` contains template (no real tokens)
- ✅ All batch scripts use `load-env.bat`
- ✅ No hardcoded tokens in any committed files
- ✅ AI service loads from root `.env`
- ✅ Service-specific `.env` files don't contain secrets

## What Was Changed

### Files Updated (No More Hardcoded Tokens):
- ✅ `Run-Services-Jar.bat` - Now uses `load-env.bat`
- ✅ `Run-Services-Mvn.bat` - Now uses `load-env.bat`
- ✅ `restart-ai-and-preview.bat` - Now uses `load-env.bat`
- ✅ `restart-baby-preview-service.bat` - Now uses `load-env.bat`
- ✅ `ai-service/.env` - Tokens removed, only config remains
- ✅ `ai-service/main.py` - Loads from root `.env` first

### Files Created:
- ✅ `.env` - Root environment file (contains actual tokens, NOT committed)
- ✅ `.env.example` - Template file (safe to commit)
- ✅ `load-env.bat` - Helper script to load environment variables
- ✅ `SECURITY-SETUP.md` - This documentation

### Files Updated (Security):
- ✅ `.gitignore` - Added `.env` patterns to prevent commits

## Troubleshooting

### "Failed to load environment variables"
- Make sure `.env` file exists in project root
- Copy from `.env.example` if needed

### "API token not found"
- Check that `.env` contains `HF_API_TOKEN` and `GEMINI_API_KEY`
- Make sure there are no extra spaces around the `=` sign

### Services can't access tokens
- Restart all services after updating `.env`
- Check that `load-env.bat` is being called in the batch script

## Safe to Commit

✅ **These files are safe to commit:**
- `.env.example` (template only)
- `load-env.bat` (no secrets)
- `SECURITY-SETUP.md` (documentation)
- All updated batch scripts (no hardcoded tokens)
- `ai-service/.env` (no secrets, only config)

❌ **NEVER commit:**
- `.env` (contains real API tokens)
- Any file with actual API keys/tokens

---

**Remember:** If you accidentally commit a token, it's compromised! You must:
1. Revoke the old token immediately
2. Generate a new token
3. Update your `.env` file
4. Remove the token from Git history
