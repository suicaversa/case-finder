import { test, expect } from '@playwright/test';

// Helper: set sessionStorage with form data and navigate to results
async function goToResultsDirectly(page: import('@playwright/test').Page) {
  const formData = {
    name: 'やまだ たろう',
    email: 'test@example.co.jp',
    phone: '03-1234-5678',
    jobCategory: 'accounting',
    industry: 'it-web',
    companyUrl: 'https://example.co.jp',
    companyName: '株式会社サンプル',
    noCompanyUrl: false,
    consultationContent: '経理業務の一部をアウトソースしたいと考えています。',
  };

  // Navigate to home first to establish the origin for sessionStorage
  await page.goto('/');
  await page.evaluate((data) => {
    sessionStorage.setItem('caseFinderFormData', JSON.stringify(data));
  }, formData);
  await page.goto('/results');

  // Wait for loading screen to disappear (3 second timer + render)
  await page.waitForSelector('text=御社に近い事例をご紹介します', { timeout: 10000 });
}

// =============================================================
// 1. Form flow (updated for new STEP order)
//    STEP 1: Business info (industry, job category, consultation)
//    STEP 2: Contact info (name, email, phone, company name, company URL)
// =============================================================
test.describe('Form input flow (STEP order: Business -> Contact)', () => {
  test('complete Step1 (business) -> Step2 (contact) -> submit navigates to /results', async ({ page }) => {
    await page.goto('/');

    // Verify Step1 heading (business info)
    await expect(page.getByText('ご相談内容を教えてください')).toBeVisible();

    // Select industry: IT / Web
    await page.getByRole('radio', { name: 'IT / Web' }).click();

    // Select job category: 経理・会計
    await page.getByRole('radio', { name: '経理・会計' }).click();

    // Enter consultation content (optional)
    const consultationInput = page.locator('#consultation');
    await consultationInput.fill('経理業務の一部をアウトソースしたいと考えています。');

    // Click "次へ" button to proceed to Step 2
    const nextButton = page.getByRole('button', { name: /次/ });
    await expect(nextButton).toBeEnabled({ timeout: 5000 });
    await nextButton.click();

    // Verify Step2 is displayed (contact info)
    await expect(page.getByText('お客様情報を入力してください')).toBeVisible();

    // Fill in contact info
    const nameInput = page.locator('#name');
    await nameInput.fill('やまだ たろう');

    const emailInput = page.locator('#email');
    await emailInput.fill('test@example.co.jp');

    const phoneInput = page.locator('#phone');
    await phoneInput.fill('0312345678');

    // Verify phone auto-formatting: 0312345678 -> 03-1234-5678
    await expect(phoneInput).toHaveValue('03-1234-5678');

    // Fill company name (required)
    const companyNameInput = page.locator('#companyName');
    await companyNameInput.fill('株式会社サンプル');

    // Fill company URL (optional)
    const companyUrlInput = page.locator('#companyUrl');
    await companyUrlInput.fill('https://example.co.jp');

    // Click "事例を見る" button
    await page.getByRole('button', { name: '事例を見る' }).click();

    // Verify navigation to /results page
    await page.waitForURL('**/results', { timeout: 10000 });
    expect(page.url()).toContain('/results');
  });
});

// =============================================================
// 2. EFO validation (fields are now on Step 2)
// =============================================================
test.describe('EFO validation', () => {
  // Helper to go to Step 2 (contact info) first
  async function goToStep2(page: import('@playwright/test').Page) {
    await page.goto('/');
    // Fill Step 1 minimum required fields
    await page.getByRole('radio', { name: 'IT / Web' }).click();
    await page.getByRole('radio', { name: '経理・会計' }).click();
    await page.getByRole('button', { name: /次/ }).click();
    await expect(page.getByText('お客様情報を入力してください')).toBeVisible();
  }

  test('shows error for invalid email', async ({ page }) => {
    await goToStep2(page);

    const emailInput = page.locator('#email');
    await emailInput.clear();
    await emailInput.fill('invalid-email');
    await emailInput.blur();

    await expect(page.getByText('正しいメールアドレスの形式で入力してください')).toBeVisible();
  });

  test('shows error for short phone number', async ({ page }) => {
    await goToStep2(page);

    const phoneInput = page.locator('#phone');
    await phoneInput.clear();
    await phoneInput.fill('0312');
    await phoneInput.blur();

    await expect(page.getByText('電話番号は10〜11桁で入力してください')).toBeVisible();
  });

  test('shows error for kanji name', async ({ page }) => {
    await goToStep2(page);

    const nameInput = page.locator('#name');
    await nameInput.clear();
    await nameInput.fill('山田太郎');
    await nameInput.blur();

    await expect(page.getByText('ひらがな または カタカナで入力してください')).toBeVisible();
  });

  test('progress bar updates as fields are completed on Step1', async ({ page }) => {
    await page.goto('/');

    // Step 1 has 2 fields: industry and jobCategory
    const progressBar = page.getByRole('progressbar');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '0');

    // Select industry -> 50%
    await page.getByRole('radio', { name: 'IT / Web' }).click();
    await expect(progressBar).toHaveAttribute('aria-valuenow', '50');

    // Select job category -> 100%
    await page.getByRole('radio', { name: '経理・会計' }).click();
    await expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });
});

