const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Starting DOM Auth Verification...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Set viewport to a desktop size
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // Generate a unique email to avoid "User already registered" errors
    const randomNum = Math.floor(Math.random() * 100000);
    const testEmail = `agent.test.${randomNum}@mmmut.ac.in`;
    const testPassword = 'password123';
    console.log(`Generated Test Email: ${testEmail}`);

    // --- STEP 1: Registration (Basics) ---
    console.log('Navigating to Registration Page...');
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle2' });

    console.log('Waiting for inputs to mount...');
    await page.waitForSelector('input[placeholder="John Doe"]', { timeout: 10000 });

    console.log('Filling out Step 1: Basics...');
    await page.type('input[placeholder="John Doe"]', 'Agent Tester');
    await page.type('input[placeholder="name@mmmut.ac.in"]', testEmail);
    await page.type('input[placeholder="••••••••"]', testPassword);

    console.log('Clicking CONTINUE...');
    const step1Buttons = await page.$$('button');
    let step1ContinueBtn = null;
    for (const btn of step1Buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('CONTINUE')) {
        step1ContinueBtn = btn;
        break;
      }
    }
    if (step1ContinueBtn) {
      await step1ContinueBtn.click();
    } else {
      throw new Error('CONTINUE button not found in Step 1');
    }
    
    console.log('Waiting for Step 2 inputs to mount...');
    await page.waitForSelector('input[placeholder="240101001"]', { timeout: 5000 });

    // --- STEP 2: Registration (University Details) ---
    console.log('Filling out Step 2: University Details...');
    await page.type('input[placeholder="240101001"]', '240101001');
    await page.type('input[placeholder="2024CSE001"]', '2024CSE001');

    // Click Branch Select trigger
    const selectTriggers = await page.$$('button[role="combobox"]');
    if (selectTriggers.length > 0) {
      await selectTriggers[0].click();
      await new Promise(r => setTimeout(r, 500));
      // Click Computer Science & Engineering option
      // The option should appear in a portal
      const options = await page.$$('[role="option"]');
      for (const opt of options) {
        const text = await page.evaluate(el => el.textContent, opt);
        if (text.includes('Computer Science & Engineering')) {
          await opt.click();
          break;
        }
      }
    }
    await new Promise(r => setTimeout(r, 500));

    console.log('Clicking CONTINUE for Step 2...');
    // Click the continue button (there should be only one button of type button at this stage)
    const buttons = await page.$$('button');
    let continueBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('CONTINUE')) {
        continueBtn = btn;
        break;
      }
    }
    if (continueBtn) {
      await continueBtn.click();
    } else {
      throw new Error('CONTINUE button not found in Step 2');
    }
    await new Promise(r => setTimeout(r, 1000));

    // --- STEP 3: Registration (Academic Info) ---
    console.log('Filling out Step 3: Academic Details...');
    
    // Select Year
    const updatedSelects = await page.$$('button[role="combobox"]');
    // There should be two selects: Year and Semester
    if (updatedSelects.length >= 2) {
      // Click Year
      await updatedSelects[0].click();
      await new Promise(r => setTimeout(r, 500));
      let options = await page.$$('[role="option"]');
      for (const opt of options) {
        const text = await page.evaluate(el => el.textContent, opt);
        if (text.includes('1st Year')) {
          await opt.click();
          break;
        }
      }
      await new Promise(r => setTimeout(r, 500));

      // Click Semester
      await updatedSelects[1].click();
      await new Promise(r => setTimeout(r, 500));
      options = await page.$$('[role="option"]');
      for (const opt of options) {
        const text = await page.evaluate(el => el.textContent, opt);
        if (text.includes('Sem 1')) {
          await opt.click();
          break;
        }
      }
    }
    await new Promise(r => setTimeout(r, 500));

    console.log('Accepting Terms...');
    await page.click('#terms');
    await new Promise(r => setTimeout(r, 500));

    console.log('Submitting Form...');
    // Submit is type submit
    await page.click('button[type="submit"]');

    console.log('Waiting for Redirect to /verify...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    console.log(`Current URL: ${page.url()}`);

    if (!page.url().includes('/verify')) {
      throw new Error('Registration did not redirect to /verify page');
    }

    // --- STEP 4: OTP Verification ---
    console.log('Reading OTP from backend file...');
    const otpFilePath = path.join(__dirname, '..', 'otp_test.txt');
    if (!fs.existsSync(otpFilePath)) {
      throw new Error('otp_test.txt not found! Did the backend fail to write the OTP?');
    }
    const otp = fs.readFileSync(otpFilePath, 'utf8').trim();
    console.log(`Retrieved OTP: ${otp}`);

    console.log('Entering OTP on verify page...');
    // Verify page inputs: Usually there's an input box for OTP. Let's inspect VerifyPage or just type in the first input.
    await page.waitForSelector('input', { timeout: 5000 });
    await page.type('input', otp);
    
    console.log('Submitting OTP...');
    const verifyButtons = await page.$$('button');
    let verifySubmitBtn = null;
    for (const btn of verifyButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.toUpperCase().includes('VERIFY') || text.toUpperCase().includes('SUBMIT')) {
        verifySubmitBtn = btn;
        break;
      }
    }
    if (verifySubmitBtn) {
      await verifySubmitBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }

    console.log('Waiting for Redirect to Dashboard...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    console.log(`Current URL: ${page.url()}`);

    if (!page.url().includes('/dashboard')) {
      throw new Error('Verification did not redirect to /dashboard');
    }
    console.log('🎉 REGISTRATION & VERIFICATION VIA DOM SUCCESSFUL!');

    // --- STEP 5: Logout ---
    console.log('Attempting to Logout...');
    // Find Logout button
    const dashButtons = await page.$$('button');
    let logoutBtn = null;
    for (const btn of dashButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.toUpperCase().includes('LOGOUT') || text.toUpperCase().includes('SIGN OUT')) {
        logoutBtn = btn;
        break;
      }
    }
    if (logoutBtn) {
      await logoutBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 });
      console.log(`Logged out. Current URL: ${page.url()}`);
    } else {
      console.log('Logout button not found. Manually routing to /login...');
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    }

    // --- STEP 6: Login ---
    console.log('Logging in with same credentials...');
    await page.waitForSelector('input[placeholder="name@mmmut.ac.in"]', { timeout: 5000 });
    await page.type('input[placeholder="name@mmmut.ac.in"]', testEmail);
    await page.type('input[placeholder="••••••••"]', testPassword);
    
    // Find sign in button
    const loginButtons = await page.$$('button');
    let loginBtn = null;
    for (const btn of loginButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.toUpperCase().includes('SIGN IN') || text.toUpperCase().includes('LOGIN')) {
        loginBtn = btn;
        break;
      }
    }
    if (loginBtn) {
      await loginBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    console.log(`Successfully Logged In. Current URL: ${page.url()}`);
    
    if (page.url().includes('/dashboard')) {
      console.log('🎉 LOGIN VIA DOM SUCCESSFUL!');
    } else {
      throw new Error('Login did not redirect to /dashboard');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    await browser.close();
    console.log('DOM Verification Complete.');
  }
})();
