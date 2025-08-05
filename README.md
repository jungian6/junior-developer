<div align="center">
  <img src="frontend/public/logo.png" alt="Citizens Advice Logo" width="100" height="100" />
    <h1>Citizens Advice SORT</h1>
    <h3>Junior Developer Practical</h3>
</div>

---


## Implementation Notes

I implemented SSR by fetching data directly in the async page component. Server Components need absolute URLs, so I'm fetching straight from the FastAPI backend at `http://localhost:8000/data` - this is the recommended Next.js pattern for external APIs as it avoids unnecessary round trips. I didn't implement any access control or authentication for the external API since this wasn't asked for in the requirements. I used the default ports: `127.0.0.1:8000` for FastAPI and `localhost:3000` for Next.js.

The frontend uses shadcn/ui for component styling, Framer Motion for animations, Lucide React for icons, and Sonner for toast notifications.

### Accessibility Features

I've added the Web Speech API to provide text-to-speech functionality for content cards. Users can click the "Read Aloud" button in each card header to have the content read aloud, with pause/resume and stop controls. This accessibility feature works entirely in the browser without any external dependencies.

### Favicon Implementation

For retrieving favicons, I used Google's favicon service rather than fetching them directly from each site's `/favicon.ico` as some sites didnt have a favicon:

```python
def get_favicon_url(source_url: str) -> str:
    parsed_url = urlparse(source_url)
    domain = f"{parsed_url.scheme}://{parsed_url.netloc}"
    return f"https://www.google.com/s2/favicons?domain={domain}&sz=64"
```
---

### Error Handling for Unmatched Citations

During testing, I noticed that one citation reference `<ref>dOQ-BJgBLViOYD1OzWM</ref>` in the debt category doesn't match its corresponding source ID `dOQ-BJgBBLViOYD1OzWM` (missing a 'B' character). Rather than modifying the test data (which could have been intentionally included to test error handling), I added logic in the main `parse_content_with_sources()` method that replaces any unmatched citation references with a 'Source not found' message the frontend then handles the ui. I figured it's better to show users when a source is missing rather than just hiding the problem - this way it's clear something's wrong and makes it easier to spot and fix data issues.

## Overview

This is a full stack practical for Junior Developer at Citizens Advice SORT. The project consists of a full-stack application with a Python backend and Next.js frontend.

## Project Structure

```
junior-developer/
├── backend/
│   ├── data/
│   │   └── mock.json         # Mock data containing content and sources
│   ├── main.py               # FastAPI backend server
│   └── models.py             # Data models and schemas
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx      # Main page component
│   │   │   └── layout.tsx    # App layout
│   │   └── components/
│   │       └── Content.tsx   # Content display component
│   └── public/
│       └── logo.png          # Citizens Advice logo
└── Makefile                  # Build and run commands
```

## Task Description

### Backend Task
In the backend, you need to:
1. **Identify cited sources** within the content from `mock.json`
2. **Replace document IDs** with actual links to the sources
3. **Extract favicon URLs** from the source websites

### Frontend Task
The `Content.tsx` component has been provided for you to:
1. **Display each piece of content** and its associated sources, both cited and non-cited
2. **Show favicons** from the source websites alongside each source
3. **Create a clean, user-friendly interface**

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm
- [poetry](https://python-poetry.org/docs/#installation)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd junior-developer
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   poetry install --no-root
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

Use the provided Makefile for easy setup:

```bash
# Install all dependencies
make install

# Start the backend server
make run-backend

# Start the frontend development server
make run-frontend
```

Or run manually:

**Backend:**
```bash
cd backend
poetry run fastapi dev main.py
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## API Endpoints

- `GET /data` - Returns the list of data
