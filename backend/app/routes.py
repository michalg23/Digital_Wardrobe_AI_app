from flask import current_app, jsonify, request, session ,send_from_directory
from bson.objectid import ObjectId
from werkzeug.utils import secure_filename
from datetime import datetime
from rembg import remove
from PIL import Image as PILImage
import os
from flask_cors import CORS
from pymongo.errors import DuplicateKeyError
from backend.app import create_token, create_app
from .models1 import User, Image ,CategoryCount
from .utils import classify_image, extract_dominant_colors

app = create_app()  # Initialize the app

def get_users_collection():
    return current_app.db.users

def get_images_collection():
    return current_app.db.images

def get_amount_collection():
    return current_app.db.category_amount

def get_colors_collection():
    return current_app.db.colors

def get_outfits_collection():
    return current_app.db.outfit


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

@current_app.route('/', methods=['GET'])
def startapp():
    return jsonify({"status": "success", "message": "Connected to server"})

  
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
        token = create_token(str('_id'),app.secret_key)
        return jsonify({'message': 'Sign in successful','token':token,}),200
    else:
        return jsonify({'error': 'Invalid username or email'}), 401
    
# Get User Profile
@current_app.route('/users/profile', methods=['GET'])
@login_required
def get_user_profile():
    user_id = session.get('user_id')
    user = get_users_collection().find_one({'_id': ObjectId(user_id)})
    if user:
        return jsonify({'username': user['username'], 'email': user['email'],'id':user_id}),200
    else:
        return jsonify({'error': 'User not found'}), 404

# Sign Out
@current_app.route('/users/signout', methods=['POST'])
@login_required
def sign_out():
    session.pop('user_id', None)
    return jsonify({'message': 'Sign out successful'})



# sign up
@current_app.route('/users/signup', methods=['POST'])
def add_user():
    user_data = request.json
    if not user_data or not user_data.get('username') or not user_data.get('email'):
        return jsonify({'error': 'Username and email are required'}), 400

    # Check if the email already exists
    existing_user = get_users_collection().find_one({'email': user_data.get('email')})
    if existing_user:
        return jsonify({'error': 'Email already in use'}), 400

    # Create new user
    user = User.from_dict(user_data)
    try:
        inserted_id = get_users_collection().insert_one(user.to_dict()).inserted_id
    except DuplicateKeyError:
        return jsonify({'error': 'Email already in use'}), 400

    session['user_id'] = str(inserted_id)
    # Generate token
    token = create_token(str(inserted_id),app.secret_key)
    return jsonify({'inserted_id': str(inserted_id),'token':token, 'message': 'User created and signed in successfully'}), 201


# Update User Data
@current_app.route('/users/update', methods=['PUT'])
@login_required
def update_user():
    user_id = session.get('user_id')
    update_data = request.json
    
    # If an email is provided in the update data, check for uniqueness
    new_email = update_data.get('email')
    if new_email:
        existing_user = get_users_collection().find_one({'email': new_email, '_id': {'$ne': ObjectId(user_id)}})
        if existing_user:
            return jsonify({'error': 'Email already in use'}), 400

    # Update the user data
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
    colors_delete_result = get_colors_collection().delete_one({'user_id':user_id_obj})
    categories_delete_result = get_amount_collection().delete_many({'user_id_category': user_id_obj})
    outfits_delete_result = get_outfits_collection().delete_many({'user_id': user_id_obj})


    # Check if deletion was successful
    if user_delete_result.deleted_count > 0:
        return jsonify({
            'message': 'User account and associated data deleted successfully',
            'deleted_images_count': images_delete_result.deleted_count
        }), 200
    else:
        return jsonify({'error': 'User not found or deletion failed'}), 404

# CRUD operations for images


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
    category = request.args.get('category')
    colors = request.args.get('dominant_color')  # Get multiple values
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    # Parse categories and colors from comma-separated strings into lists
    if category:
        category_list = category.split(',') if category else []  # Convert comma-separated string to list
        if len(category_list) == 1:
            filters['category'] = category_list[0]  # Single category, no $in needed
        else:
            filters['category'] = {'$in': category_list}  # Multiple categories
    if colors:
        colors_list = colors.split(',') if colors else []  # Convert comma-separated string to list
        if len(colors_list) == 1:
           filters['dominant_color'] = colors_list[0]
        else:    
           filters['dominant_color'] = {'$in': colors_list}  # Filter by multiple colors
    
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
        return jsonify({'message': 'No images were found according to the filters'}), 200

    for image in images:
        image['_id'] = str(image['_id'])
        image['user_id'] = str(image['user_id'])
    
    return jsonify(images)


