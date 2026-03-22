import sqlite3
import bcrypt
import sys

DB_PATH = 'database.db'


def get_conn():
    return sqlite3.connect(DB_PATH)


def add_user(name, email, password, role='student'):
    conn = get_conn()
    cur = conn.cursor()
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cur.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        (name, email, hashed, role)
    )
    conn.commit()
    conn.close()
    print(f"Added user {name} with role {role}")


if __name__ == '__main__':
    # simple CLI: python add_entry.py user Ram ram@example.com password123
    if len(sys.argv) < 2:
        print("Usage: python add_entry.py <table> [args...]")
        sys.exit(1)

    table = sys.argv[1]
    if table == 'user':
        if len(sys.argv) != 5:
            print("Usage: python add_entry.py user <name> <email> <password>")
            sys.exit(1)
        _, _, name, email, password = sys.argv
        add_user(name, email, password)
    else:
        print(f"Unknown table '{table}'")
