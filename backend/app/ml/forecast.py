import pandas as pd
from sqlalchemy.orm import Session
from app.models.order import Order
from app.schemas.ml import ForecastResponse

Prophet = None
try:
    from prophet import Prophet
except ImportError:
    pass

def generate_forecast(db: Session, periods: int = 30, upload_id: int | None = None) -> ForecastResponse:
    # Fetch historical daily sales
    query = db.query(Order.order_date, Order.total_price)
    if upload_id is not None:
        query = query.filter(Order.upload_id == upload_id)
    orders = query.all()
    if not orders:
        return ForecastResponse(dates=[], predictions=[], lower_bounds=[], upper_bounds=[])
        
    df = pd.DataFrame(orders, columns=['ds', 'y'])
    df['ds'] = pd.to_datetime(df['ds']).dt.tz_localize(None)
    
    # Aggregate daily
    daily_sales = df.groupby(df['ds'].dt.date)['y'].sum().reset_index()
    daily_sales.columns = ['ds', 'y']

    if Prophet is None:
        # Fallback Seasonal Forecaster
        last_date = daily_sales['ds'].max()
        future_dates = [last_date + pd.Timedelta(days=i) for i in range(1, periods + 1)]
        
        # Calculate base average and day-of-week seasonality
        daily_sales['weekday'] = pd.to_datetime(daily_sales['ds']).dt.weekday
        weekday_avg = daily_sales.groupby('weekday')['y'].mean()
        overall_avg = daily_sales['y'].mean() if len(daily_sales) > 0 else 100.0
        if overall_avg == 0:
            overall_avg = 100.0
            
        multipliers = {w: (val / overall_avg) for w, val in weekday_avg.items()}
        
        preds = []
        lower = []
        upper = []
        
        for i, f_date in enumerate(future_dates):
            w = f_date.weekday()
            mult = multipliers.get(w, 1.0)
            
            # Predict with a minor trend factor (0.1% daily increase)
            pred = overall_avg * mult * (1.0 + 0.001 * i)
            pred = max(0.0, pred)
            
            preds.append(pred)
            lower.append(pred * 0.85)
            upper.append(pred * 1.15)
            
        dates_str = [d.strftime('%Y-%m-%d') for d in future_dates]
        return ForecastResponse(
            dates=dates_str,
            predictions=preds,
            lower_bounds=lower,
            upper_bounds=upper
        )
    
    # Train Prophet model
    model = Prophet(daily_seasonality=True, yearly_seasonality=True)
    model.fit(daily_sales)
    
    # Predict
    future = model.make_future_dataframe(periods=periods)
    forecast = model.predict(future)
    
    # Filter only future dates
    last_date = daily_sales['ds'].max()
    future_forecast = forecast[forecast['ds'].dt.date > pd.to_datetime(last_date).date()]
    
    dates = future_forecast['ds'].dt.strftime('%Y-%m-%d').tolist()
    preds = future_forecast['yhat'].tolist()
    lower = future_forecast['yhat_lower'].tolist()
    upper = future_forecast['yhat_upper'].tolist()
    
    return ForecastResponse(
        dates=dates,
        predictions=preds,
        lower_bounds=lower,
        upper_bounds=upper
    )