@current_app.route('/chartpieData', methods=['GET'])
@login_required
def get_category_counts():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID not found in session'}), 400

    # Allowed categories with initial count set to 0
    allowed_categories = {'Longsleeve', 'Shortsleeve', 'Shoes', 'Dress', 'Vest', 
                          'Outwear', 'Pants', 'Skirt', 'Hat', 'Hoodie', 'Shorts'}
    category_counts = {category: 0 for category in allowed_categories}  # Initialize counts to zero

    # Query the database for the count of each category for the specific user
    categories_count_cursor = get_amount_collection().find({'user_id_category':ObjectId(session.get('user_id'))})
    
    for category_count in categories_count_cursor:
        print("Fetched document:", category_count)  # Debugging output
        # Fill the counts based on the existing data
        category = category_count.get('category')
        count = int(category_count.get('count'))
        print(f"Processing category: {category}, count: {count}")  # Debugging output
        if category in category_counts:  # Only consider allowed categories
             category_counts[category] += count # Increment the count

    # Calculate total count
    total_count = sum(category_counts.values())
    # Debugging: print category counts and total count
    print(f"Category counts: {category_counts}")  # Debugging output
    print(f"Total count: {total_count}")  # Debugging output

    # Format the result for a friendly display
    formatted_counts = ', '.join(f"{category}: {count}" for category, count in category_counts.items())

    # Return the formatted result
    return jsonify({'counts': formatted_counts, 'total_count': total_count}), 200


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
    
    if dominant_color:
        # Retrieve existing color document or create a new one
        color_document = get_colors_collection().find_one({'user_id': ObjectId(user_id)})
        
        if color_document:
            existing_colors = color_document.get('color', [])
            # Add new colors if not already present
            new_colors = [color for color in dominant_color if color not in existing_colors]
            if new_colors:
                get_colors_collection().update_one(
                    {'user_id': ObjectId(user_id)},
                    {'$addToSet': {'color': {'$each': new_colors}}}  # Add new colors, avoiding duplicates
                )
        else:
            # Create a new color document if it doesn't exist
            get_colors_collection().insert_one({
                'user_id': ObjectId(user_id),
                'color': dominant_color  # Store all colors
            })

    image_data = Image(
        user_id=ObjectId(session.get('user_id')),
        file_path=file_path,
        category=category,
        dominant_color=dominant_color,
        uploaded_at=datetime.utcnow().strftime('%Y-%m-%d')
        
    )
    user_id1=session.get('user_id')
    inserted_id = get_images_collection().insert_one(image_data.to_dict()).inserted_id
    categoryAmount1 = get_amount_collection().find({'user_id_category': ObjectId(user_id1)})

    
    if categoryAmount1 is not None:
             # Initialize a flag to check if the category exists
                category_exists = False
                for document in categoryAmount1:
                    if document['category'] == category:
                      # If the category exists, update the count
                      get_amount_collection().update_one({'category': document['category'],'user_id_category': ObjectId(user_id1)},{'$inc': {'count': 1}}  )   # Increment the count by 1
                      category_exists = True
                      break
                # If the category was not found, insert a new document
                if not category_exists:
                    get_amount_collection().insert_one({'user_id_category': ObjectId(user_id1),'category': category,'count': 1})    
                    
    else:
         get_amount_collection().insert_one({'user_id_category':ObjectId(user_id1),'category': category,'count': 1})

    print("the data is:",vars(image_data))     
    return jsonify({'_id':str(inserted_id),'user_id':str(user_id1) ,'message': 'Image uploaded successfully','file_path': file_path,'category': category,'dominant_color': dominant_color,'uploaded_at': datetime.utcnow().strftime('%Y-%m-%d')}), 201


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
@current_app.route('/images/<image_id>/<category>', methods=['DELETE'])
@login_required
def delete_image(image_id, category):
    # Find the image document in MongoDB by its ID and user's ID
    image_document = get_images_collection().find_one({'_id': ObjectId(image_id), 'user_id': ObjectId(session.get('user_id'))})
    print(image_document)
    if category != "other":
        categories_count = get_amount_collection().find_one({'category':category,'user_id_category':ObjectId(session.get('user_id'))})
        if categories_count is not None :
            if categories_count['count'] >1:
                get_amount_collection().update_one({'category': category,'user_id_category': ObjectId(session.get('user_id'))},{'$inc': {'count': -1}}  )   # decrease the count by 1
            else :
                get_amount_collection().delete_one({'category': category,'user_id_category': ObjectId(session.get('user_id'))} )   # Delete the category document if count is 1 or less
        else:
            return jsonify({'message': 'Category not found in category amount collection'}), 500


    if image_document:
        # Extract the image file path from the document
        file_path = image_document.get('file_path')  # Assuming the full file path is stored in the 'path' field

        # Delete the document from MongoDB
        result = get_images_collection().delete_one({'_id': ObjectId(image_id),'user_id':ObjectId(session.get('user_id'))})
        print(result)
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
   
