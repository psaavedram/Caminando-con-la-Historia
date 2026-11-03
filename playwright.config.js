import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
const executablePath=process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
export default defineConfig({
  testDir:'./tests',fullyParallel:true,
  workers:process.env.CI?2:undefined,
  forbidOnly:Boolean(process.env.CI),
  use:{baseURL:'http://127.0.0.1:5173',launchOptions:{executablePath,args:['--no-sandbox']},trace:'retain-on-failure'},
  projects:[{name:'desktop',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:1100}}},{name:'mobile',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}}],
  webServer:{command:'npm run dev',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI},
});
