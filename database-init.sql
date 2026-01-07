# MahaRERA MCQ Certification System - Setup Guide

## 1. Database Schema Setup

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(15),
  registration_no VARCHAR(50) UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  tests_purchased INT DEFAULT 0,
  tests_remaining INT DEFAULT 0,
  referred_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chapters table
CREATE TABLE chapters (
  id SERIAL PRIMARY KEY,
  chapter_number INT NOT NULL,
  title_en TEXT NOT NULL,
  title_mr TEXT NOT NULL,
  questions_easy INT DEFAULT 0,
  questions_moderate INT DEFAULT 0,
  questions_hard INT DEFAULT 0
);

-- MCQ Questions table
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  chapter_id INT REFERENCES chapters(id),
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'moderate', 'hard')),
  question_en TEXT NOT NULL,
  question_mr TEXT NOT NULL,
  option_a_en TEXT NOT NULL,
  option_a_mr TEXT NOT NULL,
  option_b_en TEXT NOT NULL,
  option_b_mr TEXT NOT NULL,
  option_c_en TEXT NOT NULL,
  option_c_mr TEXT NOT NULL,
  option_d_en TEXT NOT NULL,
  option_d_mr TEXT NOT NULL,
  correct_answer CHAR(1) CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation_en TEXT,
  explanation_mr TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test Attempts table
CREATE TABLE test_attempts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  test_level VARCHAR(20) CHECK (test_level IN ('easy', 'moderate', 'hard')),
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  score INT,
  total_questions INT DEFAULT 50,
  status VARCHAR(20) CHECK (status IN ('in_progress', 'submitted', 'auto_submitted')),
  passed BOOLEAN
);

-- Test Responses table
CREATE TABLE test_responses (
  id SERIAL PRIMARY KEY,
  attempt_id INT REFERENCES test_attempts(id),
  question_id INT REFERENCES questions(id),
  user_answer CHAR(1),
  is_correct BOOLEAN,
  marked_for_review BOOLEAN DEFAULT FALSE,
  answered_at TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')),
  tests_granted INT DEFAULT 2,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrals table
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INT REFERENCES users(id),
  referred_email VARCHAR(255) NOT NULL,
  referred_user_id INT REFERENCES users(id),
  reward_granted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert 10 Chapters
INSERT INTO chapters (chapter_number, title_en, title_mr, questions_easy, questions_moderate, questions_hard) VALUES
(1, 'Chapter 1: Introduction to RERA', 'प्रकरण १: रेरा परिचय', 8, 6, 4),
(2, 'Chapter 2: Registration Process', 'प्रकरण २: नोंदणी प्रक्रिया', 7, 6, 5),
(3, 'Chapter 3: Project Registration', 'प्रकरण ३: प्रकल्प नोंदणी', 6, 7, 5),
(4, 'Chapter 4: Agent Registration', 'प्रकरण ४: एजंट नोंदणी', 5, 6, 4),
(5, 'Chapter 5: Rights and Obligations', 'प्रकरण ५: हक्क आणि कर्तव्ये', 5, 6, 6),
(6, 'Chapter 6: Complaints and Disputes', 'प्रकरण ६: तक्रारी आणि विवाद', 4, 5, 5),
(7, 'Chapter 7: Penalties and Offences', 'प्रकरण ७: दंड आणि गुन्हे', 5, 5, 5),
(8, 'Chapter 8: Appellate Tribunal', 'प्रकरण ८: अपील न्यायाधिकरण', 4, 4, 4),
(9, 'Chapter 9: Financial Management', 'प्रकरण ९: आर्थिक व्यवस्थापन', 3, 3, 6),
(10, 'Chapter 10: Code of Conduct', 'प्रकरण १०: आचारसंहिता', 3, 2, 6);
```

## 2. Environment Variables (.env.local)

```env
DATABASE_URL=postgresql://username:password@localhost:5432/maharera_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXT_PUBLIC_ADMIN_EMAIL=estateMakers.in@gmail.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Project Structure

```
maharera-mcq/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── verify/route.ts
│   │   ├── admin/
│   │   │   ├── questions/route.ts
│   │   │   ├── chapters/route.ts
│   │   │   └── users/route.ts
│   │   ├── test/
│   │   │   ├── start/route.ts
│   │   │   ├── submit/route.ts
│   │   │   └── save-answer/route.ts
│   │   ├── payment/route.ts
│   │   └── referral/route.ts
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   ├── questions/page.tsx
│   │   └── users/page.tsx
│   ├── test/
│   │   ├── start/page.tsx
│   │   ├── exam/[attemptId]/page.tsx
│   │   └── result/[attemptId]/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
├── components/
│   ├── TestInterface.tsx
│   ├── QuestionPalette.tsx
│   ├── Timer.tsx
│   ├── LanguageToggle.tsx
│   └── AdminLayout.tsx
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   └── utils.ts
└── package.json
```

## 4. Package Installation

```bash
npm install pg jose bcrypt date-fns
npm install -D @types/pg @types/bcrypt
```

## 5. Next Steps

I'll now create:
1. Database connection utility
2. Authentication middleware (JWT)
3. Admin panel for MCQ management
4. Test interface with timer and bilingual support
5. Payment integration structure
6. Referral system
7. All API routes

Ready to proceed with code implementation?