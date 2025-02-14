from services.database import db

class Dish(db.Model):
        __tablename__ = 'dish'
        id = db.Column(db.Integer, primary_key=True)
        category = db.Column(db.String(255), nullable=False)
        name = db.Column(db.String(255), nullable=False)
        price = db.Column(db.Float, nullable=False)
        image_url = db.Column(db.String(255), nullable=True)
        ingredients = db.Column(db.Text, nullable=True)  # Store as JSON string

        def __init__(self, category, name, price, image_url, ingredients):
            self.category = category
            self.name = name
            self.price = price
            self.image_url = image_url
            self.ingredients = ingredients

        def to_dict(self):
            return {
                "id": self.id,
                "category": self.category,
                "name": self.name,
                "price": self.price,
                "image_url": self.image_url,
                "ingredients": self.ingredients
            }
