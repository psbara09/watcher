-- Seed tenants
INSERT INTO auth.tenants (id, name, schema_name) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Store 1', 'store1'),
  ('a1000000-0000-0000-0000-000000000002', 'Store 2', 'store2')
ON CONFLICT (schema_name) DO NOTHING;
