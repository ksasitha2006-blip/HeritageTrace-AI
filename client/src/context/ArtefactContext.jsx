import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import * as svc from '../services/artefactService';
import {
  getArtefacts as fetchApiArtefacts,
  createArtefact as apiCreateArtefact,
  deleteArtefact as apiDeleteArtefact,
  checkBackendAvailability,
} from '../services/api';

const ArtefactContext = createContext();

export const useArtefacts = () => {
  const context = useContext(ArtefactContext);
  if (!context) {
    throw new Error('useArtefacts must be used within an ArtefactProvider');
  }
  return context;
};

export const ArtefactProvider = ({ children }) => {
  const [artefacts, setArtefacts] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [backendWarning, setBackendWarning] = useState(false);
  const deletedArtefactIds = useRef(new Set());

  const refreshBackendWarning = async () => {
    try {
      await checkBackendAvailability();
      setBackendWarning(false);
    } catch (healthError) {
      console.warn('Backend health check failed.', healthError);
      setBackendWarning(true);
    }
  };

  // Role state
  const [currentRole, setCurrentRole] = useState(() => {
    try {
      return localStorage.getItem('ht_current_role') || 'guest';
    } catch {
      return 'guest';
    }
  });

  const reloadData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [a, v, act, al] = await Promise.all([
        svc.getArtefacts(),
        svc.getVerifications(),
        svc.getActivities(),
        svc.getAlerts(),
      ]);
      setArtefacts(a);
      setVerifications(v);
      setActivities(act);
      setAlerts(al);
    } catch (err) {
      console.error('Bootstrap error:', err);
      setLoadError('Unable to load HeritageTrace data. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Persist role
  useEffect(() => {
    try { localStorage.setItem('ht_current_role', currentRole); } catch {}
  }, [currentRole]);

  // Try to sync with real backend (optional)
  useEffect(() => {
    const trySyncBackend = async () => {
      try {
        const response = await fetchApiArtefacts();
        setBackendWarning(false);
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          const backendArtefacts = response.data
            .filter((item) => ![
              item.id, item._id, item.artefactId, item.digitalId,
            ].some((id) => id !== undefined && id !== null && deletedArtefactIds.current.has(String(id))))
            .filter((item) => !['HT-57788', 'HT-37849'].includes(
              item.digitalId || item.id || item._id
            ))
            .map((item) => ({
              ...item,
              id: item.digitalId || item.id || item._id,
              image: item.image || item.imageUrl,
            }));
          setArtefacts((local) => {
            const ids = new Set(local.map((a) => a.id || a._id));
            const fresh = backendArtefacts.filter((item) => !ids.has(item.id || item._id));
            return fresh.length > 0 ? [...fresh, ...local] : local;
          });
        }
      } catch (err) {
        console.warn('Backend artefact sync failed; retaining local data.', err);
        await refreshBackendWarning();
      }
    };
    trySyncBackend();
  }, []);

  // ---------- Actions ----------

  const addArtefact = useCallback(async (artefactData) => {
    const imageFile = artefactData.imageFile;
    let full;

    if (imageFile) {
      const response = await apiCreateArtefact(artefactData);
      const saved = response.data;
      full = await svc.addArtefact({
        ...saved,
        id: saved.digitalId || saved.id || saved._id,
        image: saved.imageUrl,
        imageUrl: saved.imageUrl,
      });
    } else {
      full = await svc.addArtefact(artefactData);
    }

    setArtefacts((prev) => [full, ...prev]);

    await svc.addActivity({
      text: `Registered new artefact "${full.name}" in digital heritage ledger.`,
      type: 'temple',
      badge: 'Temple Registry',
      actor: 'temple-admin',
      action: 'registered',
    });
    setActivities(await svc.getActivities());

    if (!imageFile) {
      // Fire-and-forget sync remains available for text-only/demo registrations.
      apiCreateArtefact({
        name: full.name,
        period: full.period,
        material: full.material,
        dimensions: full.dimensions,
        origin: full.origin || full.templeName,
        description: full.description,
        status: full.status,
        category: full.category,
        imageUrl: full.image,
      }).catch((err) => {
        console.warn('Backend artefact sync failed; the local record was saved.', err);
        refreshBackendWarning();
      });
    }

    return full;
  }, []);

  const updateArtefactStatus = useCallback(async (id, newStatus) => {
    await svc.updateArtefactStatus(id, newStatus);
    const updated = await svc.getArtefacts();
    setArtefacts(updated);

    const target = updated.find((a) => a.id === id || a._id === id);
    const name = target ? target.name : 'Artefact';

    await svc.addActivity({
      text: `Status of "${name}" updated to ${newStatus.toUpperCase()}.`,
      type: newStatus === 'missing' ? 'alert' : 'verified',
      badge: 'Status Change',
      actor: currentRole,
      action: 'status_updated',
    });
    setActivities(await svc.getActivities());
  }, [currentRole]);

  const reportStolen = useCallback(async (id) => {
    await svc.reportStolen(id);
    const updated = await svc.getArtefacts();
    setArtefacts(updated);

    const target = updated.find((a) => a.id === id || a._id === id);
    const name = target ? target.name : 'Artefact';

    await svc.addActivity({
      text: `"${name}" reported stolen and flagged for national lookout.`,
      type: 'alert',
      badge: 'Theft Report',
      actor: 'temple-admin',
      action: 'reported_stolen',
    });
    setActivities(await svc.getActivities());
  }, []);

  const markSafe = useCallback(async (id) => {
    await svc.markSafe(id);
    const updated = await svc.getArtefacts();
    setArtefacts(updated);

    const target = updated.find((a) => a.id === id || a._id === id);
    const name = target ? target.name : 'Artefact';

    await svc.addActivity({
      text: `"${name}" has been marked safe and returned to custody.`,
      type: 'verified',
      badge: 'Status Safe',
      actor: 'temple-admin',
      action: 'marked_safe',
    });
    setActivities(await svc.getActivities());
  }, []);

  const deleteArtefact = useCallback(async (id) => {
    const idString = String(id);
    const target = artefacts.find((artefact) =>
      [artefact.id, artefact._id, artefact.artefactId, artefact.digitalId]
        .some((value) => value !== undefined && value !== null && String(value) === idString)
    );
    const idsToDelete = new Set([
      idString,
      ...[target?.id, target?._id, target?.artefactId, target?.digitalId]
        .filter((value) => value !== undefined && value !== null)
        .map(String),
    ]);
    idsToDelete.forEach((identifier) => deletedArtefactIds.current.add(identifier));

    try {
      await apiDeleteArtefact(id);
    } catch (error) {
      if (error.response?.status !== 404) {
        idsToDelete.forEach((identifier) => deletedArtefactIds.current.delete(identifier));
        throw error;
      }
    }

    await svc.removeArtefact(id);
    setArtefacts((current) => current.filter((artefact) =>
      ![artefact.id, artefact._id, artefact.artefactId, artefact.digitalId]
        .some((value) => value !== undefined && value !== null && String(value) === idString)
    ));

    try {
      const response = await fetchApiArtefacts();
      if (!Array.isArray(response?.data)) {
        throw new Error('Backend artefact response did not contain an artefact list.');
      }
      const backendArtefacts = response.data
        .filter((artefact) => ![
          artefact.id, artefact._id, artefact.artefactId, artefact.digitalId,
        ].some((identifier) =>
          identifier !== undefined && identifier !== null
          && deletedArtefactIds.current.has(String(identifier))
        ))
        .filter((artefact) => !['HT-57788', 'HT-37849'].includes(
          artefact.digitalId || artefact.id || artefact._id
        ))
        .map((artefact) => ({
          ...artefact,
          id: artefact.digitalId || artefact.id || artefact._id,
          image: artefact.image || artefact.imageUrl,
        }));
      setArtefacts(backendArtefacts);
      setBackendWarning(false);
    } catch (syncError) {
      console.warn('Backend artefact refresh failed after deletion; keeping the updated local list.', syncError);
      await refreshBackendWarning();
    }
  }, [artefacts]);

  const flagForVerification = useCallback(async ({
    candidateArtefact,
    seizedImage,
    location,
    date,
    officer = 'Investigator',
    notes = '',
    matchScore = 98.4,
  }) => {
    const newVerif = await svc.createVerification({
      artefactId: candidateArtefact.id || candidateArtefact._id,
      candidateName: candidateArtefact.name,
      candidatePeriod: candidateArtefact.period,
      candidateImage: candidateArtefact.image || candidateArtefact.imageUrl,
      seizedImage: seizedImage || candidateArtefact.image,
      seizureLocation: location || 'Seizure Terminal',
      seizureDate: date || new Date().toISOString().split('T')[0],
      officer,
      notes,
      matchScore,
    });
    setVerifications(await svc.getVerifications());

    await svc.addActivity({
      text: `Investigator flagged seized item matching "${candidateArtefact.name}" (${matchScore}% match) for ASI expert authentication.`,
      type: 'seizure',
      badge: 'Match sent',
      actor: 'investigator',
      action: 'match_sent',
    });
    setActivities(await svc.getActivities());
    return newVerif.id;
  }, []);

  const resolveVerification = useCallback(async (verifId, isApproved, expertNotes = '', rejectReason = '') => {
    const result = await svc.resolveVerification(verifId, isApproved, expertNotes, rejectReason);
    setVerifications(await svc.getVerifications());

    if (isApproved) {
      // Artefact status already updated inside service
      setArtefacts(await svc.getArtefacts());
    }
    setActivities(await svc.getActivities());
    return result.certNumber;
  }, []);

  const issueAlert = useCallback(async ({ title, urgency = 'critical', region, description }) => {
    await svc.issueAlert({ title, urgency, region, description });
    setAlerts(await svc.getAlerts());

    await svc.addActivity({
      text: `Central Authority issued ${urgency.toUpperCase()} alert: "${title}".`,
      type: 'alert',
      badge: 'National Alert',
      actor: 'authority-admin',
      action: 'alert_issued',
    });
    setActivities(await svc.getActivities());
  }, []);

  const addActivity = useCallback(async ({
    text,
    type = 'general',
    badge = 'Update',
    actor = currentRole,
    action = 'update',
  }) => {
    await svc.addActivity({ text, type, badge, actor, action });
    setActivities(await svc.getActivities());
  }, [currentRole]);

  const findMatches = useCallback(async (imageFile, candidates) => {
    return svc.findMatches(imageFile, candidates);
  }, []);

  // Computed
  const pendingMatchCount = verifications.filter((v) => v.status === 'pending').length;

  return (
    <ArtefactContext.Provider
      value={{
        artefacts,
        verifications,
        activities,
        alerts,
        currentRole,
        loading,
        loadError,
        backendWarning,
        reloadData,
        pendingMatchCount,
        setCurrentRole,
        addArtefact,
        updateArtefactStatus,
        reportStolen,
        markSafe,
        deleteArtefact,
        flagForVerification,
        resolveVerification,
        issueAlert,
        addActivity,
        findMatches,
      }}
    >
      {children}
    </ArtefactContext.Provider>
  );
};
