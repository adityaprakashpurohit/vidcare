# Background Task Logs Directory & Registry

This document records the background task executions for VidCare, their logs, and configuration details.

## Log Storage Location
All background task `.log` files are stored in:
- Directory: [`docs/tasks/`](file:///d:/project/vid-care/docs/tasks)
- Future Task Logs: A filesystem junction links the background agent task logging directly to `docs/tasks/`, ensuring all future background tasks automatically write their logs directly into this folder.

---

## Model Training Task Logs
Dedicated Subdirectory: [`docs/tasks/model_tasks/`](file:///d:/project/vid-care/docs/tasks/model_tasks)

| Model Pipeline | Modality | Task ID | Log File | Size |
|:---|:---|:---:|:---|:---|
| **Heart Disease** | Tabular ML/DL | `task-134` | [`docs/tasks/model_tasks/task-134.log`](file:///d:/project/vid-care/docs/tasks/model_tasks/task-134.log) | 4.9 KB |
| **Liver Disease** | Tabular ML/DL | `task-140` | [`docs/tasks/model_tasks/task-140.log`](file:///d:/project/vid-care/docs/tasks/model_tasks/task-140.log) | 7.2 KB |
| **Breast Cancer** | Tabular ML/DL | `task-144` | [`docs/tasks/model_tasks/task-144.log`](file:///d:/project/vid-care/docs/tasks/model_tasks/task-144.log) | 4.9 KB |
| **Disease Prediction** | Tabular ML/DL | `task-148` | [`docs/tasks/model_tasks/task-148.log`](file:///d:/project/vid-care/docs/tasks/model_tasks/task-148.log) | 16.1 KB |
| **Skin Cancer** | Computer Vision | `task-191` | [`docs/tasks/model_tasks/task-191.log`](file:///d:/project/vid-care/docs/tasks/model_tasks/task-191.log) | 101.2 KB |
| **Breast Ultrasound** | Computer Vision | `task-216` | [`docs/tasks/model_tasks/task-216.log`](file:///d:/project/vid-care/docs/tasks/model_tasks/task-216.log) | 24.9 KB |
| **Brain Tumor MRI** | Computer Vision | `task-232` | [`docs/tasks/model_tasks/task-232.log`](file:///d:/project/vid-care/docs/tasks/model_tasks/task-232.log) | 204.7 KB |
| **COVID-19 Radiography** | Computer Vision | `task-248` | [`docs/tasks/model_tasks/task-248.log`](file:///d:/project/vid-care/docs/tasks/model_tasks/task-248.log) | 688.8 KB |
| **Pneumonia Chest X-Ray** | Computer Vision | `task-266` | [`docs/tasks/model_tasks/task-266.log`](file:///d:/project/vid-care/docs/tasks/model_tasks/task-266.log) | 168.9 KB |

---

## Verification & Operational Task Logs

| Task ID | Log File | Description | Status |
|:---|:---|:---|:---|
| **task-27** | [`docs/tasks/task-27.log`](file:///d:/project/vid-care/docs/tasks/task-27.log) | Scanned workspace for all CSV dataset locations | Completed |
| **task-176** | [`docs/tasks/task-176.log`](file:///d:/project/vid-care/docs/tasks/task-176.log) | Comprehensive model & system verification suite (9/9 slots verified) | Completed |
| **task-180** | [`docs/tasks/task-180.log`](file:///d:/project/vid-care/docs/tasks/task-180.log) | Task monitoring timer during system verification | Completed |
| **task-186** | [`docs/tasks/task-186.log`](file:///d:/project/vid-care/docs/tasks/task-186.log) | Verified CLI execution of `tabular_models.py` | Completed |
| **task-196** | [`docs/tasks/task-196.log`](file:///d:/project/vid-care/docs/tasks/task-196.log) | Endpoint test for `/api/diseases` | Completed |
| **task-205** | [`docs/tasks/task-205.log`](file:///d:/project/vid-care/docs/tasks/task-205.log) | Verified `MODELS_DIR` resolution and model loading in `app.py` | Completed |
| **task-242** | [`docs/tasks/task-242.log`](file:///d:/project/vid-care/docs/tasks/task-242.log) | Verification test ensuring future background task logs automatically save to `docs/tasks/` | Completed |

---

## How Future Logs Are Saved Here
1. An NTFS Directory Junction is configured between the local agent task directory on the C: drive and `D:\project\vid-care\docs\tasks`.
2. Any background command or subagent operation that outputs to a `task-<id>.log` file will immediately persist into this folder.
