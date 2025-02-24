# FastAPI Contact Management API  
This is a FastAPI-based Contact Management System Built With HTML, CSS, Bootstrap, and JavaScript.  

- **Frontend (Live):** [seemy.codes](https://seemy.codes)  
- **API (Live):** [api.seemy.codes](https://api.seemy.codes)  

---

## 1. Folder Structure  
```
BackEnd/   → FastAPI backend  
Database/  → SQLite database  
FrontEnd/  → Bootstrap-based frontend  
README.md  → Project setup guide  
```

---

## 2. Clone & Run the API Locally  
```sh
git clone https://github.com/seemycodes/repo.git
cd repo/BackEnd
python -m venv venv
venv\Scripts\Activate  # Windows
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API runs locally at: `http://127.0.0.1:8000`  

---

## 3. API Endpoints  
| Method | Endpoint | Description |  
|--------|---------|-------------|  
| GET | `/contacts/` | Get all contacts |  
| POST | `/contacts/` | Create a contact |  
| PATCH | `/contacts/{id}` | Update a contact |  
| DELETE | `/contacts/{id}` | Delete a contact |  
| DELETE | `/contacts/` | Delete all contacts |  

Live API: [api.seemy.codes](https://api.seemy.codes)  

---

## 4. Access the Frontend (Live)  
[seemy.codes](https://seemy.codes)  

---

## Future Updates  
- Search Contacts  
- UI/UX Improvements  
- Dark Mode Support  
- Login & Logout Authentication System  
- Upload & Display Contact Images  


