# 🎯 LEGAL & LICENSING GUIDE - QSM OCR PRO

## ⚖️ LEGAL REQUIREMENTS

### 1. Business Entity

**Recommended: LLC (Limited Liability Company)**

Benefits:
- ✅ Personal asset protection
- ✅ Tax flexibility (pass-through)
- ✅ Professional credibility
- ✅ Easy to manage

Cost:
- Formation: $50-500 (depends on state/country)
- Annual fees: $50-300
- Optional: Registered agent ($100/year)

**Formation Steps:**
1. Choose business name
2. File Articles of Organization
3. Get EIN (Employer Identification Number)
4. Create Operating Agreement
5. Open business bank account

**Resources:**
- US: LegalZoom, Incfile, Stripe Atlas
- Vietnam: Doanh nghiệp tư nhân/Công ty TNHH

---

### 2. Software License Agreement

**License Type: Single-User, Perpetual License**

```markdown
QSM OCR PRO - END USER LICENSE AGREEMENT (EULA)

Last Updated: [DATE]

IMPORTANT: READ CAREFULLY BEFORE INSTALLING OR USING THIS SOFTWARE.

1. LICENSE GRANT
   QSM Technologies ("Licensor") grants you ("Licensee") a non-exclusive, 
   non-transferable, perpetual license to use QSM OCR Pro ("Software") 
   on a single computer.

2. PERMITTED USE
   ✅ Install on 1 computer (Mac or Windows)
   ✅ Process unlimited documents
   ✅ Use for personal or commercial purposes
   ✅ Transfer to new computer (deactivate old)

3. RESTRICTIONS
   ❌ Redistribute or resell the Software
   ❌ Reverse engineer or decompile
   ❌ Remove copyright notices
   ❌ Share license key with others
   ❌ Use on multiple computers simultaneously

4. OWNERSHIP
   All rights, title, and interest in the Software remain with Licensor.
   This is a license, not a sale.

5. UPDATES
   You receive free updates for 1 year from purchase date.
   Major version upgrades may require additional payment.

6. WARRANTY DISCLAIMER
   SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.
   LICENSOR DOES NOT WARRANT THAT SOFTWARE WILL BE ERROR-FREE.

7. LIMITATION OF LIABILITY
   IN NO EVENT SHALL LICENSOR BE LIABLE FOR ANY DAMAGES EXCEEDING 
   THE AMOUNT PAID FOR THE SOFTWARE ($15).

8. TERMINATION
   License terminates if you violate these terms.
   You must delete all copies upon termination.

9. REFUND POLICY
   30-day money-back guarantee, no questions asked.

10. GOVERNING LAW
    This agreement is governed by the laws of [YOUR JURISDICTION].

By installing the Software, you agree to these terms.

For questions: support@qsmocr.com
```

---

### 3. Privacy Policy

**Required by: GDPR (EU), CCPA (California), PIPEDA (Canada)**

```markdown
QSM OCR PRO - PRIVACY POLICY

Effective Date: [DATE]

1. INFORMATION WE COLLECT

   a) Purchase Information (via Gumroad):
      - Email address
      - Payment information (processed by Gumroad, not stored by us)
      - License key

   b) Usage Analytics (Optional):
      - OS version (Mac/Windows)
      - App version
      - Feature usage (anonymous)
      - Error reports (crash logs)

   c) Support Requests:
      - Email correspondence
      - Uploaded files (only if you share them for support)

2. DATA PROCESSING

   ✅ Your documents are processed 100% offline/locally
   ✅ We do NOT upload your files to any server
   ✅ We do NOT store your OCR content
   ✅ No cloud sync, no remote access

3. HOW WE USE DATA

   - Deliver license keys
   - Send product updates (optional)
   - Provide customer support
   - Improve software (anonymous analytics)
   - Prevent piracy (license verification)

4. DATA SHARING

   We do NOT sell or rent your data.

   We share data only with:
   - Gumroad (payment processing)
   - Email service (Mailchimp) - if you subscribe
   - Analytics (Mixpanel) - anonymous usage stats

5. YOUR RIGHTS (GDPR/CCPA)

   ✅ Access your data
   ✅ Request deletion
   ✅ Opt-out of emails
   ✅ Export your data

   Contact: privacy@qsmocr.com

6. DATA RETENTION

   - Purchase records: 7 years (tax compliance)
   - Support emails: 2 years
   - Analytics: 1 year
   - Crash reports: 90 days

7. SECURITY

   - SSL/TLS encryption
   - Secure payment via Gumroad
   - Regular security audits

8. CHILDREN'S PRIVACY

   Software is not intended for children under 13.
   We do not knowingly collect data from children.

9. CHANGES TO POLICY

   We will notify you via email of any material changes.

10. CONTACT

    privacy@qsmocr.com
    [Your Business Address]

Last Updated: [DATE]
```

