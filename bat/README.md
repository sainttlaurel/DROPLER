# Batch Scripts - Simplified! ✨

> Only 3 files you need

---

## 🚀 The 3 Essential Files

### 1. SETUP.bat - Run Once
**First time setup - does everything automatically**

```bash
bat/SETUP.bat
```

**What it does:**
- ✅ Installs dependencies (npm install)
- ✅ Sets up database
- ✅ Runs ALL migrations (theme, customers, support, chat, legal)
- ✅ Installs react-markdown
- ✅ Everything ready to use!

**When to run:** First time only, or after fresh install

---

### 2. START.bat - Run Daily
**Start the development server**

```bash
bat/START.bat
```

**What it does:**
- ✅ Starts Next.js dev server
- ✅ Opens on http://localhost:3000
- ✅ Hot reload enabled

**When to run:** Every time you want to develop

---

### 3. UTILS.bat - Run As Needed
**Utility menu for common tasks**

```bash
bat/UTILS.bat
```

**Options:**
1. View Database (Prisma Studio)
2. Add Default Categories
3. Update Database Schema
4. Cleanup Documentation
5. Exit

**When to run:** When you need utilities

---

## 📋 Quick Start

### First Time Setup
```bash
# 1. Run setup (only once)
bat/SETUP.bat

# 2. Start server
bat/START.bat

# 3. Visit http://localhost:3000
```

### Daily Development
```bash
# Just start the server
bat/START.bat
```

### Need Utilities?
```bash
# Open utilities menu
bat/UTILS.bat
```

---

## ❓ Why Only 3 Files?

**Before:** 12 separate bat files
- Confusing which to run
- Hard to remember order
- Too many files

**Now:** 3 simple files
- ✅ SETUP.bat - Run once, does everything
- ✅ START.bat - Run daily, starts server
- ✅ UTILS.bat - Run as needed, utilities menu

**Much simpler!** 🎉

---

## 🔍 What Each File Does

### SETUP.bat (Complete Setup)
1. npm install
2. Setup database
3. Theme migration
4. Customer accounts migration
5. Support system migration
6. Chat system migration
7. Legal pages migration
8. Install react-markdown

**Result:** Platform ready to use!

### START.bat (Start Server)
- Runs `npm run dev`
- Server on port 3000
- Press Ctrl+C to stop

### UTILS.bat (Utilities Menu)
**Option 1:** Prisma Studio (view database)
**Option 2:** Add default categories
**Option 3:** Update database schema
**Option 4:** Cleanup documentation

---

## ⚠️ Important Notes

### Before Running SETUP.bat
- Make sure dev server is STOPPED
- Close any database viewers
- First time only

### Running START.bat
- Run every time you develop
- Press Ctrl+C to stop
- Can run multiple times

### Using UTILS.bat
- Interactive menu
- Choose option 1-5
- Safe to run anytime

---

## 🐛 Troubleshooting

### SETUP.bat fails
- Stop dev server (Ctrl+C)
- Close Prisma Studio
- Run as administrator
- Try again

### START.bat - Port in use
- Stop other dev servers
- Kill port: `npx kill-port 3000`
- Try again

### UTILS.bat - Database locked
- Stop dev server
- Close database viewers
- Try again

---

## 📚 Related Documentation

- [README.md](../README.md) - Main documentation
- [QUICK-START-TESTING.md](../QUICK-START-TESTING.md) - Testing guide
- [WHATS-NEXT.md](../WHATS-NEXT.md) - What to do next

---

**Total Files:** 3 (was 12)  
**Setup:** 1 file (SETUP.bat)  
**Daily Use:** 1 file (START.bat)  
**Utilities:** 1 file (UTILS.bat)

**Much simpler!** ✨
