from flask import current_app, jsonify, request, session
from bson.objectid import ObjectId
from werkzeug.utils import secure_filename
from datetime import datetime
from rembg import remove
from PIL import Image as PILImage
import os


from .models1 import User, Image
from .utils import classify_image, extract_dominant_colors

def get_users_collection():
    return current_app.db.users

def get_images_collection():
    return current_app.db.images

# Helper function to save the uploaded image and return the file path
def save_image(image_file):
    upload_folder = current_app.config['UPLOAD_FOLDER']
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    filename = secure_filename(image_file.filename)
    file_path = os.path.join(upload_folder, filename)

    # Open the image using PIL
    image = PILImage.open(image_file)
    # Remove the background
    image_no_bg = remove(image)
    # Convert the image to RGBA to ensure it has an alpha channel
    image_no_bg = image_no_bg.convert("RGBA")
    # Get the bounding box of the non-transparent areas
    bbox = image_no_bg.getbbox()
    # Crop the image to remove any extra transparent space
    if bbox:
        image_cropped = image_no_bg.crop(bbox)
    else:
        image_cropped = image_no_bg
    # Save the image as PNG to preserve transparency
    file_path = os.path.splitext(file_path)[0] + ".png"  # Ensure the file is saved as PNG
    image_cropped.save(file_path, format="PNG")

    return file_path    

    # Crop the image to remove any extra transparent space
    '''image_cropped = image_no_bg.crop(bbox)
     # Determine the format based on the file extension
    file_ext = os.path.splitext(filename)[1].lower()
    if file_ext in ['.jpg', '.jpeg']:
        # Convert to RGB before saving as JPEG
        image_cropped = image_cropped.convert("RGB")
        image_cropped.save(file_path, format="JPEG")
    elif file_ext == '.png':
        # Save as PNG, which supports RGBA
        image_cropped.save(file_path, format="PNG")
    else:
        # Handle other formats if necessary (default to saving with original format)
        image_cropped.save(file_path)

    return file_path'''



