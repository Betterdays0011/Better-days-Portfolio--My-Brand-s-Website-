# Abdulrasheed Abraham Sadiq: student portfolio and academic planner

COS 106 term project, MIVA Open University. Plain HTML, CSS and JavaScript. No build step.

## Folder
- `index.html`, `about.html`, `projects.html`, `planner.html`, `contact.html`
- `css/style.css` shared styles
- `js/main.js` mobile menu; `js/planner.js` task manager; `js/contact.js` form validation
- `images/` photos, logo and certificates (lowercase file names, GitHub is case-sensitive)
- `media/` intro video (MP4 and WebM) and poster

## Preview on your computer
1. Open the folder in VS Code (File, Open Folder).
2. Install the "Live Server" extension, right-click `index.html`, choose "Open with Live Server".

## Put it on GitHub
1. Create a new repository on github.com (for example `better-days-portfolio`).
2. Upload the folder contents (Add file, Upload files) or push from VS Code with git.
3. Submit the repository link.

## Host it on Netlify
1. In Netlify choose Add new site, then Import from Git, and pick the repository.
2. Leave the build command empty and set the publish directory to `.` (the root).
3. Submit the Netlify address. Later pushes to GitHub update the live site automatically.
(Quick alternative: drag the folder onto app.netlify.com/drop. GitHub Pages also works.)

## Easy edits
- "13+ students" appears in `index.html`, `about.html` and `projects.html`. Better Days detail (services, vision, waitlist) lives at the bottom of `projects.html`.
- Sample planner tasks: `sampleTasks()` in `js/planner.js`.
- Replace the intro video by overwriting `media/better-days-intro.mp4` and `.webm`.
- The contact form has no server: after validation the visitor sends the message through WhatsApp or email.
