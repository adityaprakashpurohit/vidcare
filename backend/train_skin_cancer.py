import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
from dl_architectures import get_resnet_model

# Configuration
DATASET_DIR = os.path.join(os.path.dirname(__file__), 'datasets', 'skin')
WEIGHTS_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_NAME = 'skin_cancer_model.pt'
NUM_CLASSES = 7
NUM_EPOCHS = 3

os.makedirs(WEIGHTS_DIR, exist_ok=True)

data_transforms = {
    'train': transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ]),
    'val': transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ]),
}

def train():
    train_dir = os.path.join(DATASET_DIR, 'train')
    if not os.path.exists(train_dir):
        print(f"ERROR: No training data found at {train_dir}")
        print("Please place your physical images in class-specific subfolders (e.g. dataset/skin_cancer/train/Melanoma/).")
        return

    print(f"--- Training Skin Cancer Model ---")
    try:
        image_datasets = {x: datasets.ImageFolder(os.path.join(DATASET_DIR, x), data_transforms[x]) 
                          for x in ['train', 'val'] if os.path.exists(os.path.join(DATASET_DIR, x))}
    except FileNotFoundError:
        print(f"ERROR: Folders exist but contain no image files in {DATASET_DIR}")
        return
                      
    dataloaders = {x: DataLoader(image_datasets[x], batch_size=32, shuffle=True, num_workers=0) 
                   for x in image_datasets.keys()}
                   
    dataset_sizes = {x: len(image_datasets[x]) for x in image_datasets.keys()}
    print(f"Classes found: {image_datasets['train'].classes}")
    
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")
    
    model = get_resnet_model(num_classes=NUM_CLASSES, pretrained=True)
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    for epoch in range(NUM_EPOCHS):
        print(f'Epoch {epoch+1}/{NUM_EPOCHS}')
        print('-' * 10)

        for phase in ['train', 'val']:
            if phase not in dataloaders:
                continue
                
            if phase == 'train':
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]

            print(f'{phase.capitalize()} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

    save_path = os.path.join(WEIGHTS_DIR, MODEL_NAME)
    torch.save(model.state_dict(), save_path)
    print(f"Saved trained weights to {save_path}\n")

if __name__ == '__main__':
    train()
