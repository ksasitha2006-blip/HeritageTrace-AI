/**
 * artefactService.js — Mock service layer for artefact CRUD.
 * All functions are async so a real backend can replace them later.
 */
import {
  DEFAULT_ARTEFACTS,
  INITIAL_VERIFICATIONS,
  INITIAL_ACTIVITIES,
  INITIAL_ALERTS,
} from './mockData';

// --------------- helpers ---------------
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
const DELETED_ARTEFACTS_KEY = 'ht_deleted_artefact_ids';

const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return fallback;
};

const loadArtefacts = () => {
  const deletedIds = new Set(loadFromStorage(DELETED_ARTEFACTS_KEY, []));
  const rawStored = loadFromStorage('ht_artefacts', DEFAULT_ARTEFACTS);
  const stored = rawStored.filter((item) => !['HT-57788', 'HT-37849'].includes(
    item.digitalId || item.id || item._id
  ));
  if (stored.length !== rawStored.length) {
    saveToStorage('ht_artefacts', stored);
  }
  const defaultsById = new Map(DEFAULT_ARTEFACTS.map((item) => [item.id || item._id, item]));
  const storedIds = new Set(stored.map((item) => item.id || item._id));
  const merged = stored.map((item) => {
    const canonical = defaultsById.get(item.id || item._id);
    return canonical
      ? {
          ...canonical,
          ...item,
          name: canonical.name,
          description: canonical.description,
          image: canonical.image,
          imageUrl: canonical.imageUrl,
        }
      : item;
  });

  return [
    ...merged,
    ...DEFAULT_ARTEFACTS.filter((item) =>
      !storedIds.has(item.id || item._id) && !deletedIds.has(item.digitalId || item.id || item._id)
    ),
  ];
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
};

// --------------- Artefacts ---------------

export async function getArtefacts() {
  await delay(400);
  return loadArtefacts();
}

export async function getArtefactById(id) {
  await delay(200);
  const all = loadArtefacts();
  return all.find((a) => a.id === id || a._id === id) || null;
}

export async function addArtefact(artefactData) {
  await delay(350);
  const newId = `HT-${Math.floor(10000 + Math.random() * 90000)}`;
  const fullArtefact = {
    id: newId,
    _id: newId,
    registeredAt: new Date().toISOString().split('T')[0],
    status: 'safe',
    category: 'sculpture',
    ...artefactData,
    image: artefactData.image || '/images/nataraja.jpg',
    imageUrl: artefactData.image || '/images/nataraja.jpg',
    statusHistory: [
      { status: 'registered', date: new Date().toISOString().split('T')[0], note: 'Digitally catalogued' },
    ],
  };
  const current = loadArtefacts();
  const updated = [fullArtefact, ...current];
  saveToStorage('ht_artefacts', updated);
  return fullArtefact;
}

export async function reportStolen(id) {
  await delay(300);
  const all = loadArtefacts();
  const updated = all.map((a) => {
    if (a.id === id || a._id === id) {
      const history = [...(a.statusHistory || []), {
        status: 'reported_stolen',
        date: new Date().toISOString().split('T')[0],
        note: 'Reported stolen via Temple Admin dashboard',
      }];
      return { ...a, status: 'missing', statusHistory: history };
    }
    return a;
  });
  saveToStorage('ht_artefacts', updated);
  return updated.find((a) => a.id === id || a._id === id);
}

export async function markSafe(id) {
  await delay(300);
  const all = loadArtefacts();
  const updated = all.map((a) => {
    if (a.id === id || a._id === id) {
      const history = [...(a.statusHistory || []), {
        status: 'marked_safe',
        date: new Date().toISOString().split('T')[0],
        note: 'Marked safe by Temple Admin',
      }];
      return { ...a, status: 'safe', statusHistory: history };
    }
    return a;
  });
  saveToStorage('ht_artefacts', updated);
  return updated.find((a) => a.id === id || a._id === id);
}

export async function updateArtefactStatus(id, newStatus) {
  await delay(300);
  const all = loadArtefacts();
  const updated = all.map((a) => {
    if (a.id === id || a._id === id) {
      const history = [...(a.statusHistory || []), {
        status: newStatus,
        date: new Date().toISOString().split('T')[0],
        note: `Status changed to ${newStatus}`,
      }];
      return { ...a, status: newStatus, statusHistory: history };
    }
    return a;
  });
  saveToStorage('ht_artefacts', updated);
  return updated.find((a) => a.id === id || a._id === id);
}

