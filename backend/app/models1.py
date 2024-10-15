from datetime import datetime

class User:
    def __init__(self, username, email, created_at=None):
        self.username = username
        self.email = email
        self.created_at = created_at if created_at else datetime.utcnow()

    def to_dict(self):
        return {
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            username=data.get('username'),
            email=data.get('email'),
            created_at=data.get('created_at', datetime.utcnow())
        )

class Image:
    def __init__(self, user_id, file_path, category, dominant_color, uploaded_at=None):
        self.user_id = user_id
        self.file_path = file_path
        self.category = category
        self.dominant_color = dominant_color
        self.uploaded_at = uploaded_at if uploaded_at else datetime.utcnow()

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'file_path': self.file_path,
            'category': self.category,
            'dominant_color': self.dominant_color,
            'uploaded_at': self.uploaded_at
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            user_id=data.get('user_id'),
            file_path=data.get('file_path'),
            category=data.get('category'),
            dominant_color=data.get('dominant_color'),
            uploaded_at=data.get('uploaded_at', datetime.utcnow())
        )
    
class CategoryCount:
    def __init__(self,user_id_category, category, count=0):
        self.user_id_category=user_id_category
        self.category = category
        self.count = count
        

    def to_dict(self):
        return {
            'category': self.category,
            'user_id_category':self.user_id_category,
            'count': self.count
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            category=data.get('category'),
            user_id=data.get('user_id_category'),
            count=data.get('count', 0)
            
        )
class Color:
    def __init__(self,user_id,color=None):
        self.user_id=user_id
        self.color = color if color is not None else []
        
    def to_dict(self):
        return {
            'color': self.color,
            'user_id': self.user_id
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            color=data.get('color',[]),
            user_id=data.get('user_id')
        )  
    
class Outfit:
    def __init__(self, user_id, date, event_name=None, images=None):
        self.user_id = user_id
        self.date = date
        self.event_name = event_name
        self.images = images if images is not None else []  # List of image file paths

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'date': self.date,
            'event_name': self.event_name,
            'images': self.images
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            user_id=data.get('user_id'),
            date=data.get('date'),
            event_name=data.get('event_name'),
            images=data.get('images', [])
        )    



