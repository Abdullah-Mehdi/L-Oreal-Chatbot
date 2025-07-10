# 🔧 L'Oréal Beauty Assistant - Troubleshooting Guide

## 🚨 Quick Fix Steps

### If the chatbot isn't working properly:

1. **Check browser console** (F12 → Console tab)
2. **Look for error messages** in the console
3. **Check the application status** - look for initialization messages
4. **Follow the steps below** based on what you see

---

## 📋 Step-by-Step Debugging

### Step 1: Check Configuration Loading

Open browser console and look for:

- ✅ `🚀 Loading L'Oréal Beauty Assistant with Context Tracking...`
- ✅ `✅ App initialized successfully with context tracking`
- ❌ `❌ Configuration not loaded`

**If configuration not loaded:**

- Check that the inline `<script>` tag with `API_CONFIG` and `LOREAL_SYSTEM_PROMPT` is present in the HTML
- Make sure there are no JavaScript syntax errors in the configuration

### Step 2: Check DOM Elements

Look for:

- ✅ `✅ All DOM elements found`
- ❌ `❌ Missing DOM elements`

**If missing DOM elements:**

- Check that HTML has correct IDs: `chatForm`, `userInput`, `chatWindow`
- Make sure script runs after DOM is ready

### Step 3: Check API Connection

Look for:

- ✅ `✅ Health check result: {message: "L'Oréal Beauty Assistant Worker is running!"}`
- ❌ Any network errors

**If API connection fails:**

- Check CloudFlare Worker is deployed
- Verify endpoint URL is correct
- Check CORS settings in Worker

### Step 4: Check API Request/Response

Look for:

- ✅ `📤 Request payload: {...}`
- ✅ `📥 Response received: {status: 200, ok: true}`
- ✅ `📋 API Response data: {...}`

**If API request fails:**

- Check request payload has correct `max_completion_tokens`
- Verify CloudFlare Worker environment variables
- Check OpenAI API key is valid

---

## 🧪 Manual Testing Commands

Open browser console and run these commands:

```javascript
// Test 1: Check configuration
console.log("API_CONFIG:", API_CONFIG);
console.log("LOREAL_SYSTEM_PROMPT length:", LOREAL_SYSTEM_PROMPT?.length);

// Test 2: Test API health
testAPIHealth();

// Test 3: Run full test suite
runTests();

// Test 4: Test specific API call
testAPICall();
```

---

## 🔍 Common Issues & Solutions

### Issue: "Configuration not loaded"

**Solution:**

- Ensure `secrets.js` is loaded before `script.js`
- Check for JavaScript errors preventing `secrets.js` from executing

### Issue: "DOM elements not found"

**Solution:**

- Make sure script runs after DOM is ready
- Check HTML element IDs are correct

### Issue: "Method not allowed" from Worker

**Solution:**

- Update CloudFlare Worker with the improved version from `IMPROVED_WORKER.js`
- Check Worker accepts both GET and POST requests

### Issue: "API key not configured"

**Solution:**

- Add `OPENAI_API_KEY` environment variable in CloudFlare Workers dashboard
- Ensure API key format is correct (starts with `sk-`)

### Issue: Page keeps refreshing

**Solution:**

- Check for JavaScript errors preventing `preventDefault()` from working
- Ensure form handler is properly attached

---

## 📁 Files Overview

- `index.html` - Main application with L'Oréal branding and context tracking
- `script.js` - Main application script with conversation context functionality
- `style.css` - L'Oréal branded styling and responsive design
- `IMPROVED_WORKER.js` - CloudFlare Worker script for OpenAI API integration
- `README.md` - Project documentation and setup instructions
- `img/loreal-logo.png` - L'Oréal Paris logo

---

## 🆘 If Nothing Works

1. Open browser console (F12 → Console tab)
2. Refresh the page and look for initialization messages
3. Check for any red error messages
4. Verify the CloudFlare Worker URL is accessible
5. Test the API endpoint manually if needed

**Console Messages to Look For:**

- `🚀 Loading L'Oréal Beauty Assistant with Context Tracking...`
- `✅ App initialized successfully with context tracking`
- `📋 Loaded user profile:` (if returning user)
- `💭 Loaded conversation context:` (if returning user)

If you see these messages, the app is working correctly!
