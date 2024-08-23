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
