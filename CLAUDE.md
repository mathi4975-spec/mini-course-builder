# CLAUDE.md

## Tech Stack

- Plain HTML, CSS, and JavaScript only.
- No frameworks, no build step. Files open directly in a browser.

## Project Structure

```
/
├── CLAUDE.md    # this file
├── README.md
├── index.html   # the whole course: one section per lesson
├── styles.css   # aviation-inspired styling, light and dark theme colours
└── script.js    # lesson switching, quizzes, class lookup, progress, theme toggle
```

The source slide deck is not stored in the repository.

Update this section as files and folders are added.

## Key Requirements

1. Every page must be responsive and work on desktop, tablet and phone.
2. Users can toggle between a light and a dark theme. The default is the light theme.

## Rules for Claude

- Explain technical terms in plain language.
- Ask before making big changes.
- Ask rather than guess.

## Feature Plan

A mini-course for students in a class, built once from a set of 3-5 slides. Students should learn to apply a skill.

### Site structure

One long scrolling page, top to bottom:

1. **Header**: course title and the light/dark theme toggle.
2. **Intro**: who the course is for and what students will be able to do.
3. **Lessons (3-5)**: one per slide. Each has a short explanation, key steps, and a "Try it" exercise.
4. **Footer**: short wrap-up and next steps.

### How students move around

- Scroll down through the lessons in order.
- A menu at the top has links that jump to any lesson.
- Each lesson ends with its "Try it" exercise before the next one starts.

### Phases

- **Phase 1: Course from the slides.** Ask the user for the slides (PDF or PowerPoint) first. Then build the page, lessons, exercises, responsive layout and theme toggle.
- **Phase 2: Polish and publish.** Choose the visual style and where to host it (decided later).
