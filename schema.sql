CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT DEFAULT 'student'
);

CREATE TABLE courses(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  instructor_id UUID REFERENCES users(id)
);

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  role VARCHAR(20) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assignments(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id),
  title TEXT
);

CREATE TABLE quizzes(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID,
  title TEXT,
  time_limit INT
);

CREATE TABLE questions(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID,
  question TEXT,
  options JSONB,
  correct_answer TEXT
);

CREATE TABLE quiz_attempts(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID,
  user_id UUID,
  answers JSONB,
  score INT
);

CREATE TABLE submissions(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id),
  user_id UUID REFERENCES users(id),
  link TEXT,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