# GET: Retrieve all colors for a specific user
@current_app.route('/users/<user_id>/colors', methods=['GET'])
@login_required
def get_user_colors(user_id):
    try:
        color_document = get_colors_collection().find_one({'user_id': ObjectId(user_id)})
        if color_document:
            colors = color_document.get('color', [])  # Extract colors list
        else:
            colors = []  # No colors if document doesn't exist
        
        return jsonify({'color': colors}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        
    
@current_app.route('/get-image-url', methods=['POST'])
def get_image_url():
    upload_folder = current_app.config['UPLOAD_FOLDER']
    data = request.json
    file_path = data.get('file_path')

    # Extract the filename from the file_path sent from frontend
    filename = os.path.basename(file_path)

    # Check if the file exists in the uploads folder
    if os.path.exists(os.path.join(upload_folder, filename)):
        # Return the relative URL or path to be used by the frontend
        return jsonify({"url": f"/uploads/{filename}"}), 200
    else:
        # Return a 404 error if the file is not found
        return jsonify({"error": "File not found"}), 404


# Route to serve the image files (you can access them via /uploads/<filename>)
@current_app.route('/uploads/<filename>')
def serve_image(filename):
    upload_folder = current_app.config['UPLOAD_FOLDER']
    return send_from_directory(upload_folder, filename)


# Get All User Outfits to display in the app
@current_app.route('/outfits', methods=['GET'])
@login_required
def get_all_user_outfits():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not authenticated'}), 401

    # Query MongoDB for outfits that belong to the user
    outfits = list(get_outfits_collection().find({'user_id': ObjectId(user_id)}))
    # If no outfits found, return an empty list
    if not outfits:
        return jsonify([])
    # Convert ObjectId to string and format outfits
    for outfit in outfits:
        outfit['_id'] = str(outfit['_id'])
        outfit['user_id'] = str(outfit['user_id'])

    return jsonify(outfits), 200




# Add a new outfit to the database
@current_app.route('/add_outfit', methods=['POST'])
@login_required
def add_outfit():
    # Get the user ID from session
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not authenticated'}), 401

    # Parse the JSON request data
    data = request.get_json()

    # Ensure required fields are present
    event_name = data.get('event_name')
    date = data.get('date')
    images = data.get('images')

    if not event_name or not date or not images:
        return jsonify({'error': 'Missing required fields'}), 400

    # Convert date string to a datetime object (optional)
    try:
        date_obj = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    # Create an outfit object
    outfit_data = {
        'user_id': ObjectId(user_id),
        'event_name': event_name,
        'date': date,
        'images': images  # List of image paths
    }

    # Insert the outfit into MongoDB
    outfit_id = get_outfits_collection().insert_one(outfit_data).inserted_id

    # Return the newly created outfit document
    outfit_data['_id'] = str(outfit_id)
    outfit_data['user_id'] = str(user_id)

    return jsonify(outfit_data), 201

# Delete an outfit by its ID
@current_app.route('/delete_outfit/<outfit_id>', methods=['DELETE'])
@login_required
def delete_outfit(outfit_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not authenticated'}), 401

    try:
        # Validate the outfit_id to ensure it's a valid ObjectId
        outfit_object_id = ObjectId(outfit_id)
    except Exception:
        return jsonify({'error': 'Invalid outfit ID format'}), 400

    # Try to find and delete the outfit for the authenticated user
    result = get_outfits_collection().delete_one({'_id': outfit_object_id, 'user_id': ObjectId(user_id)})

    if not result:
         return jsonify({'no outfits '}), 404


    if result.deleted_count == 1:
        return jsonify({'message': 'Outfit deleted successfully'}), 200
    #else:
        #return jsonify({'error': 'Outfit not found or not authorized to delete this outfit'}), 404

@current_app.route('/update_outfit/<outfit_id>', methods=['PUT'])
@login_required
def update_outfit(outfit_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not authenticated'}), 401

    # Parse the incoming JSON data
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request, no data provided'}), 400

    # Extract the fields to update from the JSON data
    event_name = data.get('event_name')
    images = data.get('images')

    # Ensure at least one field is provided for the update
    if event_name is None and images is None:
        return jsonify({'error': 'No fields provided to update'}), 400

    # Create the update dictionary
    update_data = {}
    if event_name is not None:
        update_data['event_name'] = event_name
    if images is not None:
        update_data['images'] = images

    try:
        # Convert the outfit_id to ObjectId
        outfit_object_id = ObjectId(outfit_id)
    except Exception:
        return jsonify({'error': 'Invalid outfit ID format'}), 400

    # Perform the update in MongoDB
    result = get_outfits_collection().update_one(
        {'_id': outfit_object_id, 'user_id': ObjectId(user_id)},
        {'$set': update_data}
    )
    if not result :
        return jsonify({'error': 'Outfit not found or not authorized to update'}), 404

    if result.matched_count == 1:
        return jsonify({'message': 'Outfit updated successfully'}), 200