export async function removeArtefact(id) {
  await delay(200);
  const all = loadArtefacts();
  const updated = all.filter((artefact) =>
    ![artefact.id, artefact._id, artefact.artefactId, artefact.digitalId]
      .some((value) => value !== undefined && value !== null && String(value) === String(id))
  );
  saveToStorage('ht_artefacts', updated);

  const deletedIds = loadFromStorage(DELETED_ARTEFACTS_KEY, []);
  if (!deletedIds.includes(id)) {
    saveToStorage(DELETED_ARTEFACTS_KEY, [...deletedIds, id]);
  }
}

// --------------- Verifications / Matches ---------------

export async function getVerifications() {
  await delay(200);
  return loadFromStorage('ht_verifications', INITIAL_VERIFICATIONS);
}

export async function getPendingMatches() {
  await delay(200);
  const all = loadFromStorage('ht_verifications', INITIAL_VERIFICATIONS);
  return all.filter((v) => v.status === 'pending');
}

export async function createVerification(data) {
  await delay(300);
  const verifId = `VERIF-2026-${Math.floor(100 + Math.random() * 900)}`;
  const newVerification = {
    id: verifId,
    artefactId: data.artefactId,
    candidateName: data.candidateName,
    candidatePeriod: data.candidatePeriod || '',
    candidateImage: data.candidateImage,
    seizedImage: data.seizedImage || data.candidateImage,
    seizureLocation: data.seizureLocation || 'Seizure Terminal',
    seizureDate: data.seizureDate || new Date().toISOString().split('T')[0],
    officer: data.officer || 'Investigator',
    notes: data.notes || '',
    matchScore: data.matchScore || 95.0,
    visualSimilarity: data.visualSimilarity || (data.matchScore ? data.matchScore - 1.2 : 93.8),
    inscriptionMatch: data.inscriptionMatch || (data.matchScore ? data.matchScore + 0.7 : 95.7),
    materialMatch: data.materialMatch || (data.matchScore ? data.matchScore - 1.6 : 93.4),
    ocrText: data.ocrText || 'Inscription text extracted via OCR analysis',
    aiReasoning: data.aiReasoning || 'AI feature vectors matched with high confidence across visual, material and inscription dimensions.',
    status: 'pending',
    submittedAt: new Date().toISOString(),
    analysisNotes: '',
    certificateId: null,
  };
  const current = loadFromStorage('ht_verifications', INITIAL_VERIFICATIONS);
  const updated = [newVerification, ...current];
  saveToStorage('ht_verifications', updated);
  return newVerification;
}

export async function resolveVerification(verifId, isApproved, expertNotes = '', rejectReason = '') {
  await delay(400);
  const certNumber = isApproved
    ? `ASI-COA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    : null;

  const all = loadFromStorage('ht_verifications', INITIAL_VERIFICATIONS);
  const updated = all.map((v) => {
    if (v.id === verifId) {
      return {
        ...v,
        status: isApproved ? 'authenticated' : 'rejected',
        analysisNotes: expertNotes,
        rejectReason: rejectReason,
        certificateId: certNumber,
        resolvedAt: new Date().toISOString(),
      };
    }
    return v;
  });
  saveToStorage('ht_verifications', updated);

  // If approved, also update the artefact status to recovered
  if (isApproved) {
    const item = all.find((v) => v.id === verifId);
    if (item) {
      await updateArtefactStatus(item.artefactId, 'recovered');
    }
  }

  const item = updated.find((v) => v.id === verifId);
  if (item) {
    await addActivity({
      text: isApproved
        ? `ASI Senior Epigraphist authenticated "${item.candidateName}". Certificate #${certNumber} generated.`
        : `ASI Expert rejected match for "${item.candidateName}". Reason: ${rejectReason || 'Modern replica / false positive'}.`,
      type: isApproved ? 'verified' : 'alert',
      badge: isApproved ? 'ASI Certified' : 'ASI Disqualified',
      actor: 'asi-expert',
      action: isApproved ? 'authenticated' : 'rejected',
    });
  }

  return { certNumber, verification: item };
}

// --------------- AI Image Matching ---------------

