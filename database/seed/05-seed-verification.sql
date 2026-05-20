-- Seed verification records for Store 1 incidents
INSERT INTO verification.verification_records (id, incident_id, tenant_id, status, ai_confidence_score, ai_validated_at, analyst_id, decision, notes, reviewed_at, created_at, updated_at) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'approved', 0.92, '2026-05-15 15:05:00', 'b1000000-0000-0000-0000-000000000003', 'approved', 'Clear CCTV footage. Suspect identifiable. Incident well-documented.', '2026-05-16 10:00:00', '2026-05-15 15:00:00', '2026-05-16 10:00:00'),
  ('e1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'rejected', 0.78, '2026-05-16 09:35:00', 'b1000000-0000-0000-0000-000000000003', 'rejected', 'Insufficient evidence for identification. Verbal incident only, no physical evidence of offence.', '2026-05-17 11:00:00', '2026-05-16 09:30:00', '2026-05-17 11:00:00'),
  ('e1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'in_review', 0.85, '2026-05-18 17:05:00', NULL, NULL, NULL, NULL, '2026-05-18 17:00:00', '2026-05-18 17:05:00'),
  ('e1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'ai_validated', 0.88, '2026-05-19 08:35:00', NULL, NULL, NULL, NULL, '2026-05-19 08:30:00', '2026-05-19 08:35:00');

-- Seed verification records for Store 2 incidents
INSERT INTO verification.verification_records (id, incident_id, tenant_id, status, ai_confidence_score, ai_validated_at, analyst_id, decision, notes, reviewed_at, created_at, updated_at) VALUES
  ('e2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'approved', 0.95, '2026-05-14 11:50:00', 'b1000000-0000-0000-0000-000000000003', 'approved', 'Physical evidence retained. Clear documentation of counterfeit notes.', '2026-05-15 09:00:00', '2026-05-14 11:45:00', '2026-05-15 09:00:00'),
  ('e2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'pending_ai', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-17 13:15:00', '2026-05-17 13:15:00'),
  ('e2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'in_review', 0.81, '2026-05-19 15:50:00', NULL, NULL, NULL, NULL, '2026-05-19 15:45:00', '2026-05-19 15:50:00');

-- Seed verification history
INSERT INTO verification.verification_history (id, verification_id, action, actor, details, created_at) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'submitted', 'incident-service', '{"incidentId": "c1000000-0000-0000-0000-000000000001"}', '2026-05-15 15:00:00'),
  ('f1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'ai_validated', 'system/ai', '{"confidenceScore": 0.92}', '2026-05-15 15:05:00'),
  ('f1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001', 'analyst_approved', 'facewatch1', '{"notes": "Clear CCTV footage. Suspect identifiable."}', '2026-05-16 10:00:00'),
  ('f1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000002', 'submitted', 'incident-service', '{"incidentId": "c1000000-0000-0000-0000-000000000002"}', '2026-05-16 09:30:00'),
  ('f1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000002', 'ai_validated', 'system/ai', '{"confidenceScore": 0.78}', '2026-05-16 09:35:00'),
  ('f1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000002', 'analyst_rejected', 'facewatch1', '{"notes": "Insufficient evidence for identification."}', '2026-05-17 11:00:00'),
  ('f1000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000003', 'submitted', 'incident-service', '{"incidentId": "c1000000-0000-0000-0000-000000000003"}', '2026-05-18 17:00:00'),
  ('f1000000-0000-0000-0000-000000000008', 'e1000000-0000-0000-0000-000000000003', 'ai_validated', 'system/ai', '{"confidenceScore": 0.85}', '2026-05-18 17:05:00');
