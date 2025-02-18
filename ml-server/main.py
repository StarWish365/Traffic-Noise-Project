from flask import Flask, request, jsonify
import xgboost as xgb
import numpy as np
import joblib

# 初始化 Flask
app = Flask(__name__)

# 加载 XGBoost 模型 & StandardScaler
model_outside = xgb.Booster()
model_outside.load_model("xgb_model_outside.json")
scaler_outside = joblib.load("scaler_outside.pkl")  # 预先存储的归一化参数

model_inside = xgb.Booster()
model_inside.load_model("xgb_model_inside.json")
scaler_inside = joblib.load("scaler_inside.pkl")  # 预先存储的归一化参数

@app.route("/predict_outside", methods=["POST"])
def predict_outside():
    try:
        # 获取 JSON 输入
        data = request.get_json()
        features = np.array(data["features"])  # 期望 JSON 格式：{"features": [[f1, f2, ..., fn]]}

        if features.ndim != 2:  # 确保是二维
            return jsonify({"error": "Input features should be a 2D array"}), 400

        # 进行预测
        dmatrix = xgb.DMatrix(features)
        predictions = model_outside.predict(dmatrix)

        # 反归一化
        predictions_real = scaler_outside.inverse_transform(predictions.reshape(-1, 1)).tolist()

        return jsonify({"predictions": predictions_real})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/predict_inside", methods=["POST"])
def predict_inside():
    try:
        # 获取 JSON 输入
        data = request.get_json()
        features = np.array(data["features"])  # 期望 JSON 格式：{"features": [[f1, f2, ..., fn]]}

        if features.ndim != 2:  # 确保是二维
            return jsonify({"error": "Input features should be a 2D array"}), 400

        # 进行预测
        dmatrix = xgb.DMatrix(features)
        predictions = model_inside.predict(dmatrix)

        # 反归一化
        predictions_real = scaler_inside.inverse_transform(predictions.reshape(-1, 1)).tolist()

        return jsonify({"predictions": predictions_real})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
