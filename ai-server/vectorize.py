import pymysql
import numpy as np

def fetch_sensor_vector(car_code, timestamp):
    conn = pymysql.connect(
        host='localhost',
        user='busan_univ',
        password='busan1234',
        db='robot',
        charset='utf8'
    )

    try:
        with conn.cursor() as cursor:
            sql = """
                  SELECT sensor_info_id, ppm, ratio, rs, ro
                  FROM sensor_data
                  WHERE car_code = %s AND timestamp = %s
                  ORDER BY sensor_info_id ASC \
                  """
            cursor.execute(sql, (car_code, timestamp))
            rows = cursor.fetchall()

        # 센서 ID 기준 정렬
        sensor_vector = []
        for row in rows:
            sensor_vector.extend([
                float(row[1]),  # ppm
                float(row[2]),  # ratio
                float(row[3]),  # rs
                float(row[4])   # ro
            ])

        # 길이가 48이 안되면 0으로 패딩
        while len(sensor_vector) < 48:
            sensor_vector.append(0.0)

        return sensor_vector

    finally:
        conn.close()
