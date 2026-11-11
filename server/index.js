require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

const PUBLIC_PROJECT_COLUMNS = [
  'id',
  'title',
  'tagline',
  'description',
  'student_name',
  'cohort',
  'category',
  'tech_stack',
  'github_url',
  'live_url',
  'status',
  'likes',
  'created_at',
].join(', ');

const ALLOWED_CATEGORIES = [
  'Web App',
  'E-commerce',
  'Education',
  'Health',
  'Social',
  'Productivity',
  'Other',
];

const ALLOWED_STATUSES = ['idea', 'building', 'live'];
const GITHUB_REPO_PATTERN = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\/)?$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      const normalized = origin.replace(/\/+$/, '');
      return callback(null, allowedOrigins.includes(normalized));
    },
  })
);
app.use(express.json({ limit: '10kb' }));

/**
 * Parses a positive 32-bit integer route parameter, returning null if invalid.
 */
function parsePositiveIntId(rawId) {
  if (typeof rawId !== 'string' || !/^\d+$/.test(rawId)) {
    return null;
  }
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
    return null;
  }
  return id;
}

/**
 * Checks whether a string is a valid HTTPS URL with a hostname.
 */
function isValidHttpsUrl(value) {
  if (!value.startsWith('https://')) {
    return false;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

/**
 * Validates and trims a required string field within inclusive length bounds.
 */
function validateRequiredString(raw, { label, min, max }) {
  if (raw === undefined || raw === null) {
    return { error: `${label} is required` };
  }
  if (typeof raw !== 'string') {
    return { error: `${label} must be a string` };
  }
  const value = raw.trim();
  if (!value) {
    return { error: `${label} is required` };
  }
  if (min !== undefined && value.length < min) {
    return { error: `${label} must be between ${min} and ${max} characters` };
  }
  if (max !== undefined && value.length > max) {
    return {
      error: min !== undefined
        ? `${label} must be between ${min} and ${max} characters`
        : `${label} must not exceed ${max} characters`,
    };
  }
  return { value };
}

/**
 * Validates and sanitizes a POST /projects payload per docs/API_CONTRACT.md.
 */
function validateProjectSubmission(rawBody) {
  const body =
    rawBody && typeof rawBody === 'object' && !Array.isArray(rawBody) ? rawBody : {};
  const fields = {};
  const clean = {};

  const titleCheck = validateRequiredString(body.title, { label: 'Title', min: 3, max: 60 });
  if (titleCheck.error) fields.title = titleCheck.error;
  else clean.title = titleCheck.value;

  const taglineCheck = validateRequiredString(body.tagline, { label: 'Tagline', min: 5, max: 100 });
  if (taglineCheck.error) fields.tagline = taglineCheck.error;
  else clean.tagline = taglineCheck.value;

  const descCheck = validateRequiredString(body.description, { label: 'Description', max: 600 });
  if (descCheck.error) fields.description = descCheck.error;
  else clean.description = descCheck.value;

  const nameCheck = validateRequiredString(body.student_name, { label: 'Student name', min: 2, max: 60 });
  if (nameCheck.error) fields.student_name = nameCheck.error;
  else clean.student_name = nameCheck.value;

  // Optional student_email (never returned in public responses)
  if (body.student_email === undefined || body.student_email === null) {
    clean.student_email = null;
  } else if (typeof body.student_email !== 'string') {
    fields.student_email = 'Email must be a string';
  } else {
    const email = body.student_email.trim();
    if (email && (email.length > 254 || !EMAIL_PATTERN.test(email))) {
      fields.student_email = 'Please enter a valid email address';
    } else {
      clean.student_email = email || null;
    }
  }

  // Optional cohort
  if (body.cohort === undefined || body.cohort === null) {
    clean.cohort = null;
  } else if (typeof body.cohort !== 'string') {
    fields.cohort = 'Cohort must be a string';
  } else {
    clean.cohort = body.cohort.trim() || null;
  }

  // Whitelisted category
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  if (!ALLOWED_CATEGORIES.includes(category)) {
    fields.category = 'Please select a valid category';
  } else {
    clean.category = category;
  }

  // Whitelisted status
  const status = typeof body.status === 'string' ? body.status.trim() : '';
  if (!ALLOWED_STATUSES.includes(status)) {
    fields.status = 'Please select a valid status (idea, building, or live)';
  } else {
    clean.status = status;
  }

  // GitHub repository URL
  const githubUrl = typeof body.github_url === 'string' ? body.github_url.trim() : '';
  if (!githubUrl) {
    fields.github_url = 'GitHub repository URL is required';
  } else if (!GITHUB_REPO_PATTERN.test(githubUrl)) {
    fields.github_url = 'Must be a valid GitHub repository URL (https://github.com/user/repo)';
  } else {
    clean.github_url = githubUrl;
  }

  // Live URL: mandatory when status is live, optional otherwise, always https:// when provided
  if (body.live_url !== undefined && body.live_url !== null && typeof body.live_url !== 'string') {
    fields.live_url = 'Live URL must be a string';
  } else {
    const liveUrl = typeof body.live_url === 'string' ? body.live_url.trim() : '';
    if (clean.status === 'live') {
      if (!liveUrl) {
        fields.live_url = 'Live URL is required when status is Live';
      } else if (!isValidHttpsUrl(liveUrl)) {
        fields.live_url = 'Live URL must start with https://';
      } else {
        clean.live_url = liveUrl;
      }
    } else if (liveUrl && !isValidHttpsUrl(liveUrl)) {
      fields.live_url = 'Live URL must start with https://';
    } else {
      clean.live_url = liveUrl || null;
    }
  }

  // Tech stack: array of 1..8 non-empty strings, each max 24 chars
  if (!Array.isArray(body.tech_stack) || body.tech_stack.length === 0) {
    fields.tech_stack = 'Add at least one technology tag';
  } else if (body.tech_stack.length > 8) {
    fields.tech_stack = 'Maximum 8 technology tags allowed';
  } else {
    const trimmedTags = [];
    for (const tag of body.tech_stack) {
      if (typeof tag !== 'string' || tag.trim().length === 0) {
        fields.tech_stack = 'Tags cannot be empty';
        break;
      }
      const trimmedTag = tag.trim();
      if (trimmedTag.length > 24) {
        fields.tech_stack = 'Each technology tag must be 24 characters or less';
        break;
      }
      trimmedTags.push(trimmedTag);
    }
    if (!fields.tech_stack) {
      clean.tech_stack = trimmedTags;
    }
  }

  return { fields, clean };
}

// Health check to verify the API server is running
app.get('/', (req, res) => {
  try {
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('GET / error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Return aggregate counts for total projects, live projects, and unique student builders
app.get('/stats', async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'live')::int AS live,
        COUNT(DISTINCT LOWER(TRIM(student_name)))::int AS builders
      FROM projects
    `;
    const { rows } = await pool.query(query);
    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('GET /stats error:', err);
    return res.status(500).json({ error: 'Failed to load platform stats' });
  }
});

// List public projects with optional search, category, status filters, sorting, and LIMIT 100
app.get('/projects', async (req, res) => {
  try {
    const conditions = [];
    const params = [];

    const rawSearch = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (rawSearch) {
      const escapedSearch = rawSearch.replace(/[!%_]/g, '!$&');
      params.push(`%${escapedSearch}%`);
      const idx = params.length;
      conditions.push(
        `(title ILIKE $${idx} ESCAPE '!' OR tagline ILIKE $${idx} ESCAPE '!' OR student_name ILIKE $${idx} ESCAPE '!' OR EXISTS (SELECT 1 FROM unnest(tech_stack) AS tech WHERE tech ILIKE $${idx} ESCAPE '!'))`
      );
    }

    const rawCategory = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    if (rawCategory && rawCategory.toLowerCase() !== 'all') {
      params.push(rawCategory);
      conditions.push(`LOWER(category) = LOWER($${params.length})`);
    }

    const rawStatus = typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : '';
    if (rawStatus && rawStatus !== 'all') {
      params.push(rawStatus);
      conditions.push(`status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderBy =
      req.query.sort === 'popular' ? 'likes DESC, created_at DESC' : 'created_at DESC';

    const query = `
      SELECT ${PUBLIC_PROJECT_COLUMNS}
      FROM projects
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT 100
    `;
    const { rows } = await pool.query(query, params);
    return res.status(200).json(rows);
  } catch (err) {
    console.error('GET /projects error:', err);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Retrieve a single public project by its integer ID
app.get('/projects/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const query = `
      SELECT ${PUBLIC_PROJECT_COLUMNS}
      FROM projects
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('GET /projects/:id error:', err);
    return res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Validate and insert a new student project submission, returning the public fields
app.post('/projects', async (req, res) => {
  try {
    const { fields, clean } = validateProjectSubmission(req.body);
    if (Object.keys(fields).length > 0) {
      return res.status(400).json({ error: 'Validation failed', fields });
    }

    const query = `
      INSERT INTO projects (
        title,
        tagline,
        description,
        student_name,
        student_email,
        cohort,
        category,
        tech_stack,
        github_url,
        live_url,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING ${PUBLIC_PROJECT_COLUMNS}
    `;
    const values = [
      clean.title,
      clean.tagline,
      clean.description,
      clean.student_name,
      clean.student_email,
      clean.cohort,
      clean.category,
      clean.tech_stack,
      clean.github_url,
      clean.live_url,
      clean.status,
    ];

    const { rows } = await pool.query(query, values);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /projects error:', err);
    return res.status(500).json({ error: 'Failed to create project' });
  }
});

// Increment the like counter for an existing project by 1 and return the updated project
app.patch('/projects/:id/like', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const query = `
      UPDATE projects
      SET likes = likes + 1
      WHERE id = $1
      RETURNING ${PUBLIC_PROJECT_COLUMNS}
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('PATCH /projects/:id/like error:', err);
    return res.status(500).json({ error: 'Failed to like project' });
  }
});

// Handle malformed JSON or oversized request payloads cleanly
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(400).json({ error: 'Request payload exceeds 10kb limit' });
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  console.error('Unhandled request error:', err);
  return res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`LaunchBoard API listening on port ${PORT}`);
});

