# FastAPI Contact Management API  
This is a FastAPI-based Contact Management System Built With HTML, CSS, Bootstrap, and JavaScript.  

- **Frontend (Live):** [seemy.codes](https://seemy.codes)  
- **API (Live):** [api.seemy.codes/docs](https://api.seemy.codes/docs)  

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
git clone https://github.com/seemycodes/contacts_web_app1.git
cd repo/BackEnd
python -m venv venv
venv\Scripts\Activate  # Windows
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API runs locally at: `http://127.0.0.1:8000`  

---

## 3. API Integration  

### If the API is NOT deployed on localhost, update `config.json` accordingly, 
- **File Path:** `FronEend/assets/configs/config.json`  
please see examples below

#### Deployments using Domain Name  
```json
{
    "apiBaseUrl": "https://example.com"
}
```
#### Deployments using sub Domains  
```json
{
    "apiBaseUrl": "https://api.example.com"
}
```
#### Deployments using url endpoints  
```json
{
    "apiBaseUrl": "https://example.com/URLendpoint"
}
```
#### Deployments using Public IP and Port Number
```json
{
    "apiBaseUrl": "https://12.34.56.78:8000"
}
```

---

## 4. API Endpoints  
| Method | Endpoint | Description |  
|--------|---------|-------------|  
| GET | `/contacts/` | Get all contacts |  
| POST | `/contacts/` | Create a contact |  
| PATCH | `/contacts/{id}` | Update a contact |  
| DELETE | `/contacts/{id}` | Delete a contact |  
| DELETE | `/contacts/` | Delete all contacts |  

Live API: [api.seemy.codes](https://api.seemy.codes)  

---

## 5. Access the Frontend (Live)  
[seemy.codes](https://seemy.codes)  

---

## Future Updates  
- ✅ Search Contacts  
- 🛠️UI/UX Improvements  
- ⏳Dark Mode Support  
- ⏳Login & Logout Authentication System  
- ⏳Upload & Display Contact Images  