---

### 4. Terms of Service (Website)

```markdown
QSM OCR PRO - TERMS OF SERVICE

1. ACCEPTANCE
   By purchasing or using QSM OCR Pro, you agree to these Terms.

2. LICENSE
   See End User License Agreement (EULA) above.

3. PURCHASE & PAYMENT
   - One-time payment of $15 USD
   - Processed via Gumroad (secure)
   - License key delivered via email
   - 30-day money-back guarantee

4. REFUNDS
   Request within 30 days for full refund.
   Contact: support@qsmocr.com
   License key will be deactivated.

5. SUPPORT
   - Email support: support@qsmocr.com
   - Response time: 24-48 hours
   - Free for 1 year from purchase

6. PROHIBITED USE
   ❌ Illegal activities
   ❌ Spam or phishing
   ❌ Malware distribution
   ❌ Violating copyright

7. DISCLAIMER
   Software provided "as is" without guarantees.
   Use at your own risk.

8. LIMITATION OF LIABILITY
   Our liability is limited to the purchase price ($15).

9. INDEMNIFICATION
   You agree to indemnify us from claims arising from your use.

10. TERMINATION
    We may terminate your license if you violate terms.

11. GOVERNING LAW
    [Your Jurisdiction]

12. CONTACT
    legal@qsmocr.com
```

---

## 🔐 LICENSE KEY SYSTEM

### Implementation:

**1. License Key Format:**
```
QSM-XXXX-XXXX-XXXX-XXXX

Example: QSM-A3F9-8K2L-P7M4-Q1W6

Structure:
- Prefix: QSM (product identifier)
- Segments: 4 blocks of 4 alphanumeric characters
- Checksum: Last 2 characters validate key
```

**2. Generation Algorithm:**
```python
import secrets
import hashlib

def generate_license_key():
    # Generate random segments
    segments = []
    for i in range(3):
        segment = ''.join(secrets.choice('ABCDEFGHJKLMNPQRSTUVWXYZ23456789') 
                         for _ in range(4))
        segments.append(segment)
    
    # Calculate checksum
    data = ''.join(segments)
    checksum = hashlib.sha256(data.encode()).hexdigest()[:4].upper()
    segments.append(checksum)
    
    # Format as QSM-XXXX-XXXX-XXXX-XXXX
    return f"QSM-{'-'.join(segments)}"

# Example:
license_key = generate_license_key()
print(license_key)  # QSM-A3F9-8K2L-P7M4-Q1W6
```

**3. Validation (in app):**
```python
def validate_license_key(key):
    # Check format
    if not key.startswith('QSM-'):
        return False
    
    parts = key.split('-')
    if len(parts) != 5:
        return False
    
    # Validate checksum
    data = ''.join(parts[1:4])
    expected_checksum = hashlib.sha256(data.encode()).hexdigest()[:4].upper()
    
    return parts[4] == expected_checksum

# Usage:
is_valid = validate_license_key("QSM-A3F9-8K2L-P7M4-Q1W6")
```

**4. Online Activation (Optional):**
```python
import requests

def activate_license(key, email, hardware_id):
    response = requests.post('https://api.qsmocr.com/activate', json={
        'license_key': key,
        'email': email,
        'hardware_id': hardware_id  # Unique machine identifier
    })
    
    if response.status_code == 200:
        return response.json()['activation_token']
    else:
        raise Exception("Activation failed")

# Hardware ID generation:
import platform
import hashlib

def get_hardware_id():
    # Combine unique machine identifiers
    data = f"{platform.node()}{platform.machine()}{platform.processor()}"
    return hashlib.sha256(data.encode()).hexdigest()
```

---

## 💳 PAYMENT PROCESSING

### Gumroad Integration:

**1. Setup:**
- Create Gumroad account
- Create product: "QSM OCR Pro"
- Price: $15
- License key delivery: Enabled

