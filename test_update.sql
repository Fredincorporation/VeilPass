-- Check the constraint definition
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'events' AND constraint_name LIKE '%status%';

-- Check the constraint details
SELECT con.conname as constraint_name, 
       pg_get_constraintdef(con.oid) as constraint_def
FROM pg_constraint con
WHERE con.conrelid = 'events'::regclass
AND con.conname LIKE '%status%';

-- Try to see what the check expression is
SELECT pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'events'::regclass
AND contype = 'c';
