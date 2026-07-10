import pandas as pd
from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.ml import SegmentationResponse

KMeans = None
try:
    from sklearn.cluster import KMeans
except ImportError:
    pass

def segment_customers(db: Session) -> SegmentationResponse:
    if KMeans is None:
        raise ValueError("scikit-learn is not installed on this server. Cannot segment customers.")
    # Join Customers and Orders to get RFM (Recency, Frequency, Monetary) style data
    # Simplified here to just Monetary (total spend) and Frequency (number of orders)
    
    query = """
    SELECT c.id, c.customer_code, COUNT(o.id) as frequency, SUM(o.total_price) as monetary
    FROM customers c
    JOIN orders o ON c.id = o.customer_id
    GROUP BY c.id, c.customer_code
    """
    
    # For simplicity, using a basic query fetching logic
    # In production, use SQLAlchemy ORM proper group_by
    from sqlalchemy import text
    result = db.execute(text(query)).fetchall()
    
    if not result:
        return SegmentationResponse(clusters=0, distribution={})
        
    df = pd.DataFrame(result, columns=['id', 'customer_code', 'frequency', 'monetary'])
    
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    df['cluster'] = kmeans.fit_predict(df[['frequency', 'monetary']])
    
    # Update customer segments in DB (Optional, based on requirements)
    
    distribution = df['cluster'].value_counts().to_dict()
    # Map cluster index to string key
    distribution = {f"Cluster {k}": v for k, v in distribution.items()}
    
    return SegmentationResponse(
        clusters=3,
        distribution=distribution
    )
