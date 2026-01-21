<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1SvwH6CySoAbgHVP7qLve3AfsHdarczsl

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`




Prompt
---

### **Prompt: ระบบดูแลช่วยเหลือนักเรียน 3 ด้าน (Student Care System - Full Option)**

**Role:** Act as a Senior Full Stack Developer & UX/UI Designer.
**Task:** Create a **Single Page Application (SPA)** for a "Student Care System 2025" (ระบบดูแลช่วยเหลือนักเรียน).
**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (Single `index.html` file).
**Database:** `localStorage`.

---

### **1. 🎨 Design & UI Concept**

* **Theme:** "Warm, Safe, and Professional". Use a color-coded system for status.
* **Palette:**
* **Primary (Blue):** `#42A5F5` (General UI)
* **Status Normal (Green):** `#66BB6A` (ปกติ)
* **Status Risk (Orange):** `#FFA726` (กลุ่มเสี่ยง)
* **Status Problem (Red):** `#EF5350` (กลุ่มมีปัญหา)
* **Background:** Light mesh gradient `#F3F6F9`.


* **Components:** Card-based layout, Rounded inputs (Focus glow effect), Badge pills for results, `SweetAlert2` for notifications.

---

### **2. 👥 Authentication**

* **Login Page:**
* **Admin:** Username: `admin`, Password: `0000` (Manages Teachers/Classes).
* **Teacher:** Login by "Teacher ID" (Manages Students/Assessments).



---

### **3. 📱 Core Features (Teacher Dashboard)**

#### **3.1 Student Management**

* **List View:** Table showing Student ID, Name, and **3 Status Badges** (SDQ, EQ, Risk).
* **Profile Modal:** Shows student details, photos (Home Visit), and history of all 3 assessments.

#### **3.2 Assessment Module: The 3 Aspects (แบบประเมิน 3 ด้าน)**

Create a tabbed interface or a menu to select the assessment type for a student:

**Aspect 1: SDQ (Behavior Screening)**

* **Form:** 5 Sections (Emotional, Conduct, Hyperactivity, Peer, Prosocial).
* **Input:** Radio buttons (Not True, Somewhat True, Certainly True).
* **Logic:** Calculate Total Difficulties Score (0-40).
* **Result:**
* 0-15: Normal (Green Badge).
* 16-19: Risk (Orange Badge).
* 20+: Problem (Red Badge).



**Aspect 2: EQ (Emotional Intelligence)**

* **Form:** Assess 3 areas:
1. **Good (เก่ง):** Self-control, Sympathy.
2. **Smart (ดี):** Self-motivation, Problem solving.
3. **Happy (มีสุข):** Self-esteem, Life satisfaction.


* **Input:** 5-10 sample questions (Rating 1-4).
* **Result:** Display score as "Needs Improvement", "Normal", or "High".

**Aspect 3: Risk Screening (การคัดกรองความเสี่ยง)**

* **Form:** Checklist Categories (Yes/No):
1. **Academic:** (Low GPA, Truancy).
2. **Health:** (Chronic illness, Weight/Height).
3. **Family/Economic:** (Poverty, Divorce, Domestic Violence).
4. **Behavior/Safety:** (Drugs, Bullying, Gaming addiction).


* **Logic:** If "Yes" on critical items -> Flag as "Risk Group" or "Problem Group".
* **Result:** Normal (Green) / Risk (Orange) / Problem (Red).

#### **3.3 Home Visit Record (บันทึกเยี่ยมบ้าน)**

* **Features:** Google Maps Link input, Text area for condition, Checkbox for "Needs Scholarship".
* **Photo Upload:** Upload images -> Preview -> Convert to Base64 -> Save.

---

### **4. 📊 Dashboard & Analytics**

* **Overview Chart:** Use **Chart.js** to show a **Bar Chart** comparing the "Risk/Problem" counts across the 3 Aspects (SDQ vs. EQ vs. Risk).
* **Summary Cards:** Total Students, Number of Home Visits completed.

---

### **5. 🛠️ Technical Implementation**

* **One File:** Include HTML, CSS, JS in `index.html`.
* **Data Initialization:** If `localStorage` is empty, auto-generate:
* 1 Admin (`admin`/`0000`).
* 1 Teacher.
* 5 Students (with mixed dummy data results for SDQ, EQ, and Risk to demonstrate the badges).


* **Responsiveness:** Mobile-friendly Sidebar and Tables.

**Deliverable:** Complete HTML source code ready to run.

---

### **จุดสังเกตสำหรับ Prompt นี้:**

1. **รหัส Admin:** เปลี่ยนเป็น `0000` ตามที่ระบุแล้ว
2. **แบบประเมิน 3 ด้าน:** ผมกำหนดโครงสร้างให้ AI เข้าใจชัดเจนคือ
* **SDQ** (พฤติกรรม)
* **EQ** (ความฉลาดทางอารมณ์ - เก่ง ดี มีสุข)
* **Risk Screening** (คัดกรองความเสี่ยง - การเรียน, สุขภาพ, เศรษฐกิจ)


3. **การแสดงผล:** สั่งให้มี **Badge** แยกสีชัดเจน (เขียว/เหลือง/แดง) เพื่อให้ครูดูผาดเดียวก็รู้ว่าเด็กคนไหนน่าเป็นห่วงด้านไหนครับ
