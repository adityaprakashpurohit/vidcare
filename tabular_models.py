import os
import sys

# Ensure backend directory is in path and current working directory
backend_dir = os.path.join(os.path.dirname(__file__), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import tabular_models

if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in tabular_models.CONFIG:
        sys.exit(f"Usage: python tabular_models.py [{'|'.join(tabular_models.CONFIG)}]")
    tabular_models.run(sys.argv[1])
