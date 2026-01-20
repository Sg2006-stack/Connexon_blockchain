from supabase import create_client, Client
from dotenv import load_dotenv
from app.config import get_env_var

load_dotenv()

SUPABASE_URL = get_env_var("SUPABASE_URL")
SUPABASE_KEY = get_env_var("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class UsersTable:
    @staticmethod
    def insert_one(data: dict):
        result = supabase.table("users").insert(data).execute()
        return type('obj', (object,), {'inserted_id': result.data[0]['id'] if result.data else None})()
    
    @staticmethod
    def find_one(query: dict):
        key, value = list(query.items())[0]
        result = supabase.table("users").select("*").eq(key, value).execute()
        return result.data[0] if result.data else None
    
    @staticmethod
    def update_one(query: dict, update: dict):
        key, value = list(query.items())[0]
        update_data = update.get("$set", update)
        supabase.table("users").update(update_data).eq(key, value).execute()

class AdminsTable:
    @staticmethod
    def insert_one(data: dict):
        result = supabase.table("admins").insert(data).execute()
        return type('obj', (object,), {'inserted_id': result.data[0]['id'] if result.data else None})()
    
    @staticmethod
    def find_one(query: dict):
        key, value = list(query.items())[0]
        result = supabase.table("admins").select("*").eq(key, value).execute()
        return result.data[0] if result.data else None

class EmergencyAlertsTable:
    @staticmethod
    def insert_one(data: dict):
        result = supabase.table("emergency_alerts").insert(data).execute()
        return type('obj', (object,), {'inserted_id': result.data[0]['id'] if result.data else None})()
    
    @staticmethod
    def find(query: dict = None, limit: int = None, order_by: str = None, desc: bool = True):
        query_builder = supabase.table("emergency_alerts").select("*")
        
        if query:
            for key, value in query.items():
                query_builder = query_builder.eq(key, value)
        
        if order_by:
            query_builder = query_builder.order(order_by, desc=desc)
        
        if limit:
            query_builder = query_builder.limit(limit)
        
        result = query_builder.execute()
        return result.data if result.data else []
    
    @staticmethod
    def find_all(order_by: str = None, desc: bool = True, limit: int = None):
        query_builder = supabase.table("emergency_alerts").select("*")
        
        if order_by:
            query_builder = query_builder.order(order_by, desc=desc)
        
        if limit:
            query_builder = query_builder.limit(limit)
        
        result = query_builder.execute()
        return result.data if result.data else []
    
    @staticmethod
    def update_one(query: dict, update: dict):
        key, value = list(query.items())[0]
        update_data = update.get("$set", update)
        supabase.table("emergency_alerts").update(update_data).eq(key, value).execute()

class SosLogsTable:
    @staticmethod
    def find_all(order_by: str = None, desc: bool = True, limit: int = None):
        query_builder = supabase.table("sos_logs").select("*")
        
        if order_by:
            query_builder = query_builder.order(order_by, desc=desc)
        
        if limit:
            query_builder = query_builder.limit(limit)
        
        result = query_builder.execute()
        return result.data if result.data else []
    
    @staticmethod
    def update_one(query: dict, update: dict):
        key, value = list(query.items())[0]
        update_data = update.get("$set", update)
        supabase.table("sos_logs").update(update_data).eq(key, value).execute()

users_collection = UsersTable()
admins_collection = AdminsTable()
emergency_alerts_collection = EmergencyAlertsTable()
sos_logs_collection = SosLogsTable()
