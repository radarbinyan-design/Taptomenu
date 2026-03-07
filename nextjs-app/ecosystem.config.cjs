module.exports = {
  apps: [
    {
      name: 'tapmenu-nextjs',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/home/user/webapp/nextjs-app',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'postgresql://user:password@localhost:5432/tapmenu',
        NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'placeholder-service-key',
        WIFI_ENCRYPTION_KEY: 'a'.repeat(64),
        CRON_SECRET: 'dev-cron-secret',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
}
