import os
from PIL import Image as PILImage
from colorthief import ColorThief
#from Modelgooglecolab.main import predict
from Modelgooglecolab import main
import matplotlib.pyplot as plt
import webcolors

def classify_image(image_path):
    _, predicted_class_name, _ = main.predict(image_path)
    return predicted_class_name

def extract_dominant_colors(image_path):
    # Use ColorThief to extract the dominant colors from the image
    ct = ColorThief(image_path)
    dominant_color = ct.get_color(quality=1)

    #plt.imshow([[dominant_color]])
    #plt.show()

    palette = ct.get_palette(color_count=2)
    #plt.imshow([[palette[i] for i in range(3)]])
    #print(f"Palette contains {len(palette)} colors: {palette}")
    #plt.show()


    #webcolors.CSS3_NAMES_TO_HEX.items()
    def closest_color(rgb):
        differences = {}
        for color_name, color_hex in webcolors._definitions._CSS3_NAMES_TO_HEX.items():
            r, g, b = webcolors.hex_to_rgb(color_hex)
            differences[sum([(r - rgb[0]) ** 2,
                             (g - rgb[1]) ** 2,
                             (b - rgb[2]) ** 2])] = color_name
        return differences[min(differences.keys())]

    color_names = []
    for color in palette:
        try:
            cname = webcolors.rgb_to_name(color)
        except ValueError:
            cname = closest_color(color)
        color_names.append(cname)
        #plt.show()
        # Return the actual number of colors found without repeating
    return list(set(color_names)) 
    
