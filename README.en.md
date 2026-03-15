# Infinite Grid Photos

Application built with **Next.js (App Router)** and **React 19** that displays a photo gallery with **infinite scroll** and animations, consuming the public [picsum.photos](https://picsum.photos) API.

---

# Main Stack

- **Next.js (App Router)**
- **React 19**
- **Tailwind CSS v4**
- **TypeScript**
- **Axios**
- **Framer Motion**
- **react-infinite-scroll-component**

Testing:

- **Jest**
- **React Testing Library**
- **Testing Library / User Event**

---

# Technical Decisions

### Architecture (Next.js App Router)

**Next.js with App Router** is used to separate server logic from client interactivity through **Server Components and Server Actions**, reducing the client bundle and improving initial load performance.

### Infinite Scroll

Progressive data loading is implemented with **react-infinite-scroll-component**, which triggers new requests when the user reaches the end of the content.

### Animations

Entrance, exit, and layout transitions are managed with **Framer Motion** (`AnimatePresence` + `motion.div`) to provide a smooth visual experience.

### Network Handling

HTTP calls are made through **Axios** using a centralized instance with interceptors to handle network errors and failed responses consistently.

An **Exponential Backoff with Jitter** strategy is also implemented for retries on rate limit errors (429) or temporary network failures.

### Incremental Load Throttle

`usePhotoGallery` implements an **incremental throttle**: each request introduces a delay that grows progressively with each consecutive fetch up to a configurable maximum. Although picsum.photos does not enforce strict rate limits, this logic acts as a safeguard against temporary network failures and avoids unnecessarily overloading the service.

### Images with Next.js Optimization

Images go through the Next.js optimizer in the `SmartImage` component, leveraging automatic format conversion and viewport-based resizing to improve load times.

### Environment Variables

No `.env` file is used in this project. The picsum.photos API is completely public and requires no authentication, so exposing the base URL directly in the code poses no risk. This also simplifies evaluation: the app can be cloned and run without any prior configuration step.

### Logic Encapsulation

The gallery's state and pagination logic is encapsulated in a custom hook (`usePhotoGallery`), clearly separating business logic from UI components.

### Testing Strategy

**Jest** and **React Testing Library** are used following a **user-centric** approach, testing behavior visible to the user (rendering, element loading, deletion) rather than internal component state.

---

# Project Structure

```
app/
 ├ actions/      # Server Actions (API calls)
 ├ hooks/        # Logic hooks (usePhotoGallery)
 ├ components/   # UI Components
 ├ lib/          # Utilities
 ├ services/     # Axios configuration
 └ constants/    # Global configuration
```

---

# Installation & Running

## Quick Start

```bash
npm run setup
```

Installs dependencies, builds the project and starts the production server.

## Development

```bash
npm install
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

---

# Running Tests

```bash
npm run test
```

---

# AI Tool Usage

During development, **generative AI tools (Claude Code)** were used as support in various tasks:

- Generating **initial boilerplate** for some components.
- Assistance in **implementing the retry logic (Exponential Backoff + Jitter)**.
- Support in **writing tests with Jest and React Testing Library**.
- Occasional help with **refactoring and simplifying repetitive code**, especially in network error handling.

All final decisions on architecture, project organization, and code behavior validation were reviewed and adjusted manually.
