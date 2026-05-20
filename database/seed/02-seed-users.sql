-- Seed users with bcrypt hashed passwords (cost factor 10)
-- store1 → store1, store2 → store2, facewatch1 → facewatch1

INSERT INTO auth.users (id, username, password_hash, role, tenant_id) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'store1', '$2b$10$ixgnDoVRddjM.MwsjOA7ieDIPPxzik/XhRjJ7cg2ZR2VRJWyVaPl2', 'store_staff', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000002', 'store2', '$2b$10$AFUU1S230l2YYrTZNhXPTOhzAfUliC59VvGHbJ3sUlGhVuqFFQId2', 'store_staff', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000003', 'facewatch1', '$2b$10$3iDMhA7JkahNI2woTOQiB.UmrPWe7EbLKevFkwBVVFIL6CIrkujxO', 'facewatch_analyst', NULL)
ON CONFLICT (username) DO NOTHING;