# Middleware to check if the user is logged in
def login_required(f):
    def wrap(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Unauthorized access'}), 401
        user = get_users_collection().find_one({'_id': ObjectId(user_id)})
        if not user:
            session.clear()  # Clear the session if the user is not found
            return jsonify({'error': 'User not found, session cleared'}), 401
        return f(*args, **kwargs)
    wrap.__name__ = f.__name__
    return wrap


# CRUD operations for users

# User Authentication - Sign In
@current_app.route('/users/signin', methods=['POST'])
def sign_in():
    user_data = request.json
    if not user_data or not user_data.get('username') or not user_data.get('email'):
        return jsonify({'error': 'Username and email are required'}), 400

    user = get_users_collection().find_one({
        'username': user_data.get('username'),
        'email': user_data.get('email')
    })

    if user:
        session['user_id'] = str(user['_id'])
        return jsonify({'message': 'Sign in successful'})
    else:
        return jsonify({'error': 'Invalid username or email'}), 401
    
# Get User Profile
@current_app.route('/users/profile', methods=['GET'])
@login_required
def get_user_profile():
    user_id = session.get('user_id')
    user = get_users_collection().find_one({'_id': ObjectId(user_id)})
    if user:
        return jsonify({'username': user['username'], 'email': user['email']})
    else:
        return jsonify({'error': 'User not found'}), 404

# Sign Out
@current_app.route('/users/signout', methods=['POST'])
@login_required
def sign_out():
    session.pop('user_id', None)
    return jsonify({'message': 'Sign out successful'})


#מביא את כול המשתמשים ולא בטוח שאני רוצה את זה 
'''@current_app.route('/users', methods=['GET'])
@login_required
def get_users():
    user_id = request.args.get('user_id')
    if user_id:
        user = get_users_collection().find_one({'_id': ObjectId(user_id)})
        if user:
            user['_id'] = str(user['_id'])
            return jsonify(user)
        else:
            return jsonify({'error': 'User not found'}), 404
    else:
        users = list(get_users_collection().find())
        for user in users:
            user['_id'] = str(user['_id'])
        return jsonify(users)'''

# Create a New User - Sign Up
@current_app.route('/users', methods=['POST'])
def add_user():
    user_data = request.json
    if not user_data or not user_data.get('username') or not user_data.get('email'):
        return jsonify({'error': 'Username and email are required'}), 400

    user = User.from_dict(user_data)
    inserted_id = get_users_collection().insert_one(user.to_dict()).inserted_id
    session['user_id'] = str(inserted_id)
    return jsonify({'inserted_id': str(inserted_id), 'message': 'User created and signed in successfully'}), 201

# Update User Data
@current_app.route('/users/update', methods=['PUT'])
@login_required
def update_user():
    user_id = session.get('user_id')
    update_data = request.json
    get_users_collection().update_one({'_id': ObjectId(user_id)}, {'$set': update_data})
    return jsonify({'message': 'User updated successfully'})

# Delete a user with all associated data
@current_app.route('/users/delete_account', methods=['DELETE'])
@login_required
def delete_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not authenticated'}), 401

    user_id_obj = ObjectId(user_id)
    # Delete user data
    user_delete_result = get_users_collection().delete_one({'_id': user_id_obj})
    # Delete all images and related data of the user
    images_delete_result = get_images_collection().delete_many({'user_id': user_id_obj})
    # Check if deletion was successful
    if user_delete_result.deleted_count > 0:
        return jsonify({
            'message': 'User account and associated data deleted successfully',
            'deleted_images_count': images_delete_result.deleted_count
        }), 200
    else:
        return jsonify({'error': 'User not found or deletion failed'}), 404

# CRUD operations for images

'''def save_image(image_file):
    # Ensure the uploads directory exists
    upload_folder = current_app.config['UPLOAD_FOLDER']
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    
    # Construct the file path
    file_path = os.path.join(upload_folder, image_file.filename)
    
    # Save the file
    image_file.save(file_path)
    
    return file_path
'''


#Get All User Images to display in the app
@current_app.route('/images', methods=['GET'])
@login_required
def get_all_user_images():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not authenticated'}), 401

    images = list(get_images_collection().find({'user_id': ObjectId(user_id)}))
    for image in images:
        image['_id'] = str(image['_id'])
        image['user_id'] = str(image['user_id'])
    return jsonify(images)

#Get Filtered Images 
@current_app.route('/images/search', methods=['GET'])
@login_required
def get_filtered_images():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not authenticated'}), 401

    filters = {'user_id': ObjectId(user_id)}

    # Collect filter criteria from query parameters
    category = request.args.getlist('category')
    colors = request.args.getlist('dominant_color')  # Get multiple values
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    if category:
        if len(category) == 1:
            filters['category'] = category[0]  # Single category, no $in needed
        else:
            filters['category'] = {'$in': category}  # Multiple categories
    if colors:
        
        filters['dominant_color'] = {'$in': colors}  # Filter by multiple colors
    
    # Handle date filtering
    if date_from:
        try:
           # Compare directly as strings
           filters['uploaded_at'] = {'$gte': date_from}
        except ValueError:
            return jsonify({'error': 'Invalid date_from format. Use YYYY-MM-DD format.'}), 400
    if date_to:
        try:
            if 'uploaded_at' not in filters:
                filters['uploaded_at'] = {}
            filters['uploaded_at']['$lte'] = date_to
        except ValueError:
           return jsonify({'error': 'Invalid date_to format. Use YYYY-MM-DD format.'}), 400 
        
    print("Filters:", filters)
    images = list(get_images_collection().find(filters))
    
    if not images:
        return jsonify({'message': 'No images were found according to the filters'}), 404

    for image in images:
        image['_id'] = str(image['_id'])
        image['user_id'] = str(image['user_id'])
    
    return jsonify(images)


# POST: Create a new image by sending user ID and image file
@current_app.route('/images', methods=['POST'])
@login_required
def add_image():
    if 'image' not in request.files or request.files['image'].filename == '':
        return jsonify({'error': 'No image file provided. Please upload an image.'}), 400
    
    image_file = request.files['image']
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID not found in session'}), 400
    
    #file_path = save_image(image_file)
    category = classify_image(image_file)
    file_path = save_image(image_file)
    
    # Check if the category is "other"
    if category.lower() == 'other':
        dominant_color = None  # Set dominant color to None for category "other"
    else:
        dominant_color = extract_dominant_colors(file_path)  # Extract color only if not "other"

    image_data = Image(
        user_id=ObjectId(session.get('user_id')),
        file_path=file_path,
        category=category,
        dominant_color=dominant_color,
        uploaded_at=datetime.utcnow().strftime('%Y-%m-%d')
        
    )

    inserted_id = get_images_collection().insert_one(image_data.to_dict()).inserted_id
    return jsonify({'inserted_id': str(inserted_id), 'message': 'Image uploaded successfully'}), 201


# PUT: Update the category of an image by providing user ID and image ID
@current_app.route('/images/<image_id>', methods=['PUT'])
@login_required
def update_image_category(image_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID not found in session'}), 400
    
    # Convert string IDs to ObjectId
    try:
        object_id = ObjectId(image_id)
        user_object_id = ObjectId(user_id)
    except Exception as e:
        return jsonify({'error': 'Invalid ID format'}), 400
    
    image = get_images_collection().find_one({'_id': object_id, 'user_id': user_object_id})
    if not image:
        return jsonify({'error': 'Image not found'}), 404

    update_data = request.json
    new_category = update_data.get('category')
    # Define allowed categories
    allowed_categories = {'Longsleeve','Shortsleeve', 'Shoes', 'Dress', 'Vest', 'Outwear', 'Pants', 'Skirt','Hat', 'Hoodie', 'Shorts'}
    
    if not new_category:
        return jsonify({'error': 'Category not provided'}), 400
    if new_category not in allowed_categories:
        return jsonify({'error': f'Invalid category. Allowed categories are: {", ".join(allowed_categories)}'}), 400

    get_images_collection().update_one(
        {'_id': object_id, 'user_id': user_object_id},
        {'$set': {'category': new_category}}
    )

    return jsonify({'message': 'Image category updated successfully'}), 200

# DELETE: Delete an image by ID
@current_app.route('/images/<image_id>', methods=['DELETE'])
@login_required
def delete_image(image_id):
    # Find the image document in MongoDB by its ID and user's ID
    image_document = get_images_collection().find_one({'_id': ObjectId(image_id), 'user_id': ObjectId(session.get('user_id'))})
    
    if image_document:
        # Extract the image file path from the document
        file_path = image_document.get('file_path')  # Assuming the full file path is stored in the 'path' field

        # Delete the document from MongoDB
        result = get_images_collection().delete_one({'_id': ObjectId(image_id),'user_id':ObjectId(session.get('user_id')) })

        if result.deleted_count == 1:
            # Check if there are any other documents referencing the same file path
            other_references = get_images_collection().find_one({'file_path': file_path,'user_id':ObjectId(session.get('user_id'))})

            if other_references is None:
                # No other references, safe to delete the file
                if os.path.exists(file_path):
                    os.remove(file_path)
                    return jsonify({'message': 'Image and file path deleted successfully'}), 200
                else:
                    return jsonify({'message': 'File does not exist, but image document deleted successfully'}), 200
            else:
                # There are still references, so only delete the document from MongoDB
                return jsonify({'message': 'Image document deleted, but file is still referenced by other images'}), 200
        else:
            return jsonify({'message': 'Failed to delete image from database'}), 500
    else:
        return jsonify({'message': 'Image not found'}), 404
   