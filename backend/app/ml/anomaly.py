import pandas as pd
from sqlalchemy.orm import Session
from app.models.order import Order
from app.schemas.ml import AnomalyResponse

IsolationForest = None
try:
    from sklearn.ensemble import IsolationForest
except ImportError:
    pass

def detect_anomalies(db: Session) -> AnomalyResponse:
    if IsolationForest is None:
        raise ValueError("scikit-learn is not installed on this server. Cannot detect anomalies.")
        
    orders = db.query(Order.id, Order.total_price, Order.quantity).all()
    if not orders:
        return AnomalyResponse(total_anomalies=0, anomalies=[])
        
    df = pd.DataFrame(orders, columns=['id', 'total_price', 'quantity'])
    
    # Isolation Forest
    clf = IsolationForest(contamination=0.05, random_state=42)
    df['anomaly'] = clf.fit_predict(df[['total_price', 'quantity']])
    
    # anomalies are marked as -1
    anomalies = df[df['anomaly'] == -1]
    
    anomaly_list = anomalies[['id', 'total_price', 'quantity']].to_dict(orient='records')
    
    return AnomalyResponse(
        total_anomalies=len(anomaly_list),
        anomalies=anomaly_list
    )
