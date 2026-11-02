# ServoneKart (Multi-Platform Hyperlocal Super App Ecosystem)

ServoneKart is a comprehensive, production-grade hyperlocal delivery, grocery, and quick-commerce platform consisting of integrated subsystems:

---

## 📁 Repository Structure

| Folder | Subsystem | Technology Stack | Description |
|---|---|---|---|
| [`ServoneAdmin`](./ServoneAdmin) | **Master Admin Control Tower** | React.js, TailwindCSS, Material-UI, Chart.js | Central administration portal for managing vendor partners, delivery partners, orders, category workspaces, payouts, banners, and rules. |
| [`ServoneBackend`](./ServoneBackend) | **Core Backend API** | Node.js, Express, MongoDB (Mongoose), Socket.io | High-performance RESTful & WebSocket API server powering order lifecycle, live delivery tracking, multi-vertical catalog, auth, and payments. |
| [`VendorPartner`](./VendorPartner) | **Vendor Partner App** | Flutter / Dart | Mobile application for store & restaurant owners/managers to manage live orders, catalog items, prep status, and earnings. |
| [`DeliveryPartner`](./DeliveryPartner) | **Delivery Partner App** | Flutter / Dart | Mobile application for delivery partners with real-time GPS tracking, order assignments, route navigation, and COD cash management. |
| [`UserApp`](./UserApp) | **Customer Ordering App** | Flutter / Dart | Full-featured consumer mobile app featuring location search, cart, checkout, live order tracking, multi-service verticals, and coupons. |
| [`TricelynWeb`](./TricelynWeb) | **Customer Web Experience** | React.js, Vite, TailwindCSS | Modern quick-commerce web ordering portal connected to the unified ServoneBackend API. |

---

## 🚀 Getting Started

### 1. ServoneBackend Setup (API Server)
```bash
cd ServoneBackend
# Copy sample environment configuration
cp .env.example .env
# Install dependencies
npm install
# Start local development server
npm run dev
```
By default, the backend will listen on `http://localhost:5000` and connect to your local MongoDB instance (`mongodb://localhost:27017/servonekart`).

### 2. ServoneAdmin Setup (Admin Portal)
```bash
cd ServoneAdmin
# Copy sample environment configuration
cp .env.example .env
# Install dependencies
npm install
# Start web app
npm start
```
The admin dashboard runs by default on `http://localhost:3000` and communicates with the backend at `http://localhost:5000/api/v1`.

### 3. TricelynWeb Setup (Customer Web)
```bash
cd TricelynWeb
npm install
npm run dev
```
Runs at `http://localhost:5173` connecting to the local backend.

### 4. Flutter Apps Setup (VendorPartner, DeliveryPartner, UserApp)
For each Flutter app:
```bash
cd VendorPartner   # or cd DeliveryPartner or cd UserApp
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
