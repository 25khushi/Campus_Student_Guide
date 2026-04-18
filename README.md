# Student Portal

A separate React project for **Lost & Found** and **Student Help** (college student services).

## Features

- **Lost & Found** – Browse lost and found items, report lost/found with photo, track report by ID
- **Report Lost** – Submit lost item with image and contact
- **Report Found** – Submit found item so owner can claim
- **Track Report** – Track status by report ID (e.g. L1, F2)
- **Student Help** – Ride share, roommate finder, study groups, notes exchange
- **Login / Register** – Same style as main app

## Same level as react-app

This folder lives next to `full stack` and `react-app`:

```
full stack (2)/
  full stack/       ← HTML project
  react-app/        ← Book rental React app
  student-portal/   ← This project (Lost & Found, Student Help)
```

## Run the project

```bash
cd student-portal
npm install
npm start
```

Runs at [http://localhost:3000](http://localhost:3000) (use another port if react-app is already running).

## Images (optional)

Lost & Found cards use `/Img/books/...` paths. To show images, copy the `Img` folder from `full stack/Img` or `react-app/public/Img` into `student-portal/public/Img`.
