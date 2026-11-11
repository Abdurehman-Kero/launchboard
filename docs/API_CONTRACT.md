# LaunchBoard API Contract

Specification for the LaunchBoard REST API. All requests and responses communicate via JSON over HTTPS.

**Base URL**: `VITE_API_URL` (in development/demo when unset, requests are served by the in-memory client layer).

---

## 1. Data Models

### Project Object
The public representation of a student submission. Note: `student_email` is private and **never** returned in any response.

```json
{
  "id": "proj-01",
  "title": "Habesha Recipes",
  "tagline": "Authentic Ethiopian culinary archive with ingredient substitutions",
  "description": "A community-curated cookbook preserving traditional Ethiopian dishes, spice blends, and cooking techniques with step-by-step guidance and local ingredient alternatives.",
  "student_name": "Abebe Bekele",
  "cohort": "Cohort 2026",
  "category": "Web App",
  "tech_stack": ["React", "Node.js", "PostgreSQL", "Tailwind CSS"],
  "github_url": "https://github.com/example/habesha-recipes",
  "live_url": "https://habesharecipes.example.com",
  "status": "live",
  "likes": 42,
  "created_at": "2026-03-15T09:30:00.000Z"
}
```

### Stats Object
Aggregate counters for platform impact metrics.

```json
{
  "total": 8,
  "live": 5,
  "builders": 8
}
```

---

## 2. Endpoints Summary

| Method | Endpoint | Description | Request Body | Success Response | Error Responses |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/stats` | Platform counters | None | `200 OK` → `Stats` | `500 Internal Error` |
| `GET` | `/projects` | Filtered project directory | None (Query params) | `200 OK` → `Project[]` | `500 Internal Error` |
| `GET` | `/projects/:id` | Single project details | None | `200 OK` → `Project` | `404 Not Found` |
| `POST` | `/projects` | Submit new student project | `ProjectSubmission` | `201 Created` → `Project` | `400 Bad Request` |
| `PATCH` | `/projects/:id/like` | Upvote a project | None | `200 OK` → `Project` | `404 Not Found` |

---

## 3. Detailed Endpoint Specs

### `GET /stats`
Retrieves total projects submitted, projects currently deployed live, and unique student builders.

- **Response `200 OK`**:
```json
{
  "total": 12,
  "live": 8,
  "builders": 11
}
```

---

### `GET /projects`
Returns a list of project cards matching filter criteria.

- **Query Parameters**:
  - `search` *(string, optional)*: Free-text search matching case-insensitively across `title`, `tagline`, `student_name`, and `tech_stack`.
  - `category` *(string, optional)*: One of `All`, `Web App`, `E-commerce`, `Education`, `Health`, `Social`, `Productivity`, `Other`.
  - `status` *(string, optional)*: One of `all`, `live`, `building`, `idea`.
  - `sort` *(string, optional)*: `newest` (default, sort by `created_at` descending) or `popular` (sort by `likes` descending).

- **Response `200 OK`**:
```json
[
  {
    "id": "proj-01",
    "title": "Habesha Recipes",
    "tagline": "Authentic Ethiopian culinary archive with ingredient substitutions",
    "description": "A community-curated cookbook preserving traditional Ethiopian dishes, spice blends, and cooking techniques.",
    "student_name": "Abebe Bekele",
    "cohort": "Cohort 2026",
    "category": "Web App",
    "tech_stack": ["React", "Node.js", "PostgreSQL"],
    "github_url": "https://github.com/example/habesha-recipes",
    "live_url": "https://habesharecipes.example.com",
    "status": "live",
    "likes": 42,
    "created_at": "2026-03-15T09:30:00.000Z"
  }
]
```

---

### `GET /projects/:id`
Retrieves a single project by unique identifier.

- **URL Parameters**:
  - `id` *(string, required)*: The project ID.
- **Response `200 OK`**: `Project` object.
- **Response `404 Not Found`**:
```json
{
  "error": "Project not found"
}
```

---

### `POST /projects`
Creates and publishes a new student project submission.

- **Request Body**:
```json
{
  "title": "Shega Pay",
  "tagline": "Micro-merchant QR payments and digital receipt ledger",
  "description": "Fast peer-to-merchant payment utility designed for local kiosk vendors with low-bandwidth offline queuing and SMS receipts.",
  "student_name": "Bethlehem Tadesse",
  "student_email": "bethlehem@example.com",
  "cohort": "Batch 04",
  "category": "E-commerce",
  "tech_stack": ["Next.js", "TypeScript", "Tailwind CSS", "Express"],
  "github_url": "https://github.com/bethlehem/shegapay",
  "live_url": "https://shegapay.example.com",
  "status": "live"
}
```

- **Validation Rules**:
  - `title`: String, 3 to 60 characters (required).
  - `tagline`: String, 5 to 100 characters (required).
  - `description`: String, maximum 600 characters (required).
  - `student_name`: String, 2 to 60 characters (required).
  - `student_email`: String, optional. Valid email format. Never exposed publicly.
  - `cohort`: String, optional (e.g. "Batch 04", "Cohort 2026").
  - `category`: Must be one of `Web App`, `E-commerce`, `Education`, `Health`, `Social`, `Productivity`, `Other`.
  - `status`: Must be one of `idea`, `building`, `live`.
  - `github_url`: Must be a valid GitHub repo URL matching `https://github.com/user/repo`.
  - `live_url`: Optional for `idea` and `building`. **Mandatory when status is `live`**, and must begin with `https://`.
  - `tech_stack`: Array of strings, maximum 8 tags, each tag max 24 characters.

- **Response `201 Created`**: Returns created `Project` object (without `student_email`).
- **Response `400 Bad Request`**:
```json
{
  "error": "Validation failed",
  "fields": {
    "title": "Title must be between 3 and 60 characters",
    "github_url": "Must be a valid GitHub repository URL (https://github.com/user/repo)",
    "live_url": "Live URL is required when status is Live"
  }
}
```

---

### `PATCH /projects/:id/like`
Increments the like counter of a project by 1.

- **Headers**: None required.
- **Request Body**: None.
- **Response `200 OK`**: Updated `Project` object with new `likes` count.
```json
{
  "id": "proj-01",
  "likes": 43
}
```
- **Response `404 Not Found`**:
```json
{
  "error": "Project not found"
}
```
