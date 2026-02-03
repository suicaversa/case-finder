# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Case Finder is an interactive case study matching tool for HELPYOU BPO service. Users input their company information (industry, job category, etc.) and receive relevant case studies showing how HELPYOU services apply to their situation.

## Project Status

This project is in the **design phase** with no implementation yet. The design specification is in `docs/00_first-design.md` (Japanese).

## System Architecture (Planned)

Three-screen system:

1. **Input Screen (User-facing)** - 2-step form
   - Step 1: Contact info (name, email, phone)
   - Step 2: Business info (job category, industry, company URL, optional consultation content)

2. **Case Introduction Screen (User-facing)** - Main interface
   - Input confirmation section
   - Matched case studies with: title, background, requested content, actual services provided, contract plan, diagram/illustration
   - Integration with external scheduling service for sales follow-up

3. **Admin Dashboard (Operations/Sales team)**
   - Inquiry list with status tracking (未対応/対応中/対応済み)
   - Inquiry detail view with notes/memo functionality

## Predefined Options

**Job Categories (業務カテゴリ):**
- 経理・会計 (Accounting)
- 人事・労務 (HR/Personnel)
- 営業事務 (Sales Admin)
- カスタマーサポート (Customer Support)
- IT / 情シス (IT/Information Systems)
- マーケティング支援 (Marketing Support)
- その他 (Other)

**Industries (業界):**
- IT / Web
- EC / 小売 (EC/Retail)
- 製造 (Manufacturing)
- サービス (Service)
- 不動産 (Real Estate)
- 医療・介護 (Healthcare/Nursing Care)
- 教育 (Education)
- その他 (Other)
