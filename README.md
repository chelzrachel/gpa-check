# GPA Check — School of Foundation Studies

A fully static, mobile-friendly Foundation GPA & CGPA calculator for **GitHub Pages**. Students select grades only (no marks). Courses and credits are built in for Foundation in Arts and Foundation in Science, including the Semester 2 `Introduction to Property Development` elective (3 credits).

## Files

- `index.html` — student-facing webpage
- `style.css` — responsive design and A4 report styling
- `script.js` — grade scale, courses, weighted GPA/CGPA calculations, report preview and print-to-PDF
- `assets/` — add the school-managed `school-logo.png` here; it appears in the webpage and report

## Add the official school logo

1. Prepare the approved official logo as a PNG (ideally transparent).
2. In your GitHub repository, open `assets/` and upload a file called `school-logo.png`.
3. Commit the change. It automatically appears in the header and the PDF report when GitHub Pages updates.
4. Until then, the site displays a simple `SFS` text mark (not an invented university logo).

**Students cannot upload or change the logo in the published webpage.**

## Publish to GitHub Pages

1. Create a GitHub repository (for example, `gpa-check`).
2. Upload the **contents** of this folder, so `index.html`, `style.css`, `script.js`, and `assets/` are in the repository root.
3. Open **Settings → Pages**.
4. Set **Source: Deploy from a branch**, **Branch: main**, **Folder: /(root)** and save.
5. After deployment, visit `https://YOUR_USERNAME.github.io/gpa-check/` (replace both example names with yours).

No npm installation, database, build step, or API key is required.

## How the calculations work

- GPA = sum of (grade point × course credits) for the selected semester / sum of graded course credits.
- CGPA = sum of weighted points across entered semesters / sum of graded course credits across those semesters.
- Blank grades are not counted. `F` is counted as 0.00 with course credits included.
- A 3-credit Semester 2 elective is selected separately for each programme.
- Printed PDF is an **unofficial self-check report**, not a university transcript.

## Editing future courses

Open `script.js` and find the `PLANS` object. Modify programme `core` and `electives` lists carefully; validate credit totals before publishing. The grade-point scale is defined in `SCALE`.

## Privacy and hosting

GitHub Pages provides static hosting only: it does **not** collect or verify students’ grades, and it does not give students accounts. This version stores the entered self-check data in each student's own browser using local storage; it has no university server integration. No student data should be committed to the GitHub repository.

## Report

Students select **Preview / Save PDF**, review the A4 report, and use their browser's Print / Save as PDF option.
