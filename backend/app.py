from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import jwt
import bcrypt
import datetime
import os
import json
import google.generativeai as genai
from functools import wraps
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "dummy_key"))

app = Flask(__name__)
# Enable CORS for all routes and origins to allow headers like Authorization
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SECRET_KEY'] = 'your_super_secret_key_here_for_demo'

def get_db_connection():
    conn = sqlite3.connect('database.db', timeout=5) # Prevent lock errors
    conn.row_factory = sqlite3.Row
    return conn

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user_id = data['user_id']
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user_id, *args, **kwargs)
    return decorated

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')
    
    if not email or not password or not name:
        return jsonify({'message': 'Missing required fields'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check existing
    if cursor.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone():
        conn.close()
        return jsonify({'message': 'User already exists'}), 400
        
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cursor.execute('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', 
                   (name, email, hashed_pw, role))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Registration successful!'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'success': True, 
            'token': token, 
            'user': {'id': user['id'], 'name': user['name'], 'role': user['role']}
        })
        
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/me', methods=['GET'])
@token_required
def get_me(current_user_id):
    conn = get_db_connection()
    user = conn.execute('SELECT id, name, email, role FROM users WHERE id = ?', (current_user_id,)).fetchone()
    conn.close()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    return jsonify(dict(user))

@app.route('/events', methods=['GET'])
def get_events():
    conn = get_db_connection()
    events = conn.execute('SELECT * FROM events').fetchall()
    conn.close()
    
    return jsonify([dict(row) for row in events])

@app.route('/mentors', methods=['GET'])
def get_mentors():
    conn = get_db_connection()
    mentors = conn.execute('SELECT * FROM mentors').fetchall()
    conn.close()
    
    return jsonify([dict(row) for row in mentors])

@app.route('/mentor-requests', methods=['POST'])
@token_required
def book_mentor(current_user_id):
    data = request.json
    mentor_id = data.get('mentor_id')
    message = data.get('message', '')
    
    conn = get_db_connection()
    # Check if already requested
    existing = conn.execute('SELECT id FROM mentor_requests WHERE student_id = ? AND mentor_id = ?', (current_user_id, mentor_id)).fetchone()
    if existing:
        conn.close()
        return jsonify({'message': 'You have already sent a request to this mentor!'}), 400
        
    conn.execute('INSERT INTO mentor_requests (student_id, mentor_id, message, status) VALUES (?, ?, ?, ?)', 
                 (current_user_id, mentor_id, message, 'pending'))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Mentorship request sent successfully!'})