export async function findMatches(imageFile, artefacts = loadArtefacts()) {
  const similarityServiceUrl = (import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001').replace(/\/$/, '');
  const queryResponse = imageFile instanceof Blob ? null : await fetch(imageFile);
  if (queryResponse && !queryResponse.ok) {
    throw new Error(`Could not read the query image (${queryResponse.status}).`);
  }
  const queryBlob = imageFile instanceof Blob ? imageFile : await queryResponse.blob();
  const queryFile = new File([queryBlob], 'query-image', {
    type: queryBlob.type || 'image/jpeg',
  });

  const searchForm = new FormData();
  searchForm.append('query_image', queryFile);
  let searchResponse;
  try {
    searchResponse = await fetch(`${similarityServiceUrl}/api/similarity/search`, {
      method: 'POST',
      body: searchForm,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Could not connect to the AI matching service at ${similarityServiceUrl}. `
        + 'Start the service from ai_agent_service and make sure it is listening on port 8001.',
      );
    }
    throw error;
  }
  const searchResult = await searchResponse.json();
  if (!searchResponse.ok) {
    throw new Error(searchResult.detail || `Similarity service returned ${searchResponse.status}.`);
  }

  const artefactsById = new Map();
  artefacts.forEach((artefact) => {
    [artefact.id, artefact._id, artefact.digitalId].filter(Boolean).forEach((id) => {
      artefactsById.set(String(id), artefact);
    });
  });
  const indexedMatches = searchResult.matches || [];
  const indexedIds = new Set(indexedMatches.map((match) => String(match.artefact_id)));
  const matches = indexedMatches.map((match) => {
    const indexedArtefact = artefactsById.get(String(match.artefact_id));
    const matchScore = match.fused_score * 100;
    return {
      ...(indexedArtefact || {}),
      id: indexedArtefact?.id || match.artefact_id,
      _id: indexedArtefact?._id || match.artefact_id,
      name: indexedArtefact?.name || match.name,
      image: indexedArtefact?.image || match.image_url,
      imageUrl: indexedArtefact?.imageUrl || match.image_url,
      matchScore,
      visualSimilarity: matchScore,
      orbScore: match.orb_score,
      deepScore: match.deep_score,
    };
  });

  // Keep the original pairwise path for registry records not yet represented in the index.
  const referenceScores = new Map();

  for (const artefact of artefacts) {
    const artefactIds = [artefact.id, artefact._id, artefact.digitalId]
      .filter(Boolean)
      .map(String);
    if (artefactIds.some((id) => indexedIds.has(id))) continue;

    const imageUrl = artefact.image || artefact.imageUrl;
    if (!imageUrl) continue;

    let result = referenceScores.get(imageUrl);
    if (!result) {
      const referenceResponse = await fetch(imageUrl);
      if (!referenceResponse.ok) {
        throw new Error(`Could not read the registry image for ${artefact.name} (${referenceResponse.status}).`);
      }
      const referenceBlob = await referenceResponse.blob();
      const formData = new FormData();
      formData.append('query_image', queryFile);
      formData.append('reference_image', new File(
        [referenceBlob],
        `${artefact.id || artefact._id || 'reference'}`,
        { type: referenceBlob.type || 'image/jpeg' },
      ));

      const response = await fetch(`${similarityServiceUrl}/api/similarity/match`, {
        method: 'POST',
        body: formData,
      });
      result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || `Similarity service returned ${response.status}.`);
      }
      referenceScores.set(imageUrl, result);
    }

    matches.push({
      ...artefact,
      matchScore: result.fused_score * 100,
      visualSimilarity: result.fused_score * 100,
      orbScore: result.orb_score,
      deepScore: result.deep_score,
    });
  }

  return matches.sort((left, right) => {
    const scoreDifference = right.matchScore - left.matchScore;
    if (scoreDifference !== 0) return scoreDifference;

    const leftImage = left.image || left.imageUrl;
    const rightImage = right.image || right.imageUrl;
    if (leftImage !== rightImage) return 0;

    // Prefer the confirmed Sivan record when identical registry images tie.
    const leftSivan = left.digitalId === 'HT-39266' || left.id === 'HT-39266';
    const rightSivan = right.digitalId === 'HT-39266' || right.id === 'HT-39266';
    return Number(rightSivan) - Number(leftSivan);
  });
}

// --------------- Activities ---------------

export async function getActivities() {
  await delay(150);
  return loadFromStorage('ht_activities', INITIAL_ACTIVITIES);
}

export async function addActivity({
  text,
  type = 'general',
  badge = 'Update',
  actor = 'authority-admin',
  action = 'update',
}) {
  await delay(100);
  const newAct = {
    id: `ACT-${Date.now()}`,
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString(),
    type,
    badge,
    actor,
    action,
  };
  const current = loadFromStorage('ht_activities', INITIAL_ACTIVITIES);
  const updated = [newAct, ...current.slice(0, 19)];
  saveToStorage('ht_activities', updated);
  return newAct;
}

// --------------- Alerts ---------------

export async function getAlerts() {
  await delay(150);
  return loadFromStorage('ht_alerts', INITIAL_ALERTS);
}

export async function issueAlert({ title, urgency = 'critical', region, description }) {
  await delay(200);
  const newAlert = {
    id: `ALT-${Date.now()}`,
    title,
    urgency,
    region: region || 'National Border Checkpoints',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    description,
  };
  const current = loadFromStorage('ht_alerts', INITIAL_ALERTS);
  const updated = [newAlert, ...current];
  saveToStorage('ht_alerts', updated);
  return newAlert;
}
