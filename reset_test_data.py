import sqlite3

conn = sqlite3.connect('bank.db')
conn.execute("UPDATE users SET password = 'password123' WHERE username = 'john_doe'")
conn.execute("UPDATE users SET full_name = 'John Doe' WHERE username = 'john_doe'")
conn.execute("UPDATE users SET is_active = 1 WHERE username = 'john_doe'")
conn.commit()
conn.close()
print('Reset done')
