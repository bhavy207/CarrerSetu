# CareerSetu: AI-Powered Career Navigation

CareerSetu is an intelligent career navigation platform designed to bridge the gap between education and employment. It leverages a dual-backend architecture and advanced machine learning models to analyze user skills, identify critical skill gaps, provide tailored course recommendations, and offer real-time predictive job market insights.

![CareerSetu Demo](https://via.placeholder.com/1000x500?text=CareerSetu+Banner)

## 🚀 Key Features

*   **AI Skill Gap Analyzer:** Utilizes a Random Forest Classifier trained on thousands of job profiles. The model intersects a user's skills with job-specific requirements to provide a highly dynamic, tailored **Job Readiness Percentage**.
*   **Job Market Predictor:** Uses Linear Regression to analyze historical labor market data and predict future job demand, average base salaries, and sector growth percentages. 
*   **Smart Course Recommendations:** Suggests hyper-relevant, NSQF-aligned courses dynamic to a user's identified skill gaps to reduce the time it takes to become job-ready.
*   **AI Chatbot Consultant:** Integrated with the Gemini API to offer 24/7 personalized career guidance and answer industry-specific queries.
*   **Immersive User Interface:** Built with React and Framer Motion, featuring glassmorphism elements, micro-animations, and dynamic 3D elements for a premium user experience.
*   **Secure Authentication:** Secure, JWT-based user and admin authentication coupled with strong bcrypt password hashing.

## 💻 Technology Stack

**Frontend**
*   **Framework:** React 18 with Vite
*   **Language:** TypeScript
*   **Styling & Animations:** Vanilla CSS (Glassmorphism), Framer Motion, Lucide Icons
*   **State Management & Requests:** React Context API, Axios

**Primary Backend (Node.js)**
*   **Environment:** Node.js & Express.js
*   **Database:** MongoDB via Mongoose
*   **Authentication:** JSON Web Tokens (JWT), bcryptjs
*   **LLM Integration:** Google Gemini SDK

**AI Microservice (Python)**
*   **Framework:** FastAPI, Uvicorn
*   **Machine Learning:** Scikit-Learn (RandomForestClassifier, MultiLabelBinarizer, LinearRegression)
*   **Data Processing:** Pandas, NumPy
*   **Storage:** Pickle (for caching trained models)

## 📂 Project Structure

```text
CareerSetu/
├── frontend/                  # React + Vite frontend application
│   ├── src/components/        # UI components (SkillGapAnalyzer, Auth, Dashboard, etc.)
│   ├── src/context/           # Auth and App contexts
│   └── src/index.css          # Core CSS tokens and animations
├── backend/                   # Primary Express.js REST API
│   ├── controllers/           # API Logic
│   ├── models/                # MongoDB Schemas (User, Course, etc.)
│   ├── routes/                # Express routes mapping
│   ├── services/              # Integrations (like Gemini)
│   └── index.js               # Main Node.js server entry point
├── backend_python_legacy/     # FastAPI AI Microservice Engine
│   ├── app/routers/           # ML Endpoints (Skill Gap, Market Predictor)
│   ├── data/                  # CSV datasets for Job Roles and Courses
│   ├── models/                # Saved / Cached Scikit-learn models (*.pkl)
│   └── app/main.py            # Main FastAPI entry point
└── start_dev.sh               # Concurrent launch script for all 3 servers
```

## 🛠️ Getting Started

### Prerequisites
*   Node.js (v16 or higher)
*   Python 3.10+
*   MongoDB (A local instance or MongoDB Atlas cluster)

### Installation

1. **Clone the repository and enter the directory:**
    ```bash
    git clone https://github.com/your-username/CareerSetu.git
    cd CareerSetu
    ```

2. **Install Frontend Dependencies:**
    ```bash
    cd frontend
    npm install
    ```

3. **Install Primary Backend Dependencies:**
    ```bash
    cd ../backend
    npm install
    ```

4. **Install Python AI Backend Dependencies:**
    ```bash
    cd ../backend_python_legacy
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```

### Environment Configuration

In the `backend` directory, create a `.env` file and populate it with the following:
```env
PORT=8000
# Update with your local MongoDB string or Atlas connection URL
MONGO_URI=mongodb://localhost:27017/careersetu 
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key_here
```

### Running the Application

The project features a unified launcher script to bring up the Node backend, the Python Server, and the Vite Frontend concurrently.

Navigate to the root directory and run:
```bash
./start_dev.sh
```

**Services will launch at:**
*   **Frontend UI:** `http://localhost:5173`
*   **Primary Backend API:** `http://localhost:8000`
*   **Python AI Microservice:** `http://localhost:8001`

*(To quit all servers, simply press `Ctrl + C` in the terminal serving `start_dev.sh`)*

---
*Built with ❤️ for educational and career-launching acceleration.*
