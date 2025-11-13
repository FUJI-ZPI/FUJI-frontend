# FUJI - Japanese Learning App Frontend

This repository contains the frontend mobile application for FUJI, a tool designed to help users learn Japanese
handwriting (Kanji) and vocabulary using a Spaced Repetition System (SRS).

This client is built with React Native (Expo) and consumes the REST API provided by
the [FUJI Backend](https://github.com/FuJI-ZPI/FUJI-backend).

## How It Looks

<img src="https://github.com/user-attachments/assets/TODO" alt="Home Screen" width="250"/>

## Core Features

* **Google Authentication**: Secure user login and registration using Google Sign-in.
* **SRS Dashboard**: A central hub showing user progress, available lessons, and upcoming reviews.
* **Interactive Practice**: A complete SRS session flow for answering lessons and reviews.
* **Kanji Drawing Canvas**: An interactive canvas (built with **React Native Skia**) for practicing kanji handwriting
  and submitting for recognition.
* **AI Chatbot**: An integrated "Yuki-sensei" chatbot for practicing Japanese conversation.
* **Study Decks**: Browse all available Kanji and Vocabulary items sorted by level.

## Tech Stack

* **Core**: React Native, Expo, TypeScript
* **Navigation**: Expo Router
* **Styling**: NativeWind (Tailwind CSS for React Native)
* **Drawing & Graphics**: React Native Skia
* **Animations**: Lottie, React Native Reanimated
* **API Client**: Axios
* **Local Storage**: Async Storage
* **Authentication**: Google Sign-in, JWT Decode
* **Schema Validation**: Zod
* **Internationalization**: i18next

## Authors

- **[Tomasz Jaskólski](https://github.com/Tomek4861)**
- **[Tomasz Milewski](https://github.com/tommilewski)**
- **[Michał Górniak](https://github.com/przyjaciel-placek)**