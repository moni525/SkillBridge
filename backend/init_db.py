import sqlite3
import bcrypt

def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # Drop existing tables to start fresh
    cursor.execute('DROP TABLE IF EXISTS users')
    cursor.execute('DROP TABLE IF EXISTS events')
    cursor.execute('DROP TABLE IF EXISTS mentors')
    cursor.execute('DROP TABLE IF EXISTS mentor_requests')
    cursor.execute('DROP TABLE IF EXISTS resources')
    cursor.execute('DROP TABLE IF EXISTS mentor_bookings')
    cursor.execute('DROP TABLE IF EXISTS bookings')
    cursor.execute('DROP TABLE IF EXISTS projects')
    cursor.execute('DROP TABLE IF EXISTS project_plans')
    cursor.execute('DROP TABLE IF EXISTS skill_paths')
    cursor.execute('DROP TABLE IF EXISTS skill_tasks')
    cursor.execute('DROP TABLE IF EXISTS books')
    cursor.execute('DROP TABLE IF EXISTS book_copies')
    cursor.execute('DROP TABLE IF EXISTS book_reservations')
    cursor.execute('DROP TABLE IF EXISTS library_notifications')

    # CREATE TABLES
    cursor.execute('''
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student'
    )
    ''')

    cursor.execute('''
    CREATE TABLE events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT NOT NULL,
        type TEXT NOT NULL
    )
    ''')

    cursor.execute('''
    CREATE TABLE mentors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        mentor_type TEXT NOT NULL,
        department TEXT NOT NULL,
        domains TEXT NOT NULL,
        availability TEXT NOT NULL,
        contact_email TEXT NOT NULL
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE mentor_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        mentor_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (mentor_id) REFERENCES mentors(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        available_from TEXT NOT NULL,
        available_to TEXT NOT NULL
    )
    ''')

    cursor.execute('''
    CREATE TABLE mentor_bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        mentor_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (mentor_id) REFERENCES mentors(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        resource_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (resource_id) REFERENCES resources(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        domain TEXT NOT NULL,
        description TEXT,
        progress INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE project_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        weekly_tasks TEXT NOT NULL,
        mentors_suggested TEXT NOT NULL,
        resources_needed TEXT NOT NULL,
        resume_description TEXT,
        tech_stack TEXT,
        required_skills TEXT,
        risk_warnings TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (student_id) REFERENCES users(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE skill_paths (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        goal TEXT NOT NULL,
        current_skills TEXT,
        time_available TEXT NOT NULL,
        domain TEXT NOT NULL,
        roadmap_json TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE skill_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        path_id INTEGER NOT NULL,
        week_number INTEGER NOT NULL,
        task_text TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (path_id) REFERENCES skill_paths(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        subject TEXT NOT NULL,
        total_copies INTEGER NOT NULL,
        shelf_location TEXT NOT NULL,
        book_pdf TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE book_copies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        return_due_date TEXT,
        FOREIGN KEY (book_id) REFERENCES books(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE book_reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_copy_id INTEGER NOT NULL,
        reservation_date TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (book_copy_id) REFERENCES book_copies(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE library_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (book_id) REFERENCES books(id)
    )
    ''')

    # INSERT MOCK DATA
    # Create a default test user
    default_password = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cursor.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ('Alice Smith', 'alice@rmkcet.ac.in', default_password, 'student')
    )

    events_data = [
        ('AI Hackathon 2026', 'Tomorrow', '9:00 AM', 'Main Auditorium', 'Hackathon'),
        ('Cloud Computing Workshop', 'Next Week', '2:00 PM', 'Lab 4', 'Workshop'),
        ('Alumni Meet & Greet', 'Friday', '5:00 PM', 'Open Air Theatre', 'Networking')
    ]
    cursor.executemany('INSERT INTO events (title, date, time, location, type) VALUES (?, ?, ?, ?, ?)', events_data)

    mentors_data = [
        ('Dr. Ramesh K', 'Faculty Mentor', 'Artificial Intelligence & Data Science', 'AI/ML, Data Science, Cloud Computing', 'Mon & Wed 3PM-5PM', 'ramesh.ai@rmkcet.ac.in'),
        ('Prof. Geetha M', 'Research Guide', 'Computer Science and Engineering', 'Cybersecurity, IoT', 'Tue & Thu 10AM-12PM', 'geetha.cse@rmkcet.ac.in'),
        ('Karthik S', 'Senior Student Mentor', 'Information Technology', 'Full Stack, Web Development', 'Weekends 10AM-12PM', 'karthik.it22@rmkcet.ac.in'),
        ('Anjali V', 'Senior Student Mentor', 'Computer Science and Engineering', 'Competitive Programming, Data Science', 'Fri 4PM-6PM', 'anjali.cse21@rmkcet.ac.in'),
        ('Dr. Suresh P', 'Faculty Mentor', 'Electronics and Communication Engineering', 'IoT, Cloud Computing', 'Mon & Fri 1PM-3PM', 'suresh.ece@rmkcet.ac.in')
    ]
    cursor.executemany('INSERT INTO mentors (name, mentor_type, department, domains, availability, contact_email) VALUES (?, ?, ?, ?, ?, ?)', mentors_data)

    resources_data = [
        ('High-Performance Computing Lab', 'Block A, Room 101', '08:00', '20:00'),
        ('VR & AR Studio', 'Block B, Room 205', '09:00', '17:00'),
        ('Hardware IoT Lab', 'Block C, Room 303', '08:00', '18:00')
    ]
    cursor.executemany('INSERT INTO resources (name, location, available_from, available_to) VALUES (?, ?, ?, ?)', resources_data)

    books_data = [
        ('Introduction to Algorithms', 'Thomas H. Cormen', 'Computer Science', 3, 'Shelf A1', 'https://example.com/algo.pdf'),
        ('Clean Code', 'Robert C. Martin', 'Software Engineering', 2, 'Shelf B2', None),
        ('Artificial Intelligence: A Modern Approach', 'Stuart Russell', 'Artificial Intelligence', 1, 'Shelf C3', 'https://example.com/ai.pdf'),
        ('Deep Learning', 'Ian Goodfellow', 'Machine Learning', 2, 'Shelf C1', 'https://example.com/dl.pdf'),
        ('Pattern Recognition', 'Christopher M. Bishop', 'Machine Learning', 1, 'Shelf C2', None),
        ('Concepts of Physics', 'H.C. Verma', 'Physics', 4, 'Shelf P1', None),
        ('Higher Engineering Mathematics', 'B.S. Grewal', 'Mathematics', 5, 'Shelf M1', None),
        ('Microelectronic Circuits', 'Adel S. Sedra', 'Electronics', 3, 'Shelf E1', None),
        ('Digital Design', 'M. Morris Mano', 'VLSI', 2, 'Shelf V1', 'https://example.com/dd.pdf'),
        ('Computer Networking', 'James F. Kurose', 'Computer Networks', 3, 'Shelf N1', None),
        ('Operating System Concepts', 'Abraham Silberschatz', 'Computer Science', 4, 'Shelf A2', None),
        ('Fundamentals of Logic Design', 'Charles H. Roth', 'Electronics', 2, 'Shelf E2', None),
        ('CMOS VLSI Design', 'Neil H.E. Weste', 'VLSI', 1, 'Shelf V2', None)
    ]
    cursor.executemany('INSERT INTO books (title, author, subject, total_copies, shelf_location, book_pdf) VALUES (?, ?, ?, ?, ?, ?)', books_data)

    copies_data = [
        (1, 'Available', None), (1, 'Borrowed', '2026-03-01'), (1, 'Available', None),
        (2, 'Borrowed', '2026-02-28'), (2, 'Borrowed', '2026-02-27'),
        (3, 'Available', None),
        (4, 'Available', None), (4, 'Available', None),
        (5, 'Borrowed', '2026-03-05'),
        (6, 'Available', None), (6, 'Available', None), (6, 'Available', None), (6, 'Borrowed', '2026-03-02'),
        (7, 'Available', None), (7, 'Available', None), (7, 'Available', None), (7, 'Available', None), (7, 'Available', None),
        (8, 'Available', None), (8, 'Available', None), (8, 'Borrowed', '2026-03-04'),
        (9, 'Available', None), (9, 'Borrowed', '2026-03-01'),
        (10, 'Available', None), (10, 'Available', None), (10, 'Available', None),
        (11, 'Available', None), (11, 'Available', None), (11, 'Borrowed', '2026-02-28'), (11, 'Borrowed', '2026-03-02'),
        (12, 'Available', None), (12, 'Available', None),
        (13, 'Available', None)
    ]
    cursor.executemany('INSERT INTO book_copies (book_id, status, return_due_date) VALUES (?, ?, ?)', copies_data)

    conn.commit()
    conn.close()
    print("Database fully initialized with relational schemas and mock data!")

if __name__ == '__main__':
    init_db()
