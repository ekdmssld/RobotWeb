# ai-predictor/model/data_loader.py

import numpy as np
from db.mysql_conn import get_connection

def fetch_sensor_vector(car_code: str, timestamp: str) -> np.ndarray:
    """
    sensor_data 테이블에서 12개 센서 × 4값(ppm, ratio, rs, ro)을 기준으로 48차원 벡터 생성
    """
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                  SELECT sensor_info_id, ppm, ratio, rs, ro
                  FROM sensor_data
                  WHERE car_code = %s AND timestamp = %s
                  ORDER BY sensor_info_id \
                  """
            cursor.execute(sql, (car_code, timestamp))
            results = cursor.fetchall()

            if not results or len(results) != 12:
                print("⚠️ 센서 데이터 부족 또는 미일치")
                return None

            vector = []
            for row in results:
                vector.extend([
                    row['ppm'], row['ratio'],
                    row['rs'], row['ro']
                ])

            return np.array(vector)
    finally:
        conn.close()
