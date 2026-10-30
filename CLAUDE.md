# CLAUDE.md

## Tech Stack

- Plain HTML, CSS, and JavaScript only.
- No frameworks, no build step. Files open directly in a browser.

## Project Structure

```
/
├── CLAUDE.md    # this file
├── README.md
├── index.html   # the whole page: Lesson, Quiz and Simulator tabs
├── styles.css   # aviation-inspired styling, light and dark theme colours
└── script.js    # tabs, lesson switching, check-in questions, 8-question quiz, class lookup, weather simulator, progress, theme toggle
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

One page, switched between three tabs with JavaScript (no separate pages):

1. **Header**: course title and the light/dark theme toggle.
2. **Lesson tab**: progress bar, a menu of the 5 lessons (one per slide), and a check-in question at the end of each.
3. **Quiz tab**: 8 questions on the whole course, with right/wrong feedback per answer and a score at the end.
4. **Simulator tab**: the aerodrome weather simulator.
5. **Footer**: reset progress.

### How students move around

- Scroll down through the lessons in order.
- Tabs at the top switch between Lesson, Quiz and Simulator.
- In the Lesson tab, a menu jumps to any lesson, and each lesson ends with a check-in question before the next one starts.

### Phases

- **Phase 1: Course from the slides.** Ask the user for the slides (PDF or PowerPoint) first. Then build the page, lessons, exercises, responsive layout and theme toggle.
- **Phase 2: Polish and publish.** Choose the visual style and where to host it (decided later).
