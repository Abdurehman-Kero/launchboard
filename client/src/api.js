/**
 * LaunchBoard API Layer
 * The single source of truth for all data interactions.
 * Automatically switches between Remote REST API and In-Memory Demo Mode.
 */

const BASE = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
export const DEMO_MODE = !BASE;

export class ApiError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.name = 'ApiError';
    this.fields = fields;
  }
}

// 8 realistic seed projects created by Ethiopian bootcamp students
const INITIAL_PROJECTS = [
  {
    id: 'proj-01',
    title: 'Habesha Recipes',
    tagline: 'Authentic Ethiopian culinary archive with ingredient substitutions',
    description: 'A community-curated cookbook preserving traditional Ethiopian dishes, spice blends, and cooking techniques with step-by-step guidance and local ingredient alternatives.',
    student_name: 'Abebe Bekele',
    cohort: 'Batch 04',
    category: 'Web App',
    tech_stack: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    github_url: 'https://github.com/example/habesha-recipes',
    live_url: 'https://habesharecipes.example.com',
    status: 'live',
    likes: 54,
    created_at: '2026-03-12T10:15:00.000Z'
  },
  {
    id: 'proj-02',
    title: 'Shega Market',
    tagline: 'Micro-merchant digital storefront and QR payment ledger',
    description: 'Empowers local Addis Ababa kiosk vendors to catalog goods, accept telebirr and CBE payments via QR, and track daily inventory without bookkeeping headaches.',
    student_name: 'Bethlehem Tadesse',
    cohort: 'Cohort 2026',
    category: 'E-commerce',
    tech_stack: ['Next.js', 'TypeScript', 'Prisma', 'Tailwind CSS'],
    github_url: 'https://github.com/example/shega-market',
    live_url: 'https://shegamarket.app',
    status: 'live',
    likes: 42,
    created_at: '2026-03-14T08:30:00.000Z'
  },
  {
    id: 'proj-03',
    title: 'Ge’ez Reader',
    tagline: 'Interactive Fidel typography and pronunciation tutor for kids',
    description: 'Gamified interactive web application teaching children the Ge’ez script (Fidel), syllable sounds, and cultural folktales through audio prompts and matching puzzles.',
    student_name: 'Dawit Haile',
    cohort: 'Batch 04',
    category: 'Education',
    tech_stack: ['React', 'Web Audio API', 'Canvas', 'CSS Modules'],
    github_url: 'https://github.com/example/geez-reader',
    live_url: 'https://geezreader.vercel.app',
    status: 'live',
    likes: 38,
    created_at: '2026-03-10T14:20:00.000Z'
  },
  {
    id: 'proj-04',
    title: 'TenaSync',
    tagline: 'Lightweight offline-first clinic patient triage log',
    description: 'Designed for rural health posts with intermittent electricity. Caches patient check-ins locally in IndexedDB and synchronizes securely with regional servers when connected.',
    student_name: 'Selamawit Assefa',
    cohort: 'Cohort 2026',
    category: 'Health',
    tech_stack: ['PWA', 'IndexedDB', 'Express', 'SQLite'],
    github_url: 'https://github.com/example/tena-sync',
    live_url: 'https://tenasync.org',
    status: 'building',
    likes: 29,
    created_at: '2026-03-08T11:45:00.000Z'
  },
  {
    id: 'proj-05',
    title: 'Buna Tracker',
    tagline: 'Coffee origin traceability and cupping scoring platform',
    description: 'Connects specialty coffee washing stations in Sidama and Yirgacheffe directly with boutique roasters worldwide, logging bean moisture, elevation, and cupping notes.',
    student_name: 'Yared Girma',
    cohort: 'Batch 03',
    category: 'Productivity',
    tech_stack: ['Vue', 'FastAPI', 'PostgreSQL', 'Chart.js'],
    github_url: 'https://github.com/example/buna-tracker',
    live_url: null,
    status: 'building',
    likes: 21,
    created_at: '2026-03-05T09:00:00.000Z'
  },
  {
    id: 'proj-06',
    title: 'Finot Study Network',
    tagline: 'Peer study circles and past exam repository for prep schools',
    description: 'A collaborative study hub where high school students preparing for the Ethiopian University Entrance Examination share past papers, solutions, and peer notes.',
    student_name: 'Meron Yohannes',
    cohort: 'Cohort 2026',
    category: 'Social',
    tech_stack: ['React', 'Firebase Auth', 'Node.js', 'MongoDB'],
    github_url: 'https://github.com/example/finot-study',
    live_url: 'https://finotstudy.example.com',
    status: 'live',
    likes: 19,
    created_at: '2026-03-02T16:10:00.000Z'
  },
  {
    id: 'proj-07',
    title: 'Addis Transit Bot',
    tagline: 'Crowdsourced minibus queue time and route navigator',
    description: 'Real-time navigation concept for Addis Ababa city bus and shared minibus lines. Commuters report wait times and line delays at major terminals like Mexico and Megenagna.',
    student_name: 'Henok Tesfaye',
    cohort: 'Batch 04',
    category: 'Other',
    tech_stack: ['Python', 'FastAPI', 'React', 'Leaflet'],
    github_url: 'https://github.com/example/addis-ride-share',
    live_url: null,
    status: 'idea',
    likes: 14,
    created_at: '2026-02-28T12:00:00.000Z'
  },
  {
    id: 'proj-08',
    title: 'Fidel OCR Studio',
    tagline: 'Browser-based optical character recognition for scanned Amharic text',
    description: 'Utilizes lightweight WASM machine learning models to digitize historical Amharic documents and government Gazettes right inside modern browsers without cloud uploads.',
    student_name: 'Tigist Alemu',
    cohort: 'Batch 03',
    category: 'Productivity',
    tech_stack: ['WebAssembly', 'React', 'TensorFlow.js', 'Vite'],
    github_url: 'https://github.com/example/amharic-ocr',
    live_url: null,
    status: 'idea',
    likes: 12,
    created_at: '2026-02-25T15:30:00.000Z'
  }
];

