from .connect import connection, cursor

def create_chat(thread_id,title="New chat"):

    query = """ insert ignore into chat_sessions (thread_id, title) values (%s,%s)"""

    try:

        cursor.execute(query, (thread_id, title))
        connection.commit()
    except Exception:
        connection.rollback()
        raise

def save_message(thread_id, role, message):
    query = """ insert into messages (thread_id, role, message) values (%s,%s,%s)"""

    try:
        cursor.execute(query, (thread_id, role ,message))
        connection.commit()
    except Exception:
         connection.rollback()
         raise

def load_message(thread_id):
    query = """select role,message from messages where thread_id=%s order by created_at ASC """

    try:
        cursor.execute(query, (thread_id,))
        return cursor.fetchall()
    except Exception:
        connection.rollback()
        raise

def delete_chat(thread_id):
    query = """ delete from chat_sessions where thread_id=%s"""

    try:
        cursor.execute(query, (thread_id,))
        connection.commit()
    except Exception:
        connection.rollback()
        raise