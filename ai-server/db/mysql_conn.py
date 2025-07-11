# ai-predictor/db/mysql_conn.py

import pymysql

def get_connection():
    return pymysql.connect(
        host='localhost',         # 또는 DB 서버 주소
        user='busan_univ',         # DB 사용자명
        password='busan1234', # 비밀번호
        db='robot',               # 사용할 DB명
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
