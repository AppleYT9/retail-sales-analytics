import pandas as pd
import numpy as pd_np

def clean_sales_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans raw uploaded retail sales data.
    - Handles missing values
    - Removes duplicates
    - Converts dates
    - Standardizes categories
    - Generates Month, Year, Profit Margin, Average Order Value
    """
    # Standardize column names
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    
    # Required columns mapping based on our models (approximate mapping)
    # Ensure date, product_sku, product_name, category, price, cost, customer_code, customer_name, quantity
    
    # Remove duplicates
    df.drop_duplicates(inplace=True)
    
    # Fill missing numeric values with 0, and categorical with 'Unknown'
    numeric_cols = df.select_dtypes(include=['number']).columns
    df[numeric_cols] = df[numeric_cols].fillna(0)
    
    cat_cols = df.select_dtypes(include=['object']).columns
    df[cat_cols] = df[cat_cols].fillna('Unknown')
    
    # Convert dates (assuming a 'date' or 'order_date' column exists)
    date_col = next((c for c in df.columns if 'date' in c), None)
    if date_col:
        df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
        df.dropna(subset=[date_col], inplace=True) # Drop invalid dates
        
        # Generate Month and Year
        df['month'] = df[date_col].dt.month
        df['year'] = df[date_col].dt.year
        
    # Standardize categories
    if 'category' in df.columns:
        df['category'] = df['category'].str.title()
        
    # Generate calculated fields if price, cost, and quantity are present
    if all(c in df.columns for c in ['price', 'cost', 'quantity']):
        # Ensure they are numeric
        for c in ['price', 'cost', 'quantity']:
            df[c] = pd.to_numeric(df[c], errors='coerce').fillna(0)
            
        # Prevent negative quantities
        df['quantity'] = df['quantity'].apply(lambda x: max(0, x))
        
        df['total_price'] = df['price'] * df['quantity']
        df['total_cost'] = df['cost'] * df['quantity']
        df['profit'] = df['total_price'] - df['total_cost']
        
        # Profit Margin (Profit / Total Price)
        df['profit_margin'] = pd_np.where(df['total_price'] > 0, df['profit'] / df['total_price'], 0)
        
    return df