**2. Webhook (Auto License Delivery):**
```python
# Flask webhook endpoint
from flask import Flask, request
import hmac
import hashlib

app = Flask(__name__)

@app.route('/gumroad/webhook', methods=['POST'])
def gumroad_webhook():
    # Verify webhook signature
    signature = request.headers.get('X-Gumroad-Signature')
    payload = request.get_data()
    
    expected = hmac.new(
        GUMROAD_WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    if signature != expected:
        return "Invalid signature", 403
    
    # Parse purchase data
    data = request.form
    email = data['email']
    product_id = data['product_id']
    
    # Generate and send license key
    license_key = generate_license_key()
    send_license_email(email, license_key)
    
    # Store in database
    db.insert({
        'email': email,
        'license_key': license_key,
        'purchase_date': datetime.now(),
        'gumroad_sale_id': data['sale_id']
    })
    
    return "OK", 200
```

**3. Email Template (License Delivery):**
```html
Subject: Your QSM OCR Pro License Key 🎉

<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .license-box {
            background: #f0f9ff;
            border: 2px solid #3b82f6;
            padding: 20px;
            border-radius: 8px;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 2px;
        }
    </style>
</head>
<body>
    <h1>Welcome to QSM OCR Pro!</h1>
    
    <p>Thanks for your purchase. Here's your license key:</p>
    
    <div class="license-box">
        QSM-A3F9-8K2L-P7M4-Q1W6
    </div>
    
    <h2>Activation Steps:</h2>
    <ol>
        <li>Open QSM OCR Pro</li>
        <li>Go to Settings → License</li>
        <li>Enter the license key above</li>
        <li>Click "Activate"</li>
    </ol>
    
    <p>
        <a href="https://qsmocr.com/download">Download QSM OCR Pro</a> |
        <a href="https://qsmocr.com/docs">User Guide</a> |
        <a href="mailto:support@qsmocr.com">Support</a>
    </p>
    
    <hr>
    <small>
        Order ID: #12345<br>
        Purchase Date: 2024-01-15<br>
        Email: customer@example.com
    </small>
</body>
</html>
```

---

## 🛡️ ANTI-PIRACY MEASURES

### 1. License Verification:

**Offline Mode (Basic):**
```python
# Check license key format and checksum
def verify_license(key):
    if not validate_license_key(key):
        return False
    
    # Store hashed key in config
    hashed = hashlib.sha256(key.encode()).hexdigest()
    config.set('license_hash', hashed)
    return True
```

**Online Mode (Advanced):**
```python
# Check with server
def verify_license_online(key):
    response = requests.post('https://api.qsmocr.com/verify', json={
        'license_key': key,
        'hardware_id': get_hardware_id()
    })
    
    if response.status_code == 200:
        data = response.json()
        return data['valid'] and data['activations'] < 1  # 1 computer limit
    
    return False
```

### 2. Obfuscation:

**Python Code Obfuscation:**
```bash
# Use PyArmor to protect Python code
pip install pyarmor

# Obfuscate entire project
pyarmor pack --onefile ocr_image_to_word.py

# Or obfuscate specific modules
pyarmor obfuscate --restrict ocr_image_to_word.py
```

### 3. Regular Updates:

- Release updates every 2-4 weeks
- New features incentivize legit purchases
- Old versions gradually become incompatible

### 4. Reasonable Protection:

**Philosophy:**
- Don't make DRM too aggressive (hurts legit users)
- Price is low ($15), reduces piracy incentive
- Focus on value, not just protection

**Accept:**
- Some piracy is inevitable
- 5-10% piracy rate is normal
- Better UX > perfect protection

---

## 📜 OPEN SOURCE COMPLIANCE

### Libraries Used & Licenses:

**1. Docling (Apache 2.0)**
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Must include license notice
- ✅ State changes

**2. EasyOCR (Apache 2.0)**
- ✅ Commercial use allowed
- ✅ Must include license notice

**3. Python-docx (MIT)**
- ✅ Commercial use allowed
- ✅ Must include license notice

**4. Pillow (HPND - Historical Permission Notice and Disclaimer)**
- ✅ Commercial use allowed
- ✅ Must include license notice

**5. ReportLab (BSD)**
- ✅ Commercial use allowed
- ✅ Must include license notice

**6. EbookLib (AGPL 3.0 - ⚠️ WATCH OUT!)**
- ⚠️ Copyleft license
- ⚠️ If you modify, must release source
- ✅ OK to use as-is without modifications
- ✅ Commercial use allowed

