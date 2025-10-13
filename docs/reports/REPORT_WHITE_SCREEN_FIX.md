# 🔧 WHITE SCREEN FIX - QSM on X220

## 🎯 Vấn đề: Cửa sổ trắng khi mở QSM

Bạn đang gặp vấn đề phổ biến: **QSM UI không render** mặc dù app đã chạy.

---

## ✅ QUICK FIX (5 phút)

### **Bước 1: Verify Ollama**

```bash
# Check Ollama running
curl http://localhost:11434/api/tags

# Should see list of models
# If not, start Ollama:
ollama serve &
```

### **Bước 2: Launch QSM Debug Mode**

```bash
cd /home/phi/QSM
./debug-qsm.sh
```

Debug script sẽ:
- ✅ Check Ollama connection
- ✅ Test model response
- ✅ Show console logs
- ✅ Save logs to `/tmp/qsm-debug.log`

### **Bước 3: Khi QSM mở ra (white screen)**

**Mở DevTools:** Press `Ctrl+Shift+I` (hoặc `F12`)

**Check Console tab để xem lỗi:**
- ❌ `Failed to fetch` → Ollama not connected
- ❌ `Cannot read property 'xxx' of undefined` → Missing config
- ❌ `Network error` → Backend không response

### **Bước 4: Configure Ollama trong QSM**

1. **Nếu UI hiện Settings icon** (⚙️):
   - Click Settings (góc phải trên)
   - Tìm "Ollama Configuration"
   - URL: `http://localhost:11434`
   - Model: `llama3.2` hoặc `qwen2.5:3b`
   - Click Save

2. **Nếu không thấy UI** (hoàn toàn trắng):
   - Check DevTools Console (Ctrl+Shift+I)
   - Look for error messages
   - Copy error và báo lại

---

## 🔍 COMMON ISSUES

### **Issue 1: "Failed to fetch" trong Console**

**Nguyên nhân:** Ollama không chạy hoặc sai port

**Fix:**
```bash
# Start Ollama
ollama serve &

# Verify
curl http://localhost:11434/api/tags

# Should see: {"models":[...]}
```

### **Issue 2: "Model not found"**

**Nguyên nhân:** Model chưa pull về

**Fix:**
```bash
# Pull recommended model
ollama pull llama3.2:3b

# Or use existing model
ollama list
```

### **Issue 3: Blank white screen, không có error**

**Nguyên nhân:** Frontend build issue hoặc Electron render process crash

**Fix 1 - Rebuild QSM:**
```bash
cd /home/phi/QSM
npm run build:linux
```

**Fix 2 - Clear cache:**
```bash
rm -rf ~/.config/QSM/
rm -rf ~/.cache/QSM/
```

**Fix 3 - Check GPU acceleration:**
```bash
# Launch with software rendering
QSM - QueryMaster-1.0.0.AppImage --disable-gpu
```

### **Issue 4: "llama runner process has terminated"**

**Nguyên nhân:** Model crash (có thể do RAM không đủ)

**Fix:**
```bash
# Use smaller model
ollama pull llama3.2:1b  # Only 700MB

# Or qwen2.5:3b (better balance)
ollama pull qwen2.5:3b
```

---

## 🧪 DIAGNOSTIC COMMANDS

```bash
# 1. Check if QSM process running
ps aux | grep QSM

# 2. Check Ollama status
curl http://localhost:11434/api/version

# 3. Test model inference
curl -X POST http://localhost:11434/api/chat \
  -d '{"model":"llama3.2","messages":[{"role":"user","content":"test"}],"stream":false}'

# 4. Check QSM logs
cat /tmp/qsm-debug.log

# 5. Check Ollama logs
cat /tmp/ollama.log

# 6. Check system resources
free -h  # RAM usage
df -h    # Disk space
```

---

## 📊 WORKING CONFIGURATION (X220)

**System:**
- RAM: 11GB (QSM needs ~500MB, Ollama+model needs 2-4GB)
- Disk: 68GB free (models take 1-5GB each)
- CPU: 4 cores (should be OK for 3B models)

**Recommended Setup:**
```bash
# Ollama
URL: http://localhost:11434
Model: llama3.2:3b (2GB) or qwen2.5:3b (1.9GB)

# QSM Settings (when UI loads)
Chunk Size: 500 chars
Overlap: 50 chars
Top K Results: 5
Temperature: 0.7
```

---

## 🎯 NEXT STEPS

### **Step 1: Run Debug Mode**
```bash
cd /home/phi/QSM
./debug-qsm.sh
```

### **Step 2: Open DevTools khi white screen**
- Press: `Ctrl+Shift+I`
- Go to Console tab
- Copy any error messages

### **Step 3: Report back với:**
1. Screenshot của Console errors
2. Output của `./debug-qsm.sh`
3. Last 20 lines của `/tmp/qsm-debug.log`

---

## 💡 ALTERNATIVES (Nếu QSM không work)

### **Option 1: Run QSM in dev mode**
```bash
cd /home/phi/QSM
npm run dev
```
This will:
- Show more detailed errors
- Hot reload on changes
- Easier to debug

### **Option 2: Use web version**
```bash
cd /home/phi/QSM
npm run build
npm run preview
```
Open: http://localhost:4173

### **Option 3: Check if it's GPU issue**
```bash
# Launch without GPU acceleration
cd /home/phi/QSM/release
./"QSM - QueryMaster-1.0.0.AppImage" --disable-gpu --no-sandbox
```

---

## 🆘 STILL NOT WORKING?

Run full diagnostic:
```bash
cd /home/phi/QSM
./debug-qsm.sh > /tmp/full-diagnostic.log 2>&1

# Then check:
cat /tmp/full-diagnostic.log
cat /tmp/qsm-debug.log
```

Copy output và báo lại!

---

## ✅ SUCCESS INDICATORS

Khi QSM work properly, bạn sẽ thấy:

1. **Main Window:** 
   - Left sidebar: "Documents", "Upload Files"
   - Center: Query input box
   - Right: Settings icon

2. **Console (Ctrl+Shift+I):**
   - No red errors
   - Maybe some warnings (OK)
   - Network requests to Ollama (http://localhost:11434)

3. **After upload document:**
   - Progress bar appears
   - "Document processed successfully"
   - Can see document in list

4. **After query:**
   - Results appear within 5-10 seconds
   - Citations with links
   - Relevant text excerpts

---

**Current Status:** 
- ✅ Ollama installed and running
- ✅ Models available (llama3.2, qwen2.5:3b, etc)
- ✅ QSM AppImage built (432MB)
- ⚠️ QSM UI not rendering (white screen)

**Next Action:** Run `./debug-qsm.sh` và check console!
