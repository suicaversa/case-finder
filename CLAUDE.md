# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Case Finder is an interactive case study matching tool for HELPYOU BPO service. Users input their company information (industry, job category, etc.) and receive relevant case studies showing how HELPYOU services apply to their situation.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
```

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Input form (Step 1 & 2)
│   └── results/page.tsx   # Case introduction page
├── components/
│   ├── forms/             # Form components (Step1, Step2, StepIndicator)
│   └── cases/             # Case display components (CaseCard)
└── types/
    └── index.ts           # TypeScript types and constants
```

## System Architecture

Three-screen system (Admin Dashboard not yet implemented):

1. **Input Screen** (`/`) - 2-step form
   - Step 1: Contact info (name, email, phone)
   - Step 2: Business info (job category, industry, company URL, optional consultation content)

2. **Case Introduction Screen** (`/results`) - Main interface
   - Input confirmation section with edit button
   - AI-generated case studies via Dify workflow API (streaming)
   - AI chat widget for follow-up questions
   - CTA for scheduling service integration

3. **Admin Dashboard** (TODO)
   - Inquiry list with status tracking (未対応/対応中/対応済み)
   - Inquiry detail view with notes/memo functionality

## Predefined Options

Defined in `src/types/index.ts`:

**Job Categories (業務カテゴリ):** accounting, hr, sales-admin, customer-support, it, marketing, other

**Industries (業界):** it-web, ec-retail, manufacturing, service, real-estate, healthcare, education, other
