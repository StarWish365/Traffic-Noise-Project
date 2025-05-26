# 🚀 Getting Started

We recommend opening this project folder in **Visual Studio Code (VSCode)** for a better development experience.

This repository consists of three main directories:

- `ml-server` – Python server for machine learning model inference  
- `server` – Node.js backend server for handling API requests  
- `vue-project` – Vue 3-based frontend for user interaction and visualization  

## 📦 Requirements

- **Node.js** (Latest version recommended)  
- **Python**  (Latest version recommended)  
- **npm** (Comes with Node.js)  
- **pip** (Comes with Python)

## 🛠️ Installation & Run Instructions

1. **Install Node.js globally**  
   Download and install the latest version from [nodejs.org](https://nodejs.org/).

2. **Install backend dependencies**

   ```bash
   cd server
   npm install
3. **Install frontend dependencies**

   ```bash
   cd vue-project
   npm install
4. **Install Python dependencies for ML server**

   ```bash
   cd ml-server
   pip install -r requirements.txt
5. **Start the machine learning server**

   ```bash
   cd ml-server
   python main.py
6. **Start the Node.js backend server**
    Before starting the server, go to:
    ```pgsql
    traffic-noise-project/server/database/db.js
    ```
    And update the following fields according to your local PostgreSQL setup:
   ```js
    const pool = new Pool({
      user: 'your_username',
      host: 'localhost',
      database: 'your_database',
      password: 'your_password',
      port: 5432,
    });
   const client = new Client({
      user: 'your_username',
      host: 'localhost',
      database: 'your_database',
      password: 'your_password',
      port: 5432,
    });
   ```
   Then run in the terminal
   ```bash
   cd server
   node app.js
8. **Start the Vue frontend**

   ```bash
   cd vue-project
   npm run dev
## Database setting
The `backup.sql` file is the postgresql database file. Use `import` to import it to the database and install the `POSTGIS` plugin.
