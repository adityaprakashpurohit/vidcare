import os
import sys

# Ensure backend directory is in path and current working directory
backend_dir = os.path.join(os.path.dirname(__file__), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import image_models

if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) == 3 and a[0] == "predict" and a[1] in image_models.CONFIG:
        image_models.predict(a[1], a[2])
    elif len(a) == 1 and a[0] in image_models.CONFIG:
        image_models.run(a[0])
    else:
        sys.exit(f"Usage: python image_models.py [{'|'.join(image_models.CONFIG)}]  or  predict <name> <image>")
