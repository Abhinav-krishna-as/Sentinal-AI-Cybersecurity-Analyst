import mysql.connector
import os
from pathlib import Path
from dotenv import load_dotenv

# Load local .env when running on your PC.
# Railway will use its own environment variables.
env_path = Path(__file__).resolve().parent / ".env"

if env_path.exists():
    load_dotenv(env_path, override=False)

# Railway uses MYSQLHOST / MYSQLUSER / MYSQLPASSWORD / MYSQLDATABASE.
# Local development uses MYSQL_HOST / MYSQL_USER / MYSQL_PASSWORD / MYSQL_DATABASE.

mysql_host = os.getenv("MYSQLHOST") or os.getenv("MYSQL_HOST")
mysql_user = os.getenv("MYSQLUSER") or os.getenv("MYSQL_USER")
mysql_password = os.getenv("MYSQLPASSWORD") or os.getenv("MYSQL_PASSWORD")
mysql_database = os.getenv("MYSQLDATABASE") or os.getenv("MYSQL_DATABASE")
mysql_port = os.getenv("MYSQLPORT") or os.getenv("MYSQL_PORT") or "3306"

connection = mysql.connector.connect(
    host=mysql_host,
    port=int(mysql_port),
    user=mysql_user,
    password=mysql_password,
    database=mysql_database,
    autocommit=True
)

print("connected Successfully to the database")

cursor = connection.cursor(dictionary=True)