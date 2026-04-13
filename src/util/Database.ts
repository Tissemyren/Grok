import { Pool, PoolConnection, createPool } from 'mariadb';

export class Database {

    private pool: Pool;

    constructor() {
        this.pool = createPool({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            port: process.env.DATABASE_PORT,
            password: "",
            database: process.env.DATABASE_NAME,
            connectionLimit: 3,
            bigIntAsNumber: true,
            insertIdAsNumber: true
        })

        this.pool.getConnection()
        .then(conn => {
            console.log('Database connection established');
            conn.release();
        })
        .catch(err => {
            console.error('Error connecting to database: ', err);
            process.exit(1);
        });
    }

    async query(query: string, values?: any[]) {
        const conn = await this.pool.getConnection();
        const result = await conn.query(query, values);
        conn.release();
        
        return result;
    }

    async batch(query: string, values: any[][]) {
        const conn = await this.pool.getConnection();
        const result = await conn.batch(query, values);
        conn.release();

        return result;
    }
}