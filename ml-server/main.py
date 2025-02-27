from flask import Flask, request, jsonify
import lightgbm as lgb
import numpy as np
import joblib

# 初始化 Flask
app = Flask(__name__)

# 加载 LightGBM 模型 & StandardScaler
model_outside = lgb.Booster(model_file="lgb_model_ave_outside.txt")
scaler_outside = joblib.load("scaler_ave_outside.pkl")  # 预先存储的归一化参数

model_inside = lgb.Booster(model_file="lgb_model_ave_inside.txt")
scaler_inside = joblib.load("scaler_ave_inside.pkl")  # 预先存储的归一化参数



@app.route("/predict_outside", methods=["POST"])
def predict_outside():
    try:
        # 获取 JSON 输入
        data = request.get_json()
        features = np.array(data["features"])  # 期望 JSON 格式：{"features": [[f1, f2, ..., fn]]}

        # 确保输入是二维数组
        if features.ndim != 2:
            return jsonify({"error": "Input features should be a 2D array"}), 400

        # 归一化输入（预测不再反归一化）
        features_scaled = scaler_outside.transform(features)
        # 进行预测（不再反归一化）
        predictions = model_outside.predict(features_scaled)

        # 返回预测结果（直接返回预测值）
        return jsonify({"predictions": predictions.tolist()})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict_inside", methods=["POST"])
def predict_inside():
    try:
         # 获取 JSON 输入
        data = request.get_json()
        features = np.array(data["features"])  # 期望 JSON 格式：{"features": [[f1, f2, ..., fn]]}

        # 确保输入是二维数组
        if features.ndim != 2:
            return jsonify({"error": "Input features should be a 2D array"}), 400

        # 归一化输入（预测不再反归一化）
        features_scaled = scaler_inside.transform(features)
        # 进行预测（不再反归一化）
        predictions = model_inside.predict(features_scaled)

        # 返回预测结果（直接返回预测值）
        return jsonify({"predictions": predictions.tolist()})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
