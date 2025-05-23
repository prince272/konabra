# Konabra – Move Toward Safer Roads 🚀

## 🌍 What is Konabra?

Konabra is a smart, community-powered transport and road safety platform designed for Ghana and similar regions. The name is derived from the Twi phrase **“ko na bra”**, meaning *“go and come”* — a culturally rich expression symbolizing movement, action, and return.

Konabra reflects the everyday journeys of Ghanaians and serves as a call to actively participate in making our roads safer and more efficient.

## 📱 What Does the Konabra App Do?

Konabra is a mobile and web platform that empowers drivers, passengers, and pedestrians to:

- **📍 Report live road incidents** — accidents, police barriers, traffic jams, potholes, broken streetlights, and more  
- **🗺️ View current road conditions** through an intuitive map interface  
- **🛠️ Get real-time alerts** about incidents and congestion on their routes  
- **📊 Help authorities analyze** trends, hotspots, and response effectiveness through smart dashboards  

## 💡 Vision

To revolutionize road safety and traffic management in Ghana by connecting people, data, and authorities — one report at a time.

## 🛠️ Project Structure

- **cmd/api/**: Main Go backend API (`main.go`)  
- **apps/next/**: Next.js frontend for the web platform  
- **apps/nuxt/**: Nuxt.js frontend (optional, for alternative frontend implementations)  
- **internal/**: Shared Go packages (e.g., `builds`, `constants`, `handlers`, `helpers`, `models`, `probes`, `repos`, `services`)  
- **logs/**: Log files for the application  
- **pkg/**: External Go packages  
- **scripts/**: Utility scripts for development and deployment  
- **utils/**: Miscellaneous utilities  

## 🚀 Getting Started

### Prerequisites

- **Go**: Version 1.18 or later  
- **Node.js**: Version 18.x or later  
- **PostgreSQL**: For the database (inferred from `pkg` folder, adjust if using a different DB)  
- **Git**: To clone the repository  

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/prince272/konabra.git
   cd konabra
   ```

2. **Set up environment variables**:
   - Copy the `.env.example` file from the `utils` folder to create a `.env` file:
     ```bash
     cp utils/.env.example .env
     ```
   - Edit `.env` to configure your database credentials, API keys, and other settings.

3. **Install backend dependencies**:
   ```bash
   go mod tidy
   ```

4. **Install frontend dependencies (Next.js)**:
   ```bash
   cd apps/next
   npm install
   ```

5. **Run the backend**:
   ```bash
   go run cmd/api/main.go
   ```
   The API will typically run on `http://localhost:8080` (check your `.env` or code for the exact port).

6. **Run the frontend**:
   ```bash
   cd apps/next
   npm run dev
   ```
   The Next.js app will run on `http://localhost:3000` by default.

7. **Access the app**:
   Open your browser and navigate to `http://localhost:3000` to explore Konabra.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Konabra is an open-source project, and we welcome contributions from the community! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to your fork and create a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

For more details, please open an issue to discuss your ideas or suggestions.

## 🌟 Community

Join the Konabra community to stay updated and collaborate:

- **GitHub Issues**: Report bugs or suggest features [here](https://github.com/prince272/konabra/issues).  
- **Discussions**: Share ideas and feedback in the [Discussions](https://github.com/prince272/konabra/discussions) section.

Let’s work together to make roads safer for everyone! 🚗