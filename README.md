# JellyFire

A React-based web application that helps users assess and predict their burnout risk through an intelligent questionnaire and analysis system.

## Overview

JellyFire is an interactive tool designed to help individuals identify early signs of burnout and receive personalized insights. Using AI-powered analysis, the application provides users with actionable feedback and resources to manage stress and maintain mental well-being.

## Features

- **Interactive Assessment**: Comprehensive questionnaire to evaluate burnout risk factors
- **AI-Powered Analysis**: Intelligent evaluation of responses using Gemini API
- **Personalized Insights**: Tailored recommendations based on individual assessment results
- **User-Friendly Interface**: Clean, intuitive design for easy navigation
- **Real-time Results**: Instant feedback and burnout risk scoring

## Tech Stack

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **API Integration**: Gemini API for AI-powered analysis

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/MinhDung1604/jlfish_5.git
cd jlfish_5
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local` to your root directory
   - Add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Launch the application
2. Complete the burnout assessment questionnaire
3. Submit your responses for analysis
4. Review your personalized burnout risk report
5. Explore recommended resources and coping strategies

## Project Structure

```
├── components/          # React components
├── services/           # API services and business logic
├── App.tsx            # Main application component
├── index.tsx          # Application entry point
├── types.ts           # TypeScript type definitions
├── vite.config.ts     # Vite configuration
└── tsconfig.json      # TypeScript configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Powered by Google's Gemini API
- Built with React and Vite
- Designed to promote mental health awareness

## Contact

For questions or feedback, please open an issue on GitHub.

---

**Note**: This tool is for informational purposes only and should not replace professional mental health advice. If you're experiencing severe burnout symptoms, please consult with a healthcare professional.
