# QSM Day 1 Testing Plan

## Test Data Location
`D:\Work\Coding\archi-query-master\Documents` (398 documents)

## Test Objectives
1. ✅ Verify Python dependencies installed
2. ⏳ Test Docling processing with 10 sample documents
3. ⏳ Measure processing time (<10s per doc target)
4. ⏳ Check table extraction (if present)
5. ⏳ Verify no crashes or errors

## Test Selection (30 documents - UPDATED)
Select diverse sample:
- 20 PDFs (mix of text-based, scanned, small 1-5MB, large 50-100MB)
- 8 DOCX files
- 2 Other files (XLSX, PPTX if available)

## Test Execution
1. **Build**: `npm run build` (skip lib check for UI errors)
2. **Run**: `npm start`
3. **Upload**: Use UI to upload 10 documents
4. **Monitor**: Check console for errors
5. **Verify**: All documents processed successfully

## Success Criteria (Day 1)
- [x] Python installed: docling 2.55.1, torch 2.8.0 ✅
- [x] documentProcessor.ts: 0 compile errors ✅
- [x] RAG Settings added to UI ✅ (chunk size, hardware accel)
- [ ] 30/30 documents processed without crashes
- [ ] Average processing time: <10s per document
- [ ] No critical errors in console
- [ ] Day 1 commit created ✅

## Current Status
- **Python**: ✅ Installed and verified
- **Code**: ✅ Rewritten (Docling-only)
- **Commit**: ✅ Created (ff6e3c0)
- **Testing**: ⏳ PENDING (next step)

## Next Steps
1. Count documents in test folder
2. Build QSM (with skipLibCheck)
3. Start app and test upload
4. Document results
5. Update PROJECT_PLAN.md with test results
