from flask import Flask, request, jsonify
import numpy as np
import joblib

app = Flask(__name__)

# (임시) 더미 모델 로드 또는 생성
# 실제 학습된 모델로 교체 필요
# model = joblib.load("your_model.pkl")

chemical_names = [
    "3-methylbutanoic acid", "acetaldehyde", "ammonia", "butanal", "butanoic acid",
    "butanone", "butyl acetate", "dimethyl disulfide", "dimethyl sulfide", "hydrogen sulfide",
    "isobutyl alcohol", "methyl ethyl amine", "methyl isobutyl ketone", "methyl mercaptan",
    "pentanal", "propanal", "propanoic acid", "styrene", "toluene", "trimethylamine",
    "xylenes + ethylbenzene", "propylbenzene"  # 예시
]

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    sensor_list = data.get("sensorList", [])

    features = []
    for sensor in sensor_list:
        features.extend([
            sensor.get("ppmRefGo", 0),
            sensor.get("temp", 0),
            sensor.get("humi", 0),
            sensor.get("pre", 0),
            sensor.get("ratio", 0),
            sensor.get("ppm", 0),
            sensor.get("ppmGo", 0),
            sensor.get("rs", 0),
            sensor.get("ro", 0),
            sensor.get("refFactor", 0),
        ])

    # 예측 (랜덤 예시)
    predictions = np.random.rand(len(chemical_names)).round(4)
    result = dict(zip(chemical_names, predictions.tolist()))
    return jsonify(result)

if __name__ == "__main__":
    app.run(port=5000, debug=True)

