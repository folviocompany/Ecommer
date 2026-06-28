import { neon } from '@neondatabase/serverless';

// Durante o build, DATABASE_URL não existe → placeholder evita o throw.
// Em runtime, a variável real é usada e as queries funcionam normalmente.
const sql = neon(process.env.DATABASE_URL ?? 'postgresql://build:placeholder@localhost/placeholder');

export default sql;