@app.route('/projects', methods=['POST'])
@token_required
def save_project(current_user_id):
    data = request.json
    title = data.get('title')
    domain = data.get('domain')
    description = data.get('description', '')
        
    try:
        if os.environ.get("GEMINI_API_KEY", "dummy_key") == "dummy_key":
            return jsonify({'success': False, 'message': 'Missing API Key! Please add it to the .env file.'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Save base project
        cursor.execute('INSERT INTO projects (user_id, title, domain, description) VALUES (?, ?, ?, ?)', 
                       (current_user_id, title, domain, description))
        project_id = cursor.lastrowid
        
        # Fetch mentors and resources for AI context
        mentors = conn.execute('SELECT name, mentor_type, domains, department FROM mentors').fetchall()
        resources = conn.execute('SELECT name, location FROM resources').fetchall()
        
        mentors_ctx = "\n".join([f"- {m['name']} ({m['mentor_type']}, {m['department']}): {m['domains']}" for m in mentors])
        resources_ctx = "\n".join([f"- {r['name']} ({r['location']})" for r in resources])
        
        prompt = f"""You are an expert technical project architect for RMKCET university.
A student wants to build the following project:
Title: {title}
Domain: {domain}
Description: {description}

Here are the available campus mentors:
{mentors_ctx}

Here are the available campus labs/resources:
{resources_ctx}

Generate a comprehensive project plan. Return ONLY a structured JSON response exactly matching this schema. Do not enclose it in markdown blocks like ```json.
{{
  "weekly_tasks": [
    {{"week": 1, "task": "Week 1 main goal", "details": "Specific actionable steps for week 1"}}
  ],
  "tech_stack": ["Tech 1", "Tech 2"],
  "required_skills": ["Skill 1", "Skill 2"],
  "risk_warnings": ["Risk 1", "Risk 2"],
  "resume_description": "A 2-3 sentence professional elevator pitch for this project suitable for a resume.",
  "mentors_suggested": [
    {{"name": "Mentor Name exactly as listed above", "reason": "Why this mentor"}}
  ],
  "resources_needed": [
    {{"name": "Lab Name exactly as listed above", "reason": "What this lab is needed for"}}
  ]
}}"""

        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        if text.startswith('```json'):
            text = text[7:]
            if text.endswith('```'):
                text = text[:-3]
        text = text.strip()
            
        plan_json = json.loads(text)
        
        # Save plan to db
        cursor.execute('''INSERT INTO project_plans 
            (project_id, student_id, weekly_tasks, mentors_suggested, resources_needed, resume_description, tech_stack, required_skills, risk_warnings) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (project_id, current_user_id, json.dumps(plan_json.get('weekly_tasks', [])), 
             json.dumps(plan_json.get('mentors_suggested', [])), json.dumps(plan_json.get('resources_needed', [])),
             plan_json.get('resume_description', ''), json.dumps(plan_json.get('tech_stack', [])),
             json.dumps(plan_json.get('required_skills', [])), json.dumps(plan_json.get('risk_warnings', []))))
             
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': 'AI Project Plan generated successfully!',
            'plan': plan_json
        })
        
    except Exception as e:
        print("AI Project Planner Error:", str(e))
        return jsonify({'success': False, 'message': f'Failed to generate plan. Error: {str(e)}'}), 500

@app.route('/my-projects', methods=['GET'])
@token_required
def get_my_projects(current_user_id):
    conn = get_db_connection()
    projects = conn.execute('SELECT * FROM projects WHERE user_id = ?', (current_user_id,)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in projects])

@app.route('/resources', methods=['GET'])
def get_resources():
    conn = get_db_connection()
    resources = conn.execute('SELECT * FROM resources').fetchall()
    conn.close()
    
    return jsonify([dict(row) for row in resources])

@app.route('/book-resource', methods=['POST'])
@token_required
def book_resource(current_user_id):
    data = request.json
    resource_id = data.get('resource_id')
    date_str = datetime.datetime.now().strftime("%Y-%m-%d")
        
    conn = get_db_connection()
    
    # Check bounds
    existing = conn.execute('SELECT id FROM bookings WHERE user_id = ? AND resource_id = ? AND date = ?', (current_user_id, resource_id, date_str)).fetchone()
    if existing:
        conn.close()
        return jsonify({'message': 'You already booked this lab today!'}), 400
        
    existing_slot = conn.execute('SELECT id FROM bookings WHERE resource_id = ? AND date = ?', (resource_id, date_str)).fetchall()
    if len(existing_slot) >= 3: # 3 slots max per day for mock
        conn.close()
        return jsonify({'message': 'Resource is fully booked for today!'}), 400
        
    time_str = datetime.datetime.now().strftime("%H:%M")
    
    conn.execute('INSERT INTO bookings (user_id, resource_id, date, time) VALUES (?, ?, ?, ?)', 
                 (current_user_id, resource_id, date_str, time_str))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Resource booked successfully!'})

@app.route('/my-bookings', methods=['GET'])
@token_required
def get_my_bookings(current_user_id):
    conn = get_db_connection()
    # Join with resources
    lab_bookings = conn.execute('''
        SELECT b.id, b.date, b.time, r.name as target_name, 'Lab' as type
        FROM bookings b
        JOIN resources r ON b.resource_id = r.id
        WHERE b.user_id = ?
    ''', (current_user_id,)).fetchall()
    
    # Join with mentors
    mentor_bookings = conn.execute('''
        SELECT b.id, b.created_at as date, 'Pending Request' as time, m.name as target_name, 'Mentor' as type
        FROM mentor_requests b
        JOIN mentors m ON b.mentor_id = m.id
        WHERE b.student_id = ?
    ''', (current_user_id,)).fetchall()
    
    conn.close()
    all_bookings = [dict(row) for row in lab_bookings] + [dict(row) for row in mentor_bookings]
    return jsonify(all_bookings)

@app.route('/dashboard-data', methods=['GET'])
@token_required
def get_dashboard_data(current_user_id):
    conn = get_db_connection()
    
    upcoming_events = conn.execute('SELECT * FROM events LIMIT 3').fetchall()
    active_projects = conn.execute('SELECT * FROM projects WHERE user_id = ? LIMIT 2', (current_user_id,)).fetchall()
    
    lab_b = conn.execute('''
        SELECT b.date, b.time, r.name as item_name
        FROM bookings b
        JOIN resources r ON b.resource_id = r.id
        WHERE b.user_id = ?
    ''', (current_user_id,)).fetchall()
    
    mentor_b = conn.execute('''
        SELECT b.created_at as date, 'Pending' as time, m.name as item_name
        FROM mentor_requests b
        JOIN mentors m ON b.mentor_id = m.id
        WHERE b.student_id = ?
    ''', (current_user_id,)).fetchall()
    
    my_bookings = [dict(b) for b in lab_b] + [dict(b) for b in mentor_b]
    
    recommended_mentors = conn.execute('SELECT * FROM mentors LIMIT 2').fetchall()
    
    conn.close()
    
    return jsonify({
        'upcoming_events': [dict(e) for e in upcoming_events],
        'active_projects': [dict(p) for p in active_projects],
        'my_bookings': my_bookings[:2],
        'recommended_mentors': [dict(m) for m in recommended_mentors]
    })

@app.route('/skill-path', methods=['POST'])
@token_required
def generate_skill_path(current_user_id):
    data = request.json
    goal = data.get('goal')
    current_skills = data.get('current_skills', 'None')
    time_available = data.get('time_available', '10 hours/week')
    domain = data.get('domain', 'General')
    
    prompt = f"""You are SkillBridge AI for RMKCET students.
Based on student's goal, current skills, and time,
generate a weekly roadmap including:
• Skills to learn
• Project ideas
• Hackathons to join
• Mentors to contact
• Resources to study

Student Goal: {goal}
Current Skills: {current_skills}
Time Available: {time_available}
Preferred Domain: {domain}

Return ONLY a structured JSON response exactly matching this schema. Do not enclose it in markdown blocks like ```json.
{{
  "weeks": [
    {{
      "week_number": 1,
      "focus": "Week Focus String",
      "skills_to_learn": ["Skill 1", "Skill 2"],
      "project_ideas": ["Project Idea String"],
      "hackathons": ["Hackathon String"],
      "mentors": ["Mentor Domain String"],
      "resources": ["Resource Link String"],
      "tasks": ["Specific Actionable Task 1", "Specific Actionable Task 2", "Specific Actionable Task 3"]
    }}
  ]
}}"""
    try:
        if os.environ.get("GEMINI_API_KEY", "dummy_key") == "dummy_key":
            return jsonify({'success': False, 'message': 'Missing API Key! Please add it to the .env file in the backend folder and restart the backend.'}), 400
            
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Strip potential markdown formatting from the response
        if text.startswith('```json'):
            text = text[7:]
            if text.endswith('```'):
                text = text[:-3]
        text = text.strip()
            
        roadmap_json = json.loads(text)
        
        # Save to DB
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO skill_paths (user_id, goal, current_skills, time_available, domain, roadmap_json) VALUES (?, ?, ?, ?, ?, ?)',
                     (current_user_id, goal, current_skills, time_available, domain, json.dumps(roadmap_json)))
                     
        path_id = cursor.lastrowid
        
        for week in roadmap_json.get('weeks', []):
            week_num = week.get('week_number', 1)
            # Gemini sometimes hallucinates "actionable_tasks" instead of "tasks"
            tasks_list = week.get('tasks', week.get('actionable_tasks', []))
            
            for task in tasks_list:
                cursor.execute('INSERT INTO skill_tasks (user_id, path_id, week_number, task_text, status) VALUES (?, ?, ?, ?, ?)',
                             (current_user_id, path_id, week_num, task, 'pending'))
                             
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'roadmap': roadmap_json})
        
    except Exception as e:
        print("Gemini Generation Error:", str(e))
        return jsonify({'success': False, 'message': f'Failed to generate skill path from AI. Error: {str(e)}'}), 500

import re

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '').lower()
    
    if not user_message:
        return jsonify({'error': 'Message is required'}), 400

    try:
        # Fetch live campus data from SQLite
        conn = get_db_connection()
        events = conn.execute('SELECT title, date, time FROM events').fetchall()
        mentors = conn.execute('SELECT name, mentor_type, domains FROM mentors').fetchall()
        resources = conn.execute('SELECT name, available_from, available_to FROM resources').fetchall()
        conn.close()

        # Build dynamic AI responses based on keywords
        bot_reply = ""
        
        if any(word in user_message for word in ['event', 'hackathon', 'symposium', 'date', 'when']):
            bot_reply = "Here are the upcoming events on campus:\n"
            for e in events:
                bot_reply += f"• **{e['title']}** on {e['date']} at {e['time']}\n"
                
        elif any(word in user_message for word in ['mentor', 'teacher', 'alumni', 'help', 'guide']):
            bot_reply = "I can help connect you with these experts:\n"
            for m in mentors:
                bot_reply += f"• **{m['name']}** ({m['mentor_type']}) - specializes in {m['domains']}\n"
                
        elif any(word in user_message for word in ['lab', 'resource', 'equipment', 'mac', 'vr']):
            bot_reply = "Here are our campus labs and their availability:\n"
            for r in resources:
                bot_reply += f"• **{r['name']}** is available from {r['available_from']} to {r['available_to']}\n"
                
        elif any(word in user_message for word in ['hello', 'hi', 'hey']):
             bot_reply = "Hello! 👋 I'm the SkillBridge AI. I can tell you about live campus Events, available Mentors, or Lab statuses! What do you need?"
             
        elif 'project' in user_message:
             bot_reply = "If you have a project idea, head over to the **Planner** tab! I'll automatically suggest the perfect Mentor and Lab for your specific domain."
             
        else:
            bot_reply = "I'm a local AI assistant right now! 🤖\n\nI can tell you exactly what **Events**, **Mentors**, or **Labs** are currently available in the database if you ask about them!"

    except Exception as e:
        print("Chatbot Error:", e)
        bot_reply = "Hmm, I am having trouble connecting to my database right now."

    return jsonify({'reply': bot_reply})

@app.route('/skill-paths', methods=['GET'])
@token_required
def get_my_skill_paths(current_user_id):
    conn = get_db_connection()
    paths = conn.execute('SELECT * FROM skill_paths WHERE user_id = ? ORDER BY created_at DESC', (current_user_id,)).fetchall()
    conn.close()
    results = []
    for p in paths:
        d = dict(p)
        d['roadmap'] = json.loads(d['roadmap_json'])
        results.append(d)
    return jsonify(results)

@app.route('/books/search', methods=['GET'])
def search_books():
    query = request.args.get('q', '').lower()
    conn = get_db_connection()
    books = conn.execute('SELECT * FROM books').fetchall()
    
    results = []
    for b in books:
        if query and query not in b['title'].lower() and query not in b['author'].lower() and query not in b['subject'].lower():
            continue
            
        book_id = b['id']
        copies = conn.execute('SELECT * FROM book_copies WHERE book_id = ?', (book_id,)).fetchall()
        available_copies = [c for c in copies if c['status'] == 'Available']
        borrowed_copies = [c for c in copies if c['status'] != 'Available' and c['return_due_date']]
        
        expected_availability = None
        if not available_copies and borrowed_copies:
            sorted_copies = sorted(borrowed_copies, key=lambda x: x['return_due_date'])
            expected_availability = sorted_copies[0]['return_due_date']
            
        d = dict(b)
        d['available_count'] = len(available_copies)
        d['expected_availability'] = expected_availability
        d['available_copy_id'] = available_copies[0]['id'] if available_copies else None
        results.append(d)
        
    conn.close()
    return jsonify(results)

@app.route('/books/reserve', methods=['POST'])
@token_required
def reserve_book(current_user_id):
    data = request.json
    copy_id = data.get('copy_id')
    
    conn = get_db_connection()
    copy = conn.execute('SELECT * FROM book_copies WHERE id = ? AND status = "Available"', (copy_id,)).fetchone()
    if not copy:
        conn.close()
        return jsonify({'message': 'Sorry, this copy is no longer available!'}), 400
        
    conn.execute('UPDATE book_copies SET status = "Reserved" WHERE id = ?', (copy_id,))
    
    now = datetime.datetime.now()
    expires_at = now + datetime.timedelta(hours=24)
    conn.execute('INSERT INTO book_reservations (user_id, book_copy_id, reservation_date, expires_at) VALUES (?, ?, ?, ?)',
                 (current_user_id, copy_id, now.strftime("%Y-%m-%d %H:%M"), expires_at.strftime("%Y-%m-%d %H:%M")))
    
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Book reserved for 24 hours! You can pick it up from the library front desk.'})

@app.route('/books/notify', methods=['POST'])
@token_required
def notify_book(current_user_id):
    data = request.json
    book_id = data.get('book_id')
    
    conn = get_db_connection()
    existing = conn.execute('SELECT id FROM library_notifications WHERE user_id = ? AND book_id = ?', (current_user_id, book_id)).fetchone()
    if existing:
        conn.close()
        return jsonify({'message': 'You are already subscribed for notifications for this book!'}), 400
        
    conn.execute('INSERT INTO library_notifications (user_id, book_id) VALUES (?, ?)', (current_user_id, book_id))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Subscribed! We will notify you when a copy becomes available.'})


@app.route('/skill-paths/active', methods=['GET'])
@token_required
def get_active_skill_path(current_user_id):
    conn = get_db_connection()
    # Get the most recent path
    path = conn.execute('SELECT * FROM skill_paths WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', (current_user_id,)).fetchone()
    
    if not path:
        conn.close()
        return jsonify({'has_active_path': False})
        
    path_dict = dict(path)
    path_dict['roadmap'] = json.loads(path_dict['roadmap_json'])
    
    # Get tasks for this path
    tasks = conn.execute('SELECT * FROM skill_tasks WHERE path_id = ? ORDER BY week_number ASC', (path_dict['id'],)).fetchall()
    
    tasks_by_week = {}
    for t in tasks:
        t_dict = dict(t)
        w = t_dict['week_number']
        if w not in tasks_by_week:
            tasks_by_week[w] = []
        tasks_by_week[w].append(t_dict)
        
    path_dict['tasks_by_week'] = tasks_by_week
    
    conn.close()
    return jsonify({'has_active_path': True, 'path': path_dict})

@app.route('/skill-paths/update-tasks', methods=['POST'])
@token_required
def update_skill_tasks(current_user_id):
    data = request.json
    completed_task_ids = data.get('completed_task_ids', [])
    pending_task_ids = data.get('pending_task_ids', [])
    
    conn = get_db_connection()
    
    # Mark completed tasks
    for tid in completed_task_ids:
        conn.execute('UPDATE skill_tasks SET status = "completed" WHERE id = ? AND user_id = ?', (tid, current_user_id))
        
    # Move pending tasks to next week (assuming rolling over)
    suggest_easier = False
    
    if len(pending_task_ids) > 3:
        suggest_easier = True
        
    for tid in pending_task_ids:
        # Increment week number
        conn.execute('UPDATE skill_tasks SET week_number = week_number + 1 WHERE id = ? AND user_id = ?', (tid, current_user_id))
        
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'suggest_easier': suggest_easier, 'message': 'Progress saved successfully.'})

@app.route('/skill-paths/easier', methods=['POST'])
@token_required
def request_easier_path(current_user_id):
    data = request.json
    path_id = data.get('path_id')
    
    conn = get_db_connection()
    path = conn.execute('SELECT * FROM skill_paths WHERE id = ? AND user_id = ?', (path_id, current_user_id)).fetchone()
    
    if not path:
        conn.close()
        return jsonify({'success': False, 'message': 'Path not found'}), 404
        
    # Get pending tasks
    pending_tasks = conn.execute('SELECT task_text FROM skill_tasks WHERE path_id = ? AND status = "pending"', (path_id,)).fetchall()
    pending_texts = [t['task_text'] for t in pending_tasks]
    
    prompt = f"""You are an educational AI. The student is struggling to keep up with their current roadmap for "{path['goal']}".
They have the following tasks left unfinished:
{', '.join(pending_texts)}

Please generate a NEW, EASIER roadmap that spreads these tasks out over a longer period. Add more basic introductory topics and extra resources to help them catch up.

Return ONLY a structured JSON response exactly matching this schema. Do not enclose it in markdown blocks like ```json.
{{
  "weeks": [
    {{
      "week_number": 1,
      "focus": "Gentle Introduction to...",
      "skills_to_learn": ["Skill 1"],
      "project_ideas": ["Simple Idea"],
      "hackathons": [],
      "mentors": [],
      "resources": ["Very beginner friendly resource"],
      "tasks": ["Easy Task 1", "Easy Task 2"]
    }}
  ]
}}"""

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        if text.startswith('```json'):
            text = text[7:]
            if text.endswith('```'):
                text = text[:-3]
        text = text.strip()
            
        roadmap_json = json.loads(text)
        
        # We will create a NEW skill path entry
        cursor = conn.cursor()
        cursor.execute('INSERT INTO skill_paths (user_id, goal, current_skills, time_available, domain, roadmap_json) VALUES (?, ?, ?, ?, ?, ?)',
                     (current_user_id, f"Easier: {path['goal']}", path['current_skills'], path['time_available'], path['domain'], json.dumps(roadmap_json)))
                     
        new_path_id = cursor.lastrowid
        
        for week in roadmap_json.get('weeks', []):
            week_num = week.get('week_number', 1)
            # Gemini sometimes hallucinates "actionable_tasks" instead of "tasks"
            tasks_list = week.get('tasks', week.get('actionable_tasks', []))
            for task in tasks_list:
                cursor.execute('INSERT INTO skill_tasks (user_id, path_id, week_number, task_text, status) VALUES (?, ?, ?, ?, ?)',
                             (current_user_id, new_path_id, week_num, task, 'pending'))
                             
        # Clean up old path tasks to avoid duplication (or we can just leave them attached to old path)
                             
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Created an easier roadmap for you!', 'roadmap': roadmap_json})
        
    except Exception as e:
        print("Gemini Easier Error:", str(e))
        conn.close()
        return jsonify({'success': False, 'message': f'Failed to generate easier path. Error: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=False, port=5000)