// =============================================================
// 3. Company name required check
// =============================================================
test.describe('Company name required', () => {
  test('submit button is disabled when company name is empty on Step2', async ({ page }) => {
    await page.goto('/');

    // Complete Step 1
    await page.getByRole('radio', { name: 'IT / Web' }).click();
    await page.getByRole('radio', { name: '経理・会計' }).click();
    await page.getByRole('button', { name: /次/ }).click();
    await expect(page.getByText('お客様情報を入力してください')).toBeVisible();

    // Fill contact info but leave company name empty
    await page.locator('#name').fill('やまだ たろう');
    await page.locator('#email').fill('test@example.co.jp');
    await page.locator('#phone').fill('0312345678');

    // Company name is empty -- submit button should be disabled
    const submitButton = page.getByRole('button', { name: '事例を見る' });
    await expect(submitButton).toBeDisabled();

    // Now fill company name -- submit button should become enabled
    await page.locator('#companyName').fill('株式会社サンプル');
    await expect(submitButton).toBeEnabled();
  });
});

// =============================================================
// 4. Results page display
// =============================================================
test.describe('Results page display', () => {
  test('shows header, summary, AI comment, case cards, and load more button', async ({ page }) => {
    await goToResultsDirectly(page);

    // 1. Header
    await expect(page.getByText('御社に近い事例をご紹介します')).toBeVisible();

    // 2. Input summary
    await expect(page.getByText('入力内容')).toBeVisible();
    await expect(page.getByText('経理・会計', { exact: true })).toBeVisible();
    await expect(page.getByText('IT / Web')).toBeVisible();

    // 3. AI comment section (担当者 avatar and generated comment)
    await expect(page.getByText('担当者').first()).toBeVisible();

    // 4. Case cards - should show 2 initially
    const caseCards = page.locator('section').filter({ hasText: '近い事例' }).locator('.grid > div');
    await expect(caseCards).toHaveCount(2);

    // 5. "更に事例を探す" button
    await expect(page.getByRole('button', { name: '更に事例を探す' })).toBeVisible();
  });

  test('AI initial comment is not truncated', async ({ page }) => {
    await goToResultsDirectly(page);

    // Wait for loading indicator to disappear (AI comment loading)
    await expect(page.getByText('AIが事例を分析中...')).toBeHidden({ timeout: 30000 });

    // Locate the initial AI comment bubble (the first bg-red-50 element with text content)
    const aiCommentBubble = page.locator('.bg-red-50 p.text-gray-700').first();
    await expect(aiCommentBubble).toBeVisible({ timeout: 10000 });

    const commentText = await aiCommentBubble.textContent();
    expect(commentText).toBeTruthy();

    // 1. Comment should be at least 100 characters (truncated at 500 tokens was ~30 chars)
    expect(commentText!.length).toBeGreaterThanOrEqual(100);

    // 2. Comment should contain the expected closing phrase
    //    The system prompt instructs to end with "ぜひご覧ください"
    //    Both Gemini API and fallback include this phrase
    expect(commentText).toContain('ぜひご覧ください');

    // 3. Comment should end with a proper sentence ending, not mid-word
    //    (The original truncation bug produced text ending like "IT・Web" mid-sentence)
    expect(commentText!).toMatch(/[。！？）」ください]$/);
  });
});