// In-memory store for demo mode
let memoryProjects = [...INITIAL_PROJECTS];

/**
 * Validates project input data according to the API contract.
 * @returns {Record<string, string>} map of field error messages
 */
export function validateProjectData(data) {
  const fields = {};

  // Title 3-60 chars
  const title = (data.title || '').trim();
  if (!title) {
    fields.title = 'Project title is required';
  } else if (title.length < 3 || title.length > 60) {
    fields.title = 'Title must be between 3 and 60 characters';
  }

  // Tagline 5-100 chars
  const tagline = (data.tagline || '').trim();
  if (!tagline) {
    fields.tagline = 'Tagline is required';
  } else if (tagline.length < 5 || tagline.length > 100) {
    fields.tagline = 'Tagline must be between 5 and 100 characters';
  }

  // Description max 600 chars
  const description = (data.description || '').trim();
  if (!description) {
    fields.description = 'Description is required';
  } else if (description.length > 600) {
    fields.description = 'Description must not exceed 600 characters';
  }

  // Student name 2-60 chars
  const studentName = (data.student_name || '').trim();
  if (!studentName) {
    fields.student_name = 'Your name is required';
  } else if (studentName.length < 2 || studentName.length > 60) {
    fields.student_name = 'Name must be between 2 and 60 characters';
  }

  // Category
  const allowedCategories = ['Web App', 'E-commerce', 'Education', 'Health', 'Social', 'Productivity', 'Other'];
  if (!data.category || !allowedCategories.includes(data.category)) {
    fields.category = 'Please select a valid category';
  }

  // Status
  const allowedStatuses = ['idea', 'building', 'live'];
  if (!data.status || !allowedStatuses.includes(data.status)) {
    fields.status = 'Please select a valid status (Idea, Building, or Live)';
  }

  // GitHub URL
  const githubUrl = (data.github_url || '').trim();
  const githubPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\/)?$/;
  if (!githubUrl) {
    fields.github_url = 'GitHub repository URL is required';
  } else if (!githubPattern.test(githubUrl)) {
    fields.github_url = 'Must be a valid GitHub repo (e.g. https://github.com/user/repo)';
  }

  // Live URL
  const liveUrl = (data.live_url || '').trim();
  if (data.status === 'live') {
    if (!liveUrl) {
      fields.live_url = 'Live URL is required when status is Live';
    } else if (!liveUrl.startsWith('https://')) {
      fields.live_url = 'Live URL must start with https://';
    }
  } else if (liveUrl && !liveUrl.startsWith('https://')) {
    fields.live_url = 'Live URL must start with https://';
  }

  // Tech stack max 8 tags of max 24 chars
  const techStack = Array.isArray(data.tech_stack) ? data.tech_stack : [];
  if (techStack.length === 0) {
    fields.tech_stack = 'Add at least one technology tag';
  } else if (techStack.length > 8) {
    fields.tech_stack = 'Maximum 8 technology tags allowed';
  } else {
    for (const tag of techStack) {
      if (typeof tag !== 'string' || tag.trim().length === 0) {
        fields.tech_stack = 'Tags cannot be empty';
        break;
      } else if (tag.trim().length > 24) {
        fields.tech_stack = `Tag "${tag}" exceeds 24 characters`;
        break;
      }
    }
  }

  return fields;
}

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GET /stats -> { total, live, builders }
 */
