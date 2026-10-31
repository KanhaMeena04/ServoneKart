# ServoneKart (Multi-Platform Food & Grocery Delivery Ecosystem)

ServoneKart is a comprehensive, end-to-end food delivery and quick-commerce platform consisting of five integrated subsystems:

---

## 📁 Repository Structure

| Folder | Subsystem | Technology Stack | Description |
|---|---|---|---|
| [`ECDadmin`](./ECDadmin) | **Admin Dashboard** | React.js, TailwindCSS, Material-UI, Chart.js | Central administration portal for managing restaurants, riders, orders, categories, banners, payouts, and system settings. |
| [`ECDbackend`](./ECDbackend) | **Core Backend API** | Node.js, Express, MongoDB (Mongoose), Socket.io | High-performance RESTful & WebSocket API server powering order processing, live rider tracking, auth, and payments. |
| [`Restaurant`](./Restaurant) | **Restaurant Partner App** | Flutter / Dart | Mobile application for restaurant owners/managers to manage live orders, menu items, kitchen prep status, and earnings. |
| [`Rider`](./Rider) | **Delivery Partner App** | Flutter / Dart | Mobile application for delivery riders with real-time GPS tracking, order assignments, route navigation, and wallet. |
| [`User`](./User) | **Customer Ordering App** | Flutter / Dart | Full-featured food delivery consumer mobile app featuring location search, cart, checkout, live order tracking, and coupons. |

---

## 🚀 Getting Started

### 1. ECDbackend Setup (API Server)
```bash
cd ECDbackend
# Copy sample environment configuration
cp .env.example .env
# Install dependencies
npm install
# Start local development server
npm run dev
```
By default, the backend will listen on `http://localhost:5000` and connect to your local MongoDB instance (`mongodb://localhost:27017/servonekart`).

### 2. ECDadmin Setup (Admin Portal)
```bash
cd ECDadmin
# Copy sample environment configuration
cp .env.example .env
# Install dependencies
npm install
# Start web app
npm start
```
The admin dashboard runs by default on `http://localhost:3000` and communicates with the backend at `http://localhost:5000/api/v1`.

### 3. Flutter Apps Setup (Restaurant, Rider, User)
For each Flutter app:
```bash
cd Restaurant   # or cd Rider or cd User
flutter pub get
# Run in debug mode (connecting to local dev server)
flutter run
```
> **Custom Backend URL / Mobile Emulator Tip:**
> - Android Emulator connects to host backend via `http://10.0.2.2:5000/api/v1` automatically.
> - To target a specific network or cloud URL, pass the `--dart-define` flag:
>   ```bash
>   flutter run --dart-define=BACKEND_URL=https://your-api-domain.com/api/v1
>   ```
