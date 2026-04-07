
import json
import os
from datetime import datetime
from typing import Dict, List, Optional

class Database:
    def __init__(self, db_folder='database'):
        self.db_folder = db_folder
        self.products_file = f'{db_folder}/products.json'
        self.orders_file = f'{db_folder}/orders.json'
        self.tickets_file = f'{db_folder}/tickets.json'
        self.users_file = f'{db_folder}/users.json'
        self.default_files = {
            self.products_file: {"products": []},
            self.orders_file: {"orders": []},
            self.tickets_file: {"tickets": []},
            self.users_file: {"users": []}
        }
        
        # Create database folder if not exists
        if not os.path.exists(db_folder):
            os.makedirs(db_folder)
        
        # Initialize files
        self._init_files()
    
    def _init_files(self):
        """Initialize JSON files with default structure"""
        for file, default_data in self.default_files.items():
            if not os.path.exists(file) or os.path.getsize(file) == 0:
                with open(file, 'w') as f:
                    json.dump(default_data, f, indent=4)
    
    def _read_file(self, filename: str) -> Dict:
        """Read JSON file"""
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            data = self.default_files.get(filename, {})
            self._write_file(filename, data)
            return data

        default_data = self.default_files.get(filename)
        if isinstance(default_data, dict):
            merged_data = default_data.copy()
            if isinstance(data, dict):
                merged_data.update(data)
            else:
                merged_data = default_data.copy()

            if merged_data != data:
                self._write_file(filename, merged_data)

            return merged_data

        return data
    
    def _write_file(self, filename: str, data: Dict):
        """Write to JSON file"""
        with open(filename, 'w') as f:
            json.dump(data, f, indent=4)
    
    # Product Methods
    def add_product(self, product_data: Dict) -> bool:
        """Add a new product"""
        data = self._read_file(self.products_file)
        product_data['id'] = len(data['products']) + 1
        product_data['created_at'] = datetime.now().isoformat()
        data['products'].append(product_data)
        self._write_file(self.products_file, data)
        return True
    
    def get_products(self, category: Optional[str] = None) -> List[Dict]:
        """Get all products or by category"""
        data = self._read_file(self.products_file)
        products = data.get('products', [])
        
        if category:
            return [p for p in products if p.get('category') == category]
        return products
    
    def get_product_by_id(self, product_id: int) -> Optional[Dict]:
        """Get product by ID"""
        data = self._read_file(self.products_file)
        for product in data.get('products', []):
            if product['id'] == product_id:
                return product
        return None
    
    def update_product(self, product_id: int, update_data: Dict) -> bool:
        """Update product"""
        data = self._read_file(self.products_file)
        for i, product in enumerate(data['products']):
            if product['id'] == product_id:
                data['products'][i].update(update_data)
                self._write_file(self.products_file, data)
                return True
        return False
    
    def delete_product(self, product_id: int) -> bool:
        """Delete product"""
        data = self._read_file(self.products_file)
        data['products'] = [p for p in data['products'] if p['id'] != product_id]
        self._write_file(self.products_file, data)
        return True
    
    # Order Methods
    def create_order(self, order_data: Dict) -> Dict:
        """Create new order"""
        data = self._read_file(self.orders_file)
        order_data['order_id'] = f"ORD-{len(data['orders']) + 1:05d}"
        order_data['created_at'] = datetime.now().isoformat()
        order_data['status'] = 'pending'
        data['orders'].append(order_data)
        self._write_file(self.orders_file, data)
        return order_data
    
    def get_order(self, order_id: str) -> Optional[Dict]:
        """Get order by ID"""
        data = self._read_file(self.orders_file)
        for order in data.get('orders', []):
            if order['order_id'] == order_id:
                return order
        return None
    
    def update_order(self, order_id: str, update_data: Dict) -> bool:
        """Update order"""
        data = self._read_file(self.orders_file)
        for i, order in enumerate(data['orders']):
            if order['order_id'] == order_id:
                data['orders'][i].update(update_data)
                self._write_file(self.orders_file, data)
                return True
        return False
    
    def get_user_orders(self, user_id: int) -> List[Dict]:
        """Get all orders for a user"""
        data = self._read_file(self.orders_file)
        return [o for o in data.get('orders', []) if o.get('user_id') == user_id]
    
    # Ticket Methods
    def create_ticket(self, ticket_data: Dict) -> Dict:
        """Create new ticket"""
        data = self._read_file(self.tickets_file)
        ticket_data['ticket_id'] = f"TICKET-{len(data['tickets']) + 1:05d}"
        ticket_data['created_at'] = datetime.now().isoformat()
        ticket_data['status'] = 'open'
        data['tickets'].append(ticket_data)
        self._write_file(self.tickets_file, data)
        return ticket_data
    
    def get_ticket(self, ticket_id: str) -> Optional[Dict]:
        """Get ticket by ID"""
        data = self._read_file(self.tickets_file)
        for ticket in data.get('tickets', []):
            if ticket['ticket_id'] == ticket_id:
                return ticket
        return None
    
    def update_ticket(self, ticket_id: str, update_data: Dict) -> bool:
        """Update ticket"""
        data = self._read_file(self.tickets_file)
        for i, ticket in enumerate(data['tickets']):
            if ticket['ticket_id'] == ticket_id:
                data['tickets'][i].update(update_data)
                self._write_file(self.tickets_file, data)
                return True
        return False
    
    def get_user_tickets(self, user_id: int) -> List[Dict]:
        """Get all tickets for a user"""
        data = self._read_file(self.tickets_file)
        return [t for t in data.get('tickets', []) if t.get('user_id') == user_id]
    
    # User Methods
    def add_user(self, user_data: Dict):
        """Add or update user"""
        data = self._read_file(self.users_file)
        users = data.get('users', [])
        
        # Check if user exists
        for i, user in enumerate(users):
            if user['user_id'] == user_data['user_id']:
                users[i].update(user_data)
                self._write_file(self.users_file, data)
                return
        
        # Add new user
        user_data['joined_at'] = datetime.now().isoformat()
        users.append(user_data)
        data['users'] = users
        self._write_file(self.users_file, data)
    
    def get_user(self, user_id: int) -> Optional[Dict]:
        """Get user by ID"""
        data = self._read_file(self.users_file)
        for user in data.get('users', []):
            if user['user_id'] == user_id:
                return user
        return None

# Global database instance
db = Database()
