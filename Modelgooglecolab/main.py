from transformers import ViTConfig, ViTForImageClassification
import torch
from PIL import Image
import os
from torchvision import transforms

# Define paths to the model files
model_path = 'C:/Users/student/Desktop/FinalProject/Modelgooglecolab'
config_file = os.path.join(model_path, 'config.json')
model_file = os.path.join(model_path, 'pytorch_model.bin')

# Load the configuration and model
config = ViTConfig.from_pretrained(config_file)
# Convert string keys to integer keys in the id2label dictionary
# config.id2label = {int(k): v for k, v in config.id2label.items()}

model = ViTForImageClassification.from_pretrained(model_file, config=config)


# Define the id2label mapping
id2label = {
    0: "Dress",
    1: "Hat",
    2: "Hoodie",
    3: "Longsleeve",
    4: "Outwear",
    5: "Pants",
    6: "Shoes",
    7: "Shorts",
    8: "Shortsleeve",
    9: "Skirt",
    10: "Vest"
}


# Custom feature extractor logic with normalization
class CustomFeatureExtractor:
    def __init__(self, image_size=224):
        self.image_size = image_size
        self.transform = transforms.Compose([
            transforms.Resize((self.image_size, self.image_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),  # Example normalization
        ])

    def __call__(self, image):
        return self.transform(image).unsqueeze(0)  # Add batch dimension


# Instantiate the custom feature extractor
feature_extractor = CustomFeatureExtractor()


def preprocess_image(image_path):
    image = Image.open(image_path).convert('RGB')
    return feature_extractor(image)


def predict(image_path, threshold=0.20):
    # Preprocess the image
    image_tensor = preprocess_image(image_path)

    # Ensure model is in evaluation mode
    model.eval()

    with torch.no_grad():
        outputs = model(image_tensor)

    # Get predicted class
    logits = outputs.logits
    probabilities = torch.softmax(logits, dim=1)
    max_prob, predicted_class_id = torch.max(probabilities, dim=1)

    # Map the class ID to the class name
    predicted_class_id = predicted_class_id.item()
    max_prob = max_prob.item()

    if max_prob < threshold:
        predicted_class_name = "other"
    else:
        predicted_class_name = id2label.get(predicted_class_id, "Unknown class")

    return predicted_class_id, predicted_class_name, max_prob












'''# Load the configuration and model
config = ViTConfig.from_pretrained(config_file)
model = ViTForImageClassification.from_pretrained(model_file, config=config)

# Define the id2label mapping
id2label = {
    0: "dresses",
    1: "jacket",
    2: "shirts",
    3: "shoes",
    4: "skirts",
    5: "sweater",
    6: "trousers"
}


# Custom feature extractor logic
class CustomFeatureExtractor:
    def __init__(self, image_size=224):
        self.image_size = image_size
        self.transform = transforms.Compose([
            transforms.Resize((self.image_size, self.image_size)),
            transforms.ToTensor(),  # Converts PIL Image to tensor and normalizes
        ])

    def __call__(self, image):
        return self.transform(image).unsqueeze(0)  # Add batch dimension


# Instantiate the custom feature extractor
feature_extractor = CustomFeatureExtractor()


def preprocess_image(image_path):
    image = Image.open(image_path).convert('RGB')
    return feature_extractor(image)


def predict(image_path, threshold=0.4):
    # Preprocess the image
    image_tensor = preprocess_image(image_path)

    # Ensure model is in evaluation mode
    model.eval()

    with torch.no_grad():
        outputs = model(image_tensor)

    # Get predicted class
    logits = outputs.logits
    probabilities = torch.softmax(logits, dim=1)
    max_prob, predicted_class_id = torch.max(probabilities, dim=1)

    # Map the class ID to the class name
    predicted_class_id = predicted_class_id.item()
    max_prob = max_prob.item()

    if max_prob < threshold:
        predicted_class_name = "other"
    else:
        predicted_class_name = id2label.get(predicted_class_id, "Unknown class")

    return predicted_class_id, predicted_class_name, max_prob
'''

# Test with a new image
#image_path = 'C:/Users/student/Desktop/FinalProject/Modelgooglecolab/pant2.jpg'
#predicted_class_id, predicted_class_name, max_prob = predict(image_path)
#print(f'Predicted class ID: {predicted_class_id}, Class name: {predicted_class_name}, Confidence: {max_prob:.2f}')