export async function getStats() {
  if (DEMO_MODE) {
    await delay(350);
    const total = memoryProjects.length;
    const live = memoryProjects.filter((p) => p.status === 'live').length;
    const uniqueBuilders = new Set(memoryProjects.map((p) => p.student_name.trim().toLowerCase()));
    return {
      total,
      live,
      builders: uniqueBuilders.size
    };
  }

  const res = await fetch(`${BASE}/stats`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(errorData.error || 'Failed to fetch platform stats', errorData.fields);
  }
  return res.json();
}

/**
 * GET /projects?search=&category=&status=&sort=newest|popular -> Project[]
 */
export async function listProjects(params = {}) {
  const { search = '', category = 'All', status = 'all', sort = 'newest' } = params;

  if (DEMO_MODE) {
    await delay(400);
    let results = [...memoryProjects];

    // Status filter
    if (status && status !== 'all') {
      results = results.filter((p) => p.status.toLowerCase() === status.toLowerCase());
    }

    // Category filter
    if (category && category !== 'All') {
      results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    // Search query: matches title, tagline, student_name, and tech_stack
    const query = search.trim().toLowerCase();
    if (query) {
      results = results.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(query);
        const taglineMatch = p.tagline.toLowerCase().includes(query);
        const studentMatch = p.student_name.toLowerCase().includes(query);
        const techMatch = Array.isArray(p.tech_stack) && p.tech_stack.some((tech) => tech.toLowerCase().includes(query));
        return titleMatch || taglineMatch || studentMatch || techMatch;
      });
    }

    // Sort: newest vs popular
    if (sort === 'popular') {
      results.sort((a, b) => b.likes - a.likes || new Date(b.created_at) - new Date(a.created_at));
    } else {
      results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return results;
  }

  const queryParams = new URLSearchParams();
  if (search) queryParams.set('search', search);
  if (category && category !== 'All') queryParams.set('category', category);
  if (status && status !== 'all') queryParams.set('status', status);
  if (sort) queryParams.set('sort', sort);

  const url = `${BASE}/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(errorData.error || 'Failed to list projects', errorData.fields);
  }
  return res.json();
}

/**
 * GET /projects/:id -> Project
 */
export async function getProject(id) {
  if (DEMO_MODE) {
    await delay(300);
    const proj = memoryProjects.find((p) => p.id === id);
    if (!proj) {
      throw new ApiError('Project not found');
    }
    return { ...proj };
  }

  const res = await fetch(`${BASE}/projects/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(errorData.error || 'Project not found', errorData.fields);
  }
  return res.json();
}

/**
 * POST /projects -> 201 Project
 */
export async function createProject(data) {
  const fields = validateProjectData(data);
  if (Object.keys(fields).length > 0) {
    throw new ApiError('Validation failed', fields);
  }

  if (DEMO_MODE) {
    await delay(500);
    const newProject = {
      id: `proj-${Date.now()}`,
      title: data.title.trim(),
      tagline: data.tagline.trim(),
      description: data.description.trim(),
      student_name: data.student_name.trim(),
      cohort: (data.cohort || '').trim() || 'Bootcamp Graduate',
      category: data.category,
      tech_stack: data.tech_stack.map((t) => t.trim()).filter(Boolean),
      github_url: data.github_url.trim(),
      live_url: data.live_url ? data.live_url.trim() : null,
      status: data.status,
      likes: 0,
      created_at: new Date().toISOString()
    };

    // Prepend to memory store
    memoryProjects = [newProject, ...memoryProjects];
    return { ...newProject };
  }

  // Real mode
  const payload = {
    title: data.title.trim(),
    tagline: data.tagline.trim(),
    description: data.description.trim(),
    student_name: data.student_name.trim(),
    student_email: data.student_email ? data.student_email.trim() : undefined,
    cohort: data.cohort ? data.cohort.trim() : undefined,
    category: data.category,
    tech_stack: data.tech_stack,
    github_url: data.github_url.trim(),
    live_url: data.live_url ? data.live_url.trim() : null,
    status: data.status
  };

  const res = await fetch(`${BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(errorData.error || 'Failed to submit project', errorData.fields || {});
  }
  return res.json();
}

/**
 * PATCH /projects/:id/like -> Project
 */
export async function likeProject(id) {
  if (DEMO_MODE) {
    await delay(250);
    const index = memoryProjects.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new ApiError('Project not found');
    }
    const updated = {
      ...memoryProjects[index],
      likes: memoryProjects[index].likes + 1
    };
    memoryProjects[index] = updated;
    return { ...updated };
  }

  const res = await fetch(`${BASE}/projects/${id}/like`, {
    method: 'PATCH'
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(errorData.error || 'Failed to like project', errorData.fields);
  }
  return res.json();
}
