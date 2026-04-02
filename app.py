import streamlit as st
import pandas as pd
import numpy as np
import random
import os
import pickle
from datetime import datetime, timedelta
from sklearn.ensemble import IsolationForest
from sklearn.metrics import precision_score, recall_score, accuracy_score, confusion_matrix
import plotly.graph_objects as go
import plotly.express as px

# ─── Page Config ────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="MedGuard Nexus",
    page_icon="🛡️",
    layout="wide",
)

# ─── Styling ─────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    .main-title { font-size: 2.2rem; font-weight: 700; color: #00d4ff; text-align: center; margin-bottom: 0.2rem; }
    .sub-title  { font-size: 1rem; color: #aaa; text-align: center; margin-bottom: 1.5rem; }
    .normal-box { background: #0d3b1e; border: 1px solid #00c853; border-radius: 8px; padding: 1rem; color: #00e676; font-size: 1.1rem; text-align: center; }
    .attack-box { background: #3b0d0d; border: 1px solid #ff1744; border-radius: 8px; padding: 1rem; color: #ff5252; font-size: 1.1rem; text-align: center; }
    .metric-card { background: #1a1a2e; border-radius: 8px; padding: 0.8rem; text-align: center; }
</style>
""", unsafe_allow_html=True)

# ─── Constants ───────────────────────────────────────────────────────────────────
MODEL_PATH = "isolation_forest_model.pkl"
NORMAL_RPS_RANGE  = (10, 80)
ATTACK_RPS_RANGE  = (800, 2000)
HISTORY_SIZE      = 60  # data points to show in graph

# ─── Session State Init ──────────────────────────────────────────────────────────
if "traffic_history" not in st.session_state:
    st.session_state.traffic_history = []   # list of dicts
if "labels_history" not in st.session_state:
    st.session_state.labels_history = []    # 0=normal, 1=attack (ground truth)
if "pred_history" not in st.session_state:
    st.session_state.pred_history = []      # model predictions

# ─── Helpers ─────────────────────────────────────────────────────────────────────
def random_ip(prefix="192.168"):
    return f"{prefix}.{random.randint(1,254)}.{random.randint(1,254)}"

def generate_traffic(n=20, attack=False):
    rows = []
    for _ in range(n):
        rps = random.randint(*ATTACK_RPS_RANGE) if attack else random.randint(*NORMAL_RPS_RANGE)
        rows.append({
            "timestamp":          datetime.now().strftime("%H:%M:%S"),
            "source_ip":          random_ip("10.0"),
            "destination_ip":     random_ip("192.168"),
            "requests_per_second": rps,
            "packet_size":        random.randint(64, 1500) if not attack else random.randint(1200, 1500),
        })
    return rows

def load_or_train_model():
    """Load model from disk or train a fresh one and save it."""
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    # Train a baseline model on synthetic normal + attack data
    normal_data = np.column_stack([
        np.random.randint(*NORMAL_RPS_RANGE, 800),
        np.random.randint(64, 512, 800),
    ])
    attack_data = np.column_stack([
        np.random.randint(*ATTACK_RPS_RANGE, 200),
        np.random.randint(1200, 1500, 200),
    ])
    X_train = np.vstack([normal_data, attack_data])
    model = IsolationForest(n_estimators=100, contamination=0.2, random_state=42)
    model.fit(X_train)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    return model

def predict(model, rows):
    """Return list of predictions: 'Normal' or 'Attack', plus raw scores."""
    X = np.array([[r["requests_per_second"], r["packet_size"]] for r in rows])
    raw   = model.predict(X)          # 1 = normal, -1 = anomaly
    scores = model.decision_function(X)  # higher = more normal
    labels = ["Attack" if v == -1 else "Normal" for v in raw]
    return labels, scores

def compute_metrics(y_true, y_pred):
    """y_true / y_pred are lists of 0 (normal) or 1 (attack)."""
    if len(set(y_true)) < 2:
        return None
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec  = recall_score(y_true, y_pred, zero_division=0)
    acc  = accuracy_score(y_true, y_pred)
    cm   = confusion_matrix(y_true, y_pred)
    return prec, rec, acc, cm

# ─── Load Model ──────────────────────────────────────────────────────────────────
model = load_or_train_model()

# ─── Title ───────────────────────────────────────────────────────────────────────
st.markdown('<div class="main-title">🛡️ MedGuard Nexus</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">AI-Based DDoS Detection System — Powered by Isolation Forest</div>', unsafe_allow_html=True)
st.divider()

# ─── Simulation Buttons ──────────────────────────────────────────────────────────
col_btn1, col_btn2, col_spacer = st.columns([1, 1, 4])
simulate_ddos   = col_btn1.button("🔴 Simulate DDoS Attack",    use_container_width=True)
simulate_normal = col_btn2.button("🟢 Generate Normal Traffic", use_container_width=True)

# Run simulation when a button is pressed
new_rows, is_attack = [], False
if simulate_ddos:
    new_rows = generate_traffic(n=20, attack=True)
    is_attack = True
elif simulate_normal:
    new_rows = generate_traffic(n=20, attack=False)
    is_attack = False

if new_rows:
    preds, scores = predict(model, new_rows)
    for i, row in enumerate(new_rows):
        row["prediction"] = preds[i]
        row["confidence"] = round(abs(scores[i]), 4)
        st.session_state.traffic_history.append(row)
        st.session_state.labels_history.append(1 if is_attack else 0)
        st.session_state.pred_history.append(1 if preds[i] == "Attack" else 0)

    # Keep only last HISTORY_SIZE entries
    st.session_state.traffic_history = st.session_state.traffic_history[-HISTORY_SIZE:]
    st.session_state.labels_history  = st.session_state.labels_history[-HISTORY_SIZE:]
    st.session_state.pred_history    = st.session_state.pred_history[-HISTORY_SIZE:]

st.divider()

# ─── Layout: Left panel | Right panel ────────────────────────────────────────────
left, right = st.columns([3, 2])

# ── Left: Traffic Table + Graph ──────────────────────────────────────────────────
with left:
    st.subheader("📡 Network Traffic Monitor")
    if st.session_state.traffic_history:
        df = pd.DataFrame(st.session_state.traffic_history)
        # Colour-code prediction column
        def highlight_pred(val):
            color = "#ff5252" if val == "Attack" else "#00e676"
            return f"color: {color}; font-weight: bold"
        styled = df.tail(20).style.applymap(highlight_pred, subset=["prediction"])
        st.dataframe(styled, use_container_width=True, height=280)
    else:
        st.info("No traffic data yet. Press a simulation button above.")

    st.subheader("📈 Live Traffic Graph — Requests/Second")
    if st.session_state.traffic_history:
        df_graph = pd.DataFrame(st.session_state.traffic_history)
        df_graph["index"] = range(len(df_graph))
        colors = ["red" if p == "Attack" else "cyan" for p in df_graph["prediction"]]

        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=df_graph["index"],
            y=df_graph["requests_per_second"],
            mode="lines+markers",
            line=dict(color="cyan", width=1.5),
            marker=dict(color=colors, size=6),
            name="RPS",
        ))
        fig.update_layout(
            paper_bgcolor="#0e1117",
            plot_bgcolor="#0e1117",
            font_color="white",
            xaxis=dict(title="Sample", gridcolor="#333"),
            yaxis=dict(title="Requests/sec", gridcolor="#333"),
            margin=dict(l=10, r=10, t=10, b=30),
            height=280,
        )
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("Graph will appear after simulation.")

# ── Right: Detection Panel + Metrics ─────────────────────────────────────────────
with right:
    st.subheader("🚨 Attack Detection Panel")

    if st.session_state.traffic_history:
        recent = st.session_state.traffic_history[-5:]
        attack_count = sum(1 for r in recent if r["prediction"] == "Attack")
        latest = st.session_state.traffic_history[-1]
        avg_conf = round(np.mean([r["confidence"] for r in recent]), 4)

        if attack_count >= 3:
            st.markdown(
                f'<div class="attack-box">⚠️ DDoS ATTACK DETECTED<br>'
                f'<small>{attack_count}/5 recent samples flagged as Attack</small><br>'
                f'<small>Confidence score: {avg_conf}</small></div>',
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                f'<div class="normal-box">✅ Traffic Normal<br>'
                f'<small>Latest RPS: {latest["requests_per_second"]}</small><br>'
                f'<small>Confidence score: {avg_conf}</small></div>',
                unsafe_allow_html=True,
            )

        st.markdown("")
        st.markdown(f"**Latest prediction:** `{latest['prediction']}`")
        st.markdown(f"**Latest RPS:** `{latest['requests_per_second']}`")
        st.markdown(f"**Confidence:** `{latest['confidence']}`")
    else:
        st.info("Detection results will appear here after simulation.")

    st.divider()
    st.subheader("📊 Model Performance Metrics")

    metrics = compute_metrics(
        st.session_state.labels_history,
        st.session_state.pred_history,
    ) if len(set(st.session_state.labels_history)) >= 2 else None

    if metrics:
        prec, rec, acc, cm = metrics
        m1, m2, m3 = st.columns(3)
        m1.metric("Accuracy",  f"{acc*100:.1f}%")
        m2.metric("Precision", f"{prec*100:.1f}%")
        m3.metric("Recall",    f"{rec*100:.1f}%")

        # Confusion matrix heatmap
        cm_df = pd.DataFrame(cm, index=["Normal", "Attack"], columns=["Pred Normal", "Pred Attack"])
        fig_cm = px.imshow(
            cm_df,
            text_auto=True,
            color_continuous_scale="Blues",
            title="Confusion Matrix",
        )
        fig_cm.update_layout(
            paper_bgcolor="#0e1117",
            plot_bgcolor="#0e1117",
            font_color="white",
            margin=dict(l=10, r=10, t=40, b=10),
            height=220,
        )
        st.plotly_chart(fig_cm, use_container_width=True)
    else:
        st.info("Run both normal and attack simulations to see metrics.")

# ─── Footer ──────────────────────────────────────────────────────────────────────
st.divider()
st.caption("MedGuard Nexus — AI-Based DDoS Detection | Model: Isolation Forest | Built with Streamlit")