// =============================================================
// 5. AI chat tests (focus area)
// =============================================================
test.describe('AI chat', () => {
  test('opens chat, sends message, and receives reply that is not truncated', async ({ page }) => {
    await goToResultsDirectly(page);

    // Click "会話を続ける" button
    await page.getByRole('button', { name: '会話を続ける' }).click();

    // Verify chat input is visible
    const chatInput = page.locator('textarea[placeholder*="相談内容"]');
    await expect(chatInput).toBeVisible();

    // Type and send a message
    await chatInput.fill('料金について教えてください');
    await page.getByRole('button', { name: '送信する' }).click();

    // Verify user message is displayed
    await expect(page.getByText('料金について教えてください')).toBeVisible();

    // Wait for AI reply to start appearing (fallback or Gemini, up to 30 seconds for streaming)
    const replyBubble = page.locator('.bg-red-50').filter({ hasText: /料金|営業担当|プラン|ご案内|費用/ }).last();
    await expect(replyBubble).toBeVisible({ timeout: 30000 });

    // Wait for streaming to complete (the streaming cursor span disappears when done)
    await expect(page.locator('span.animate-pulse')).toBeHidden({ timeout: 30000 });

    // Verify the reply is not truncated:
    // - Must be at least 30 characters (a truncated response would be very short)
    // - Must end with a sentence-ending character (。！、ください etc.), not mid-sentence
    const completedReply = page.locator('.bg-red-50').filter({ hasText: /料金|営業担当|プラン|ご案内|費用/ }).last();
    const replyText = await completedReply.locator('p.text-gray-700').textContent();
    expect(replyText).toBeTruthy();
    expect(replyText!.length).toBeGreaterThanOrEqual(30);
    expect(replyText!).toMatch(/[。！？）」ください]$/);
  });

  test('IME composition: Enter during composing does NOT send message', async ({ page }) => {
    await goToResultsDirectly(page);

    // Open chat
    await page.getByRole('button', { name: '会話を続ける' }).click();
    const chatInput = page.locator('textarea[placeholder*="相談内容"]');
    await expect(chatInput).toBeVisible();

    // Simulate IME composition flow
    // 1. Focus the textarea
    await chatInput.focus();

    // 2. Dispatch compositionstart event
    await chatInput.evaluate((el) => {
      el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    });

    // 3. Type text character by character (simulating IME input)
    await chatInput.type('てすと', { delay: 50 });

    // 4. Press Enter during composition (should NOT send)
    //    During IME, keydown event has isComposing=true or keyCode=229
    await chatInput.evaluate((el) => {
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 229,
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);
    });

    // 5. Dispatch compositionend event (user confirmed IME input)
    await chatInput.evaluate((el) => {
      el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    });

    // Wait a bit to ensure no message was sent
    await page.waitForTimeout(500);

    // The textarea should still have the text (not cleared by send)
    // Note: the fill/type may behave differently, so check that no user message bubble appeared
    // User messages appear in bg-primary (red) bubbles
    const userMessages = page.locator('.bg-primary.text-white').filter({ hasText: 'てすと' });
    await expect(userMessages).toHaveCount(0);
  });

  test('conversation context: second reply considers first message context', async ({ page }) => {
    test.setTimeout(60000); // Extend timeout for 2 API calls

    await goToResultsDirectly(page);

    // Open chat
    await page.getByRole('button', { name: '会話を続ける' }).click();
    const chatInput = page.locator('textarea[placeholder*="相談内容"]');
    await expect(chatInput).toBeVisible();

    // Send first message about 経理
    await chatInput.fill('経理業務のアウトソースについて教えてください');
    await page.getByRole('button', { name: '送信する' }).click();

    // Wait for first reply to appear and streaming to complete
    await expect(
      page.locator('.bg-red-50').filter({ hasText: /経理|アウトソース|業務/ }).last()
    ).toBeVisible({ timeout: 30000 });
    await expect(page.locator('span.animate-pulse')).toBeHidden({ timeout: 30000 });

    // Send second message referencing the first
    await chatInput.fill('具体的にどのような作業を任せられますか？');
    await page.getByRole('button', { name: '送信する' }).click();

    // Wait for second reply to appear and streaming to complete
    // Count assistant reply bubbles in the chat area (exclude the initial comment)
    // The chat messages container holds the reply bubbles
    const chatArea = page.locator('.max-h-96.overflow-y-auto');
    await expect(chatArea.locator('.bg-red-50 p.text-gray-700')).toHaveCount(2, { timeout: 30000 });
    await expect(page.locator('span.animate-pulse')).toBeHidden({ timeout: 30000 });

    // Verify that 2 user message bubbles exist (rounded-2xl distinguishes chat bubbles from buttons)
    const userMessages = page.locator('.rounded-2xl.bg-primary.text-white');
    await expect(userMessages).toHaveCount(2);

    // Verify second reply is not truncated
    const secondReplyText = await chatArea.locator('.bg-red-50 p.text-gray-700').last().textContent();
    expect(secondReplyText).toBeTruthy();
    expect(secondReplyText!.length).toBeGreaterThanOrEqual(30);
    expect(secondReplyText!).toMatch(/[。！？）」ください]$/);
  });
});

// =============================================================
// 6. Load more button
// =============================================================
test.describe('Load more button', () => {
  test('clicking "更に事例を探す" shows additional cases', async ({ page }) => {
    await goToResultsDirectly(page);

    // Initially 2 cases
    const casesGrid = page.locator('section').filter({ hasText: '近い事例' }).locator('.grid');
    const initialCards = casesGrid.locator('> div');
    await expect(initialCards).toHaveCount(2);

    // Click load more
    await page.getByRole('button', { name: '更に事例を探す' }).click();

    // Wait for loading animation to finish
    await page.waitForTimeout(2000);

    // Now should have 4 cases
    const updatedCards = casesGrid.locator('> div');
    await expect(updatedCards).toHaveCount(4);
  });
});
