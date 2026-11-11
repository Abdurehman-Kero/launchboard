import { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header.jsx';
import WakeupBanner from './components/WakeupBanner.jsx';
import Hero from './components/Hero.jsx';
import Toolbar from './components/Toolbar.jsx';
import ProjectCard from './components/ProjectCard.jsx';
import ProjectDetailsDrawer from './components/ProjectDetailsDrawer.jsx';
import SubmitProjectDrawer from './components/SubmitProjectDrawer.jsx';
import SkeletonGrid from './components/SkeletonGrid.jsx';
import EmptyState from './components/EmptyState.jsx';
import ErrorState from './components/ErrorState.jsx';
import Toast from './components/Toast.jsx';
import Footer from './components/Footer.jsx';

import {
  getStats,
  listProjects,
  getProject,
  createProject,
  likeProject,
  ApiError
} from './api.js';

import {
  getLikedProjectIds,
  markProjectAsLiked
} from './utils.js';

import './App.css';

// Helper to read query params from URL
function getInitialParams() {
  if (typeof window === 'undefined') {
    return { search: '', category: 'All', status: 'all', sort: 'newest', projectId: null };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get('search') || '',
    category: params.get('category') || 'All',
    status: params.get('status') || 'all',
    sort: params.get('sort') || 'newest',
    projectId: params.get('project') || null
  };
}

export default function App() {
  const initialParams = getInitialParams();

  // Filter & query state
  const [search, setSearch] = useState(initialParams.search);
  const [category, setCategory] = useState(initialParams.category);
  const [status, setStatus] = useState(initialParams.status);
  const [sort, setSort] = useState(initialParams.sort);

  // Data states
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(null);

  // Drawer states
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  // Just-added highlight state
  const [justAddedId, setJustAddedId] = useState(null);

  // User liked IDs in localStorage
  const [likedIds, setLikedIds] = useState(() => getLikedProjectIds());

  // Slow request / server wakeup banner state
  const [isWakingUp, setIsWakingUp] = useState(false);
  const pendingRequestsCount = useRef(0);
  const wakeupTimerRef = useRef(null);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Manage slow server wakeup detection (>4000ms)
  const trackRequestStart = useCallback(() => {
    pendingRequestsCount.current += 1;
    if (pendingRequestsCount.current === 1) {
      wakeupTimerRef.current = setTimeout(() => {
        setIsWakingUp(true);
      }, 4000);
    }
  }, []);

  const trackRequestEnd = useCallback(() => {
    pendingRequestsCount.current = Math.max(0, pendingRequestsCount.current - 1);
    if (pendingRequestsCount.current === 0) {
      if (wakeupTimerRef.current) {
        clearTimeout(wakeupTimerRef.current);
      }
      setIsWakingUp(false);
    }
  }, []);

  // Update browser URL query string
  const updateUrl = useCallback((newParams) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);

    if (newParams.search) url.searchParams.set('search', newParams.search);
    else url.searchParams.delete('search');

    if (newParams.category && newParams.category !== 'All') url.searchParams.set('category', newParams.category);
    else url.searchParams.delete('category');

    if (newParams.status && newParams.status !== 'all') url.searchParams.set('status', newParams.status);
    else url.searchParams.delete('status');

    if (newParams.sort && newParams.sort !== 'newest') url.searchParams.set('sort', newParams.sort);
    else url.searchParams.delete('sort');

    if (newParams.projectId) url.searchParams.set('project', newParams.projectId);
    else url.searchParams.delete('project');

    window.history.replaceState({}, '', url.toString());
  }, []);

  // Fetch platform stats
  const loadStats = useCallback(async () => {
    trackRequestStart();
    setStatsLoading(true);
    try {
      const data = await getStats();
      setStats(data);
    } catch {
      // stats error is non-fatal
    } finally {
      setStatsLoading(false);
      trackRequestEnd();
    }
  }, [trackRequestStart, trackRequestEnd]);

  // Fetch projects list
  const loadProjects = useCallback(async () => {
    trackRequestStart();
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const data = await listProjects({ search, category, status, sort });
      setProjects(data);
    } catch (err) {
      setProjectsError(err.message || 'Failed to load projects');
    } finally {
      setProjectsLoading(false);
      trackRequestEnd();
    }
  }, [search, category, status, sort, trackRequestStart, trackRequestEnd]);

  // Initial mount: load stats and projects
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadProjects();
    updateUrl({ search, category, status, sort, projectId: selectedProject?.id });
  }, [search, category, status, sort, loadProjects, updateUrl, selectedProject]);

  // Deep-link auto-open for ?project=<id>
  useEffect(() => {
    const pId = initialParams.projectId;
    if (pId) {
      getProject(pId)
        .then((proj) => {
          setSelectedProject(proj);
        })
        .catch(() => {
          // If project not found, silently clear query param
          updateUrl({ search, category, status, sort, projectId: null });
        });
    }
  }, []);

  // Listen to popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const current = getInitialParams();
      setSearch(current.search);
      setCategory(current.category);
      setStatus(current.status);
      setSort(current.sort);
      if (current.projectId) {
        getProject(current.projectId)
          .then((p) => setSelectedProject(p))
          .catch(() => setSelectedProject(null));
      } else {
        setSelectedProject(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle open project details
  const handleOpenDetails = (proj) => {
    setSelectedProject(proj);
    updateUrl({ search, category, status, sort, projectId: proj.id });
  };

  // Handle close project details
  const handleCloseDetails = () => {
    setSelectedProject(null);
    updateUrl({ search, category, status, sort, projectId: null });
  };

  // Optimistic like handler
  const handleLike = async (id) => {
    if (likedIds.has(id)) {
      addToast('You already liked this project.', 'info');
      return;
    }

    // Remember previous state for rollback
    const prevProjects = [...projects];
    const prevSelected = selectedProject ? { ...selectedProject } : null;

    // Optimistically update memory state
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
    if (selectedProject && selectedProject.id === id) {
      setSelectedProject((prev) => ({ ...prev, likes: prev.likes + 1 }));
    }

    // Optimistically mark as liked in state and localStorage
    markProjectAsLiked(id);
    setLikedIds(new Set([...likedIds, id]));

    try {
      trackRequestStart();
      const updated = await likeProject(id);
      // Ensure sync with server's count
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likes: updated.likes } : p))
      );
      if (selectedProject && selectedProject.id === id) {
        setSelectedProject((prev) => ({ ...prev, likes: updated.likes }));
      }
    } catch (err) {
      // Rollback on failure
      setProjects(prevProjects);
      if (prevSelected) setSelectedProject(prevSelected);
      // Remove from likedIds
      const reverted = new Set(likedIds);
      reverted.delete(id);
      setLikedIds(reverted);
      try {
        localStorage.setItem('launchboard_liked_ids', JSON.stringify(Array.from(reverted)));
      } catch {
        // ignore
      }
      addToast('Could not register like. Please try again.', 'error');
    } finally {
      trackRequestEnd();
    }
  };

  // Handle project submission
  const handleSubmitProject = async (formData) => {
    setIsSubmitting(true);
    setServerErrors({});
    trackRequestStart();

    try {
      const created = await createProject(formData);
      setIsSubmitOpen(false);
      addToast('Project published successfully!', 'success');

      // Prepend to project list and trigger highlight animation
      setProjects((prev) => [created, ...prev]);
      setJustAddedId(created.id);
      setTimeout(() => setJustAddedId(null), 3000);

      // Refresh stats
      loadStats();
    } catch (err) {
      if (err instanceof ApiError && err.fields && Object.keys(err.fields).length > 0) {
        setServerErrors(err.fields);
        addToast('Please correct the errors in the form.', 'error');
      } else {
        addToast(err.message || 'Failed to submit project.', 'error');
      }
    } finally {
      setIsSubmitting(false);
      trackRequestEnd();
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setStatus('all');
    setSort('newest');
  };

  return (
    <div className="app-container">
      {/* Server Wakeup Banner */}
      <WakeupBanner visible={isWakingUp} />

      {/* Header */}
      <Header onSubmitClick={() => setIsSubmitOpen(true)} />

      {/* Hero Section */}
      <Hero
        stats={stats}
        loading={statsLoading}
        onSubmitClick={() => setIsSubmitOpen(true)}
      />

      {/* Main Content & Gallery */}
      <main className="content-wrapper">
        {/* Toolbar */}
        <Toolbar
          search={search}
          category={category}
          status={status}
          sort={sort}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onStatusChange={setStatus}
          onSortChange={setSort}
          resultsCount={projects.length}
          loading={projectsLoading}
        />

        {/* Content Body: Loading, Error, Empty, or Grid */}
        {projectsLoading ? (
          <SkeletonGrid />
        ) : projectsError ? (
          <ErrorState message={projectsError} onRetry={loadProjects} />
        ) : projects.length === 0 ? (
          <EmptyState onClearFilters={handleClearFilters} />
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isLiked={likedIds.has(project.id)}
                onLike={handleLike}
                onClick={() => handleOpenDetails(project)}
                justAdded={justAddedId === project.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Project Details Drawer */}
      {selectedProject && (
        <ProjectDetailsDrawer
          project={selectedProject}
          isLiked={likedIds.has(selectedProject.id)}
          onLike={handleLike}
          onClose={handleCloseDetails}
        />
      )}

      {/* Submit Project Drawer */}
      <SubmitProjectDrawer
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSubmit={handleSubmitProject}
        isSubmitting={isSubmitting}
        serverErrors={serverErrors}
      />

      {/* Toasts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
