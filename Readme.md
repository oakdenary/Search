# Deep Document Search Frontend

An enterprise-grade, high-fidelity document search and classification interface built with React, Vite, and Tailwind CSS. The application is configured with a hybrid "Demo Mode" API client that enables full offline testing with `localStorage` persistence, making it simple to evaluate and develop features without running a live Python or OpenSearch backend.

---

## 📋 System Prerequisites

Before setting up the project, you must install **Node.js** and its package manager **npm**.

### 1. Install Node.js & npm

We recommend using **Node.js LTS (v18.x or v20.x)**.

#### Option A: Direct Download (Easiest)
* Download and install the package matching your OS from the [Node.js Official Downloads Page](https://nodejs.org/en/download).
* Installers automatically configure path variables for both `node` and `npm`.

#### Option B: Using Node Version Manager (Recommended for Developers)
If you manage multiple projects, use NVM to avoid version conflicts:
* **macOS / Linux**:
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  # Restart terminal or run: source ~/.bashrc
  nvm install 20
  nvm use 20
  ```
* **Windows**: Download and install [nvm-windows](https://github.com/coreybutler/nvm-windows/releases).

#### Verify Installation
Run these commands in your terminal to verify Node.js and npm are successfully configured:
```bash
node --version # Should return v18.x.x, v20.x.x, etc.
npm --version  # Should return v9.x.x, v10.x.x, etc.
```

### Windows Troubleshooting
If either command returns:

```text
'node' is not recognized as an internal or external command
```

or

```text
'npm' is not recognized as an internal or external command
```

then restart your computer and try again.

If the issue persists, reinstall Node.js from the official website and ensure the installer adds Node.js to your system PATH.

---

## 🚀 Step-by-Step Setup

### Open the Project Folder

Open one of the following:

- Command Prompt
- PowerShell
- VS Code Terminal

Navigate to the project directory:

```bash
cd C:\Path\To\Project
```

Example:

```bash
cd C:\Users\YourName\Downloads\Search
```

### Step 1: Install Dependencies
Open your command line in the project folder root and run the install script:
```bash
npm install
```
This downloads React, Vite, Tailwind CSS v4, Axios, React Router, and all dev dependencies into your local `node_modules` directory.

> Note: The first `npm install` may take several minutes depending on your internet speed.

### Step 2: Environment Configuration (Optional)
By default, the client automatically defaults to **Offline Demo Mode** when the backend is offline. If you want to connect to a running Python backend, specify the base API endpoint by creating a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Step 3: Run the Development Server
Launch the local Vite server:
```bash
npm run dev
```
Vite will start up rapidly. Open your browser and navigate to:
```
http://localhost:5173
```

To stop the development server at any time:

```bash
CTRL + C
```

---

## 🔒 Testing & Credentials Bypass

> WARNING: The following bypass credentials are intended for development and demo mode only. Do not enable or use these credentials in a production environment.

* **Automatic Admin Bypass**: Leave both the username and password fields entirely empty on the sign-in screen and click **Sign In**. The client will automatically authorize you as an **Admin** user.
* **Alternative Mock Accounts**:
  * **Administrator Role**: Username: `admin` | Password: `admin123`
  * **Standard User Role**: Username: `user` | Password: `user123`

---

### Recommended Browser

For the best development experience, use one of the following browsers:

- Google Chrome
- Microsoft Edge

## 🛠️ Additional Build Commands

### Compiling Production Assets
To compile the application into optimized, lightweight, and static HTML/JS/CSS assets:
```bash
npm run build
```
The production bundle will be saved inside the `dist/` directory.

### Resetting Mock Database
If you need to reset all directories, mock user accounts, and uploaded documents back to the default state, open your browser console (`F12` or `Option + Cmd + I`), run:
```javascript
localStorage.clear();
```
Then refresh the page. The app will self-heal and re-populate with default mock assets (including multiple test documents containing the prefix `test_`).
