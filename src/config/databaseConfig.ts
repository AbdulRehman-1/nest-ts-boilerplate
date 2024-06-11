const datbaseCon = () => ({
  database: {
    type: `${process.env.DATABASE_TYPE}` || 'postgres',
    host: `${process.env.POSTGRES_HOST}` || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 54322,
    username: `${process.env.POSTGRES_USER}` || 'your_username',
    password: `${process.env.POSTGRES_PASSWORD}` || 'your_password',
    database: `${process.env.POSTGRES_DB}` || 'your_database_name',
    synchronize: process.env.DATABASE_SYNCHRONIZE || true,
    logging: process.env.DATABASE_LOGGING || true,
    authPlugins: {
      mysql_clear_password: () => () => Buffer.from('password' + '\0'),
    },
  },
});

export default datbaseCon;