**Compliance:**
```markdown
# THIRD-PARTY-LICENSES.md

QSM OCR Pro uses the following open source libraries:

1. Docling (Apache 2.0)
   Copyright IBM Corporation
   https://github.com/DS4SD/docling
   [Include full Apache 2.0 license text]

2. EasyOCR (Apache 2.0)
   Copyright JaidedAI
   https://github.com/JaidedAI/EasyOCR
   [Include full Apache 2.0 license text]

3. Python-docx (MIT)
   Copyright Steve Canny
   https://github.com/python-openxml/python-docx
   [Include full MIT license text]

4. Pillow (HPND)
   Copyright PIL Software
   https://github.com/python-pillow/Pillow
   [Include full HPND license text]

5. ReportLab (BSD)
   Copyright ReportLab Inc.
   https://www.reportlab.com/
   [Include full BSD license text]

6. EbookLib (AGPL 3.0)
   Copyright Aleksandar Erkalović
   https://github.com/aerkalov/ebooklib
   [Include full AGPL 3.0 license text]

Full license texts available in /licenses/ directory.
```

**Include in App:**
- Settings → About → Third-Party Licenses
- Bundle license files in installer
- Display in "About" dialog

---

## 🌍 INTERNATIONAL CONSIDERATIONS

### 1. VAT/GST (Europe, UK, Australia):

**Gumroad handles this automatically:**
- Collects VAT in EU
- Remits to tax authorities
- Issues VAT invoices

**Your responsibility:**
- Register for VAT if revenue > threshold
- EU: €10,000
- UK: £85,000

### 2. Sales Tax (USA):

**Nexus states:**
- If you have "presence" in a state, collect sales tax
- Physical presence: Office, employees
- Economic nexus: >$100K revenue in state

**Gumroad:**
- Can collect US sales tax
- You remit to states

**Alternative:**
- Use Paddle (handles all taxes globally)

### 3. Export Restrictions:

**Encryption:**
- OCR software doesn't use strong encryption
- No export restrictions for most countries

**Sanctioned countries:**
- Don't sell to: North Korea, Iran, Syria, Cuba
- Gumroad blocks automatically

---

## ✅ LEGAL CHECKLIST

### Before Launch:

**Business:**
- [ ] Form LLC (or equivalent)
- [ ] Get EIN/Tax ID
- [ ] Open business bank account
- [ ] Register domain name
- [ ] Trademark "QSM OCR Pro" (optional)

**Legal Documents:**
- [ ] End User License Agreement (EULA)
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Refund Policy
- [ ] Third-Party Licenses

**Payment:**
- [ ] Setup Gumroad (or Paddle)
- [ ] Test purchase flow
- [ ] Configure webhook
- [ ] Test refund process

**Compliance:**
- [ ] GDPR compliance (if targeting EU)
- [ ] CCPA compliance (if targeting California)
- [ ] Cookie consent (website)
- [ ] Accessibility (WCAG 2.1)

**Protection:**
- [ ] Implement license key system
- [ ] Code obfuscation (optional)
- [ ] Online activation (optional)
- [ ] Auto-update mechanism

**Insurance (Optional but Recommended):**
- [ ] General Liability Insurance ($300-500/year)
- [ ] Cyber Liability Insurance ($1,000-2,000/year)
- [ ] Errors & Omissions Insurance ($500-1,000/year)

---

## 📧 LEGAL SUPPORT RESOURCES

**Affordable Legal Help:**

1. **LegalZoom** - Document templates ($39-199)
2. **Rocket Lawyer** - Subscription ($40/month)
3. **UpCounsel** - On-demand lawyers ($200-500/hour)
4. **Indie Hackers Forum** - Free advice from founders

**Free Resources:**

- **Termly** - Free privacy policy generator
- **GetTerms** - Free terms of service templates
- **Creative Commons** - Open source license info

**When to Hire a Lawyer:**

✅ Large investment (>$50K revenue/year)
✅ International expansion
✅ VC funding
✅ Legal threats

❌ Initial launch (templates OK)
❌ Small side project (<$10K/year)

---

## 🎯 SUMMARY

### Minimum Viable Legal (MVL):

**Must Have:**
1. ✅ EULA (license agreement)
2. ✅ Privacy Policy
3. ✅ Refund Policy
4. ✅ Third-Party License notices
5. ✅ Payment processor (Gumroad)

**Nice to Have:**
- Business entity (LLC)
- Trademark
- Lawyer review
- Insurance

**Can Wait:**
- Patents
- Complex DRM
- International tax registration

**Start Simple → Scale Up as Revenue Grows**

Total Legal Cost (Year 1): $500-1,500
- LLC formation: $50-500
- Legal templates: $100-300
- Payment fees: 5% of revenue

**You're legally covered for launch! 🚀**
